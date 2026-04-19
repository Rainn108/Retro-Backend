const express = require('express')
const cors    = require('cors')
const app     = express()

app.use(cors())
app.use(express.json())

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
