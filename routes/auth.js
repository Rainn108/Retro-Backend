const router = require('express').Router()
const { ok, err } = require('../lib/response')

// POST /api/auth/login  { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return err(res, 'Email dan password wajib diisi')
  // TODO: implementasi auth dengan Firebase Admin SDK
  err(res, 'Auth belum diimplementasikan', 501)
})

// POST /api/auth/register  { email, password }
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return err(res, 'Email dan password wajib diisi')
  err(res, 'Auth belum diimplementasikan', 501)
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  ok(res, { message: 'Logged out successfully' })
})

module.exports = router
