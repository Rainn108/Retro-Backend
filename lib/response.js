// Helper untuk format response yang konsisten
const ok  = (res, result) => res.json({ status: true,  creator: 'Retro API', result })
const err = (res, msg, code = 400) => res.status(code).json({ status: false, creator: 'Retro API', message: msg })

module.exports = { ok, err }
