const router = require('express').Router()
const { ok, err } = require('../lib/response')

// POST /api/ai/removebg  { image_url }
router.post('/removebg', async (req, res) => {
  const { image_url } = req.body
  if (!image_url) return err(res, 'Parameter image_url wajib diisi')
  // TODO: tambahkan scraper removebg
  err(res, 'Scraper RemoveBG belum diimplementasikan', 501)
})

// POST /api/ai/brat  { text }
router.post('/brat', async (req, res) => {
  const { text } = req.body
  if (!text) return err(res, 'Parameter text wajib diisi')
  // TODO: tambahkan scraper brat
  err(res, 'Scraper Brat belum diimplementasikan', 501)
})

// POST /api/ai/hdr  { image_url }
router.post('/hdr', async (req, res) => {
  const { image_url } = req.body
  if (!image_url) return err(res, 'Parameter image_url wajib diisi')
  err(res, 'Scraper HDR belum diimplementasikan', 501)
})

// POST /api/ai/remini  { image_url }
router.post('/remini', async (req, res) => {
  const { image_url } = req.body
  if (!image_url) return err(res, 'Parameter image_url wajib diisi')
  err(res, 'Scraper Remini belum diimplementasikan', 501)
})

// POST /api/ai/upscale  { image_url }
router.post('/upscale', async (req, res) => {
  const { image_url } = req.body
  if (!image_url) return err(res, 'Parameter image_url wajib diisi')
  err(res, 'Scraper Upscale belum diimplementasikan', 501)
})

module.exports = router
