const admin = require('firebase-admin')

// ── Init Firebase Admin (sekali saja) ────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db       = admin.firestore()
const STATS    = db.collection('stats').doc('global')
const LOGS_COL = db.collection('usage_logs')

// ── In-memory buffer ──────────────────────────────────────────────
// Kumpulkan delta dulu, flush ke Firestore setiap FLUSH_INTERVAL ms
const FLUSH_INTERVAL = 30_000 // 30 detik

let buffer = { requests: 0, success: 0, failed: 0 }
let logQueue = []   // antrian log usage
let flushTimer = null

function startFlushTimer() {
  if (flushTimer) return
  flushTimer = setInterval(flush, FLUSH_INTERVAL)
  // Pastikan timer tidak block proses Node saat shutdown
  if (flushTimer.unref) flushTimer.unref()
}

async function flush() {
  // Ambil snapshot buffer lalu reset
  const delta = { ...buffer }
  const logs  = [...logQueue]
  buffer   = { requests: 0, success: 0, failed: 0 }
  logQueue = []

  if (delta.requests === 0 && logs.length === 0) return

  try {
    const batch = db.batch()

    // ── Update stats (increment) ──────────────────────────────────
    if (delta.requests > 0) {
      batch.set(STATS, {
        requests: admin.firestore.FieldValue.increment(delta.requests),
        success:  admin.firestore.FieldValue.increment(delta.success),
        failed:   admin.firestore.FieldValue.increment(delta.failed),
      }, { merge: true })
    }

    // ── Tulis log usage (max 500 per batch — Firestore limit) ─────
    const chunk = logs.slice(0, 490)
    chunk.forEach(log => {
      const ref = LOGS_COL.doc()
      batch.set(ref, {
        ...log,
        ts: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()
    console.log(`[stats] flushed — req:${delta.requests} ok:${delta.success} fail:${delta.failed} logs:${chunk.length}`)
  } catch (e) {
    // Kembalikan ke buffer kalau gagal
    buffer.requests += delta.requests
    buffer.success  += delta.success
    buffer.failed   += delta.failed
    logQueue.unshift(...logs)
    console.error('[stats] flush error:', e.message)
  }
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Catat satu request ke buffer
 * @param {{ method, path, status, ms, ip }} info
 */
function record({ method, path, status, ms, ip = 'Unknown' }) {
  startFlushTimer()

  const ok = status >= 200 && status < 400
  buffer.requests += 1
  if (ok) buffer.success += 1
  else    buffer.failed  += 1

  // Simpan log (batasi queue max 1000 entry agar tidak OOM)
  if (logQueue.length < 1000) {
    logQueue.push({
      method:   method.toUpperCase(),
      path,
      status,
      ms:       `${ms}ms`,
      provider: ip,
      lib:      'fetch',
      flag:     '🌐',
    })
  }
}

/**
 * Increment visitor (dipanggil dari endpoint /api/visitor)
 */
async function incrementVisitor() {
  try {
    await STATS.set({
      visitors: admin.firestore.FieldValue.increment(1),
    }, { merge: true })
  } catch (e) {
    console.error('[stats] incrementVisitor error:', e.message)
  }
}

// Flush saat proses mau mati
process.on('SIGTERM', async () => { await flush(); process.exit(0) })
process.on('SIGINT',  async () => { await flush(); process.exit(0) })

module.exports = { record, flush, incrementVisitor }
