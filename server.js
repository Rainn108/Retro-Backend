const express = require('express')
const cors    = require('cors')
const app     = express()

app.use(cors())
app.use(express.json())

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/download', require('./routes/download'))
app.use('/api/ai',       require('./routes/ai'))
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/users',    require('./routes/users'))
app.use('/api/upload',   require('./routes/upload'))

// ytsearch sebagai route terpisah
app.get('/api/ytsearch', async (req, res) => {
  const { q, limit = 10 } = req.query
  const { ok, err } = require('./lib/response')
  if (!q) return err(res, 'Parameter q wajib diisi')
  try {
    const ytsearch = require('./scrapers/ytsearch')
    const result   = await ytsearch(q, Number(limit))
    ok(res, result)
  } catch (e) {
    err(res, e.message, 500)
  }
})

// ── Health check ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: true,
    creator: 'Retro API',
    message: 'API is running',
    version: '1.0.0',
    endpoints: [
      'GET  /api/download/ytmp3?url=',
      'GET  /api/download/ytmp4?url=&quality=720',
      'GET  /api/ytsearch?q=',
      'GET  /api/download/instagram?url=',
      'GET  /api/download/twitter?url=',
      'GET  /api/download/threads?url=',
      'GET  /api/download/facebook?url=',
      'GET  /api/download/spotify?url=',
      'GET  /api/download/pinterest?url=',
      'GET  /api/download/tiktok?url=',
      'POST /api/ai/removebg',
      'POST /api/ai/brat',
      'POST /api/ai/hdr',
      'POST /api/ai/remini',
      'POST /api/ai/upscale',
    ]
  })
})

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: false, creator: 'Retro API', message: 'Endpoint not found' })
})

// ── Error handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ status: false, creator: 'Retro API', message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Retro API running on port ${PORT}`))
