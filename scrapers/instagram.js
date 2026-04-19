const axios   = require('axios')
const cheerio = require('cheerio')

async function instagram(url) {
  if (!url) throw new Error('Parameter url wajib diisi')

  try {
    const { data } = await axios.post(
      'https://yt1s.io/api/ajaxSearch',
      new URLSearchParams({ q: url, w: '', p: 'home', lang: 'en' }),
      {
        headers: {
          'Accept':       '*/*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin':       'https://yt1s.io',
          'Referer':      'https://yt1s.io/',
          'User-Agent':   'Postify/1.0.0',
        },
      }
    )

    if (data.status !== 'ok') throw new Error('API Error')

    const $      = cheerio.load(data.data)
    const result = $('a.abutton').map((_, b) => {
      const href       = $(b).attr('href')
      const text       = $(b).text().toLowerCase()
      const titleAttr  = $(b).attr('title') || ''
      const titleLower = titleAttr.toLowerCase()

      if (!href) return null

      let type = 'mp4'
      if (
        text.includes('photo') ||
        text.includes('image') ||
        titleLower.includes('thumbnail') ||
        href.match(/\.(jpeg|jpg|png|webp)/i)
      ) {
        type = 'photo'
      }

      return {
        title:   titleAttr || 'Instagram Media',
        url:     href,
        type:    type,
        quality: 'Auto',
      }
    }).get().filter(item => item !== null)

    if (result.length === 0) throw new Error('No media found')

    return result
  } catch (e) {
    throw new Error('Gagal mengambil data Instagram. Pastikan akun tidak privat.')
  }
}

module.exports = instagram
