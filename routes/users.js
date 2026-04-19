const router = require('express').Router()
const { ok, err } = require('../lib/response')

// GET /api/users
router.get('/', async (req, res) => {
  // TODO: ambil dari database
  ok(res, [
    { id: 1, name: 'User One', email: 'user1@email.com', created_at: '2026-01-01' },
    { id: 2, name: 'User Two', email: 'user2@email.com', created_at: '2026-01-02' },
  ])
})

module.exports = router
