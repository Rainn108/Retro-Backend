const router = require('express').Router()
const { ok, err } = require('../lib/response')

// POST /api/upload  { file_url }
router.post('/', async (req, res) => {
  const { file_url } = req.body
  if (!file_url) return err(res, 'Parameter file_url wajib diisi')
  // TODO: implementasi upload ke storage
  err(res, 'Upload belum diimplementasikan', 501)
})

module.exports = router
