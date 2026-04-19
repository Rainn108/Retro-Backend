const router  = require('express').Router()
const { ok, err } = require('../lib/response')
const ytmp4   = require('../scrapers/ytmp4')
const ytmp3   = require('../scrapers/ytmp3')
const ytsearch = require('../scrapers/ytsearch')

// ── YouTube ──────────────────────────────────────────────────────

// GET /api/download/ytmp4?url=...&quality=720
router.get('/ytmp4', async (req, res) => {
  const { url, quality = 720 } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  try {
    const result = await ytmp4(url, Number(quality))
    ok(res, result)
  } catch (e) {
    err(res, e.message, 500)
  }
})

// GET /api/download/ytmp3?url=...&bitrate=128
router.get('/ytmp3', async (req, res) => {
  const { url, bitrate = 128 } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  try {
    const result = await ytmp3(url, Number(bitrate))
    ok(res, result)
  } catch (e) {
    err(res, e.message, 500)
  }
})

// GET /api/ytsearch?q=...&limit=10  (dipasang di server.js sebagai /api/ytsearch)
// Tapi juga bisa lewat sini
router.get('/ytsearch', async (req, res) => {
  const { q, limit = 10 } = req.query
  if (!q) return err(res, 'Parameter q wajib diisi')
  try {
    const result = await ytsearch(q, Number(limit))
    ok(res, result)
  } catch (e) {
    err(res, e.message, 500)
  }
})

// ── Placeholder routes (isi scraper sesuai kebutuhan) ────────────

// GET /api/download/instagram?url=...
router.get('/instagram', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  // TODO: tambahkan scraper instagram
  err(res, 'Scraper Instagram belum diimplementasikan', 501)
})

// GET /api/download/twitter?url=...
router.get('/twitter', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  // TODO: tambahkan scraper twitter
  err(res, 'Scraper Twitter belum diimplementasikan', 501)
})

// GET /api/download/tiktok?url=...
router.get('/tiktok', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  // TODO: tambahkan scraper tiktok
  err(res, 'Scraper TikTok belum diimplementasikan', 501)
})

// GET /api/download/facebook?url=...
router.get('/facebook', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  err(res, 'Scraper Facebook belum diimplementasikan', 501)
})

// GET /api/download/threads?url=...
router.get('/threads', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  err(res, 'Scraper Threads belum diimplementasikan', 501)
})

// GET /api/download/spotify?url=...
router.get('/spotify', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  err(res, 'Scraper Spotify belum diimplementasikan', 501)
})

// GET /api/download/pinterest?url=...
router.get('/pinterest', async (req, res) => {
  const { url } = req.query
  if (!url) return err(res, 'Parameter url wajib diisi')
  err(res, 'Scraper Pinterest belum diimplementasikan', 501)
})

module.exports = router
