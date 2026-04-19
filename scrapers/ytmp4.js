const axios   = require('axios')
const headers = require('../lib/headers')

const CNV_BASE = 'https://cnv.cx/v2'

/**
 * Ambil key dari cnv.cx
 */
async function getKey() {
  const res = await axios.get(`${CNV_BASE}/sanity/key`, { headers: headers.y2meta })
  if (!res.data?.key) throw new Error('Gagal mendapatkan key konversi')
  return res.data.key
}

/**
 * Download YouTube video sebagai MP4
 * @param {string} url   - URL YouTube
 * @param {number} quality - 720 atau 1080
 */
async function ytmp4(url, quality = 720) {
  if (!url) throw new Error('Parameter url wajib diisi')
  if (![360, 480, 720, 1080].includes(Number(quality))) {
    throw new Error('Quality harus 360, 480, 720, atau 1080')
  }

  const key = await getKey()

  const params = new URLSearchParams()
  params.append('link',          url)
  params.append('format',        'mp4')
  params.append('videoQuality',  quality.toString())
  params.append('filenameStyle', 'pretty')
  params.append('vCodec',        'h264')

  const res = await axios.post(`${CNV_BASE}/converter`, params, {
    headers: {
      ...headers.y2meta,
      'Content-Type': 'application/x-www-form-urlencoded',
      'key': key,
    }
  })

  const data = res.data
  if (!data) throw new Error('Tidak ada response dari server konversi')

  return {
    url:      data.url      || data.download_url || null,
    filename: data.filename || null,
    quality:  `${quality}p`,
    format:   'mp4',
    raw:      data,
  }
}

module.exports = ytmp4
