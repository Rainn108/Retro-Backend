const axios   = require('axios')
const headers = require('../lib/headers')

const CNV_BASE = 'https://cnv.cx/v2'

async function getKey() {
  const res = await axios.get(`${CNV_BASE}/sanity/key`, { headers: headers.y2meta })
  if (!res.data?.key) throw new Error('Gagal mendapatkan key konversi')
  return res.data.key
}

/**
 * Download YouTube video sebagai MP3
 * @param {string} url      - URL YouTube
 * @param {number} bitrate  - 128 atau 320
 */
async function ytmp3(url, bitrate = 128) {
  if (!url) throw new Error('Parameter url wajib diisi')

  const key = await getKey()

  const params = new URLSearchParams()
  params.append('link',          url)
  params.append('format',        'mp3')
  params.append('audioQuality',  bitrate.toString())
  params.append('filenameStyle', 'pretty')

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
    bitrate:  `${bitrate}kbps`,
    format:   'mp3',
    raw:      data,
  }
}

module.exports = ytmp3
