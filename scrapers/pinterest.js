const axios   = require('axios')
const cheerio = require('cheerio')

const CONFIG = {
  BASE_URL:  'https://pindown.cc',
  ENDPOINTS: { HOME: '/en/', DOWNLOAD: '/en/download' },
  HEADERS: {
    'User-Agent':                'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Encoding':           'gzip, deflate, br',
    'Cache-Control':             'max-age=0',
    'Upgrade-Insecure-Requests': '1',
    'Origin':                    'https://pindown.cc',
    'Referer':                   'https://pindown.cc/en/',
    'Sec-Fetch-Site':            'same-origin',
    'Sec-Fetch-Mode':            'navigate',
    'Sec-Fetch-Dest':            'document',
    'Priority':                  'u=0, i',
  },
}

const clean = s => s ? s.replace(/\s+/g, ' ').trim() : ''

async function pinterest(url) {
  if (!url) throw new Error('Parameter url wajib diisi')

  try {
    // 1. Ambil CSRF token + cookie
    const homeRes = await axios.get(CONFIG.BASE_URL + CONFIG.ENDPOINTS.HOME, {
      headers: CONFIG.HEADERS,
    })

    const cookies       = homeRes.headers['set-cookie']
    const sessionCookie = cookies ? cookies.join('; ') : ''
    const $home         = cheerio.load(homeRes.data)
    const csrfToken     = $home('input[name="csrf_token"]').val()

    if (!csrfToken) throw new Error('Gagal mendapatkan CSRF Token.')

    // 2. POST download
    const dlRes = await axios.post(
      CONFIG.BASE_URL + CONFIG.ENDPOINTS.DOWNLOAD,
      new URLSearchParams({ csrf_token: csrfToken, url }),
      {
        headers: {
          ...CONFIG.HEADERS,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie':       sessionCookie,
          'Referer':      CONFIG.BASE_URL + CONFIG.ENDPOINTS.HOME,
        },
      }
    )

    const $ = cheerio.load(dlRes.data)

    const alertErr = $('.alert-danger').text()
    if (alertErr) throw new Error(clean(alertErr))

    const box = $('.square-box')
    if (box.length === 0) throw new Error('Konten tidak ditemukan atau URL tidak valid.')

    const result = {
      title:     clean(box.find('.font-weight-bold').text()),
      duration:  clean(box.find('.text-muted').text()) || null,
      thumbnail: box.find('.square-box-img img').attr('src'),
      medias:    [],
    }

    box.find('.square-box-btn a').each((_, el) => {
      const link = $(el).attr('href')
      const text = clean($(el).text())

      let type = 'unknown'
      if (text.includes('Video'))      type = 'video'
      else if (text.includes('Image')) type = 'image'
      else if (text.includes('GIF'))   type = 'gif'

      let ext = 'jpg'
      if (link.includes('.mp4'))      ext = 'mp4'
      else if (link.includes('.gif')) ext = 'gif'
      else if (link.includes('.png')) ext = 'png'

      result.medias.push({
        type,
        extension: ext,
        quality:   text.replace('Download ', ''),
        url:       link,
      })
    })

    return result
  } catch (e) {
    throw new Error(e.message || 'Failed to fetch Pinterest data.')
  }
}

module.exports = pinterest
