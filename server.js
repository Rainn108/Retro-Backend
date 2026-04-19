const express = require('express')
const cors    = require('cors')
const stats   = require('./lib/stats')

const app = express()

app.use(cors())
app.use(express.json())

// ── Stats middleware — catat setiap request API ───────────────────
app.use('/api', (req, res, next) => {
  const start = Date.now()
  const ip    = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
             || req.socket?.remoteAddress
             || 'Unknown'

  res.on('finish', () => {
    // Jangan catat endpoint stats itu sendiri
    if (req.path === '/stats' || req.path === '/visitor') return
    stats.record({
      method: req.method,
      path:   req.path,
      status: res.statusCode,
      ms:     Date.now() - start,
      ip,
    })
  })

  next()
})

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/download', require('./routes/download'))
app.use('/api/ai',       require('./routes/ai'))
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/users',    require('./routes/users'))
app.use('/api/upload',   require('./routes/upload'))

// ytsearch
app.get('/api/ytsearch', async (req, res) => {
  const { ok, err } = require('./lib/response')
  const { q, limit = 10 } = req.query
  if (!q) return err(res, 'Parameter q wajib diisi')
  try {
    const result = await require('./scrapers/ytsearch')(q, Number(limit))
    ok(res, result)
  } catch (e) {
    err(res, e.message, 500)
  }
})

// ── Stats endpoints (dibaca frontend) ────────────────────────────

// GET /api/stats — return stats global dari Firestore
app.get('/api/stats', async (req, res) => {
  try {
    const { db } = require('./lib/stats')
    // db tidak di-export, pakai admin langsung
    const admin = require('firebase-admin')
    const snap  = await admin.firestore().collection('stats').doc('global').get()
    res.json({
      status:  true,
      creator: 'Retro API',
      result:  snap.exists ? snap.data() : { requests: 0, success: 0, failed: 0, visitors: 0 },
    })
  } catch (e) {
    res.status(500).json({ status: false, message: e.message })
  }
})

// GET /api/logs?limit=10 — return usage logs terbaru
app.get('/api/logs', async (req, res) => {
  try {
    const admin = require('firebase-admin')
    const limit = Math.min(Number(req.query.limit) || 10, 50)
    const snap  = await admin.firestore()
      .collection('usage_logs')
      .orderBy('ts', 'desc')
      .limit(limit)
      .get()

    const logs = snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        ts: data.ts?.toDate?.()?.toISOString() || null,
      }
    })

    res.json({ status: true, creator: 'Retro API', result: logs })
  } catch (e) {
    res.status(500).json({ status: false, message: e.message })
  }
})

// POST /api/visitor — increment visitor counter
app.post('/api/visitor', async (req, res) => {
  try {
    await stats.incrementVisitor()
    res.json({ status: true, creator: 'Retro API', result: { incremented: true } })
  } catch (e) {
    res.status(500).json({ status: false, message: e.message })
  }
})

// ── Health check ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status:  true,
    creator: 'Retro API',
    message: 'API is running',
    version: '1.0.0',
  })
})

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: false, creator: 'Retro API', message: 'Endpoint not found' })
})

// ── Error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ status: false, creator: 'Retro API', message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Retro API running on port ${PORT}`))
