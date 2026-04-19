const axios   = require('axios')
const cheerio = require('cheerio')

const SPOTIFY_BASE_URL  = 'https://spotmate.online'
const SPOTIFY_UA        = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const GENIUS_UA         = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

async function getToken() {
  const res   = await axios.get(SPOTIFY_BASE_URL, { headers: { 'User-Agent': SPOTIFY_UA } })
  const match = res.data.match(/<meta[^>]+(csrf[-_]?token|csrf|csrf_token)[^>]+content=["']([^"']+)["']/)
  if (!match) throw new Error('Token CSRF tidak ditemukan')

  const token  = match[2]
  const cookie = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')
  return { token, cookie }
}

function formatTime(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

async function fetchLyrics(artist, title) {
  try {
    const artistSlug = artist.split(' ').join('-').toLowerCase()
    const titleSlug  = title.split(' ').join('-').toLowerCase()
    const url        = `https://genius.com/${artistSlug}-${titleSlug}-lyrics`

    const { data } = await axios.get(url, {
      headers: { 'User-Agent': GENIUS_UA },
      maxRedirects: 5,
      validateStatus: s => s >= 200 && s < 400,
    }).catch(e => e.response || { data: '' })

    const $          = cheerio.load(data)
    const containers = $('[data-lyrics-container="true"]')
    let lyrics       = ''

    containers.each((_, el) => {
      const html = $(el).html()
      lyrics += html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '') + '\n'
    })

    return lyrics
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .join('\n') || 'Lyrics not found'
  } catch {
    return 'Lyrics not found'
  }
}

function buildCdnUrl(id, title, artist) {
  return `https://cdn-spotify-247.zm.io.vn/download/${id}/track?name=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
}

async function spotify(url) {
  if (!url) throw new Error('Parameter url wajib diisi')

  const { token, cookie } = await getToken()

  const headers = {
    'Content-Type':      'application/json',
    'X-CSRF-TOKEN':      token,
    'Cookie':            cookie,
    'Referer':           `${SPOTIFY_BASE_URL}/`,
    'X-Requested-With':  'XMLHttpRequest',
    'User-Agent':        SPOTIFY_UA,
  }

  const metaRes = await axios
    .post(`${SPOTIFY_BASE_URL}/getTrackData`, { spotify_url: url }, { headers })
    .catch(e => e.response)

  if (!metaRes || metaRes.status !== 200)
    throw new Error('Gagal mengambil data dari Spotify')

  const meta = metaRes.data

  const metadata = {
    title:    meta.name,
    id:       meta.id,
    image:    meta.album?.images?.[0]?.url || null,
    duration: formatTime(meta.duration_ms),
    artist:   meta.artists?.[0]?.name || 'Unknown',
    album:    meta.album?.name || null,
  }

  metadata.lyrics      = await fetchLyrics(metadata.artist, metadata.title)
  metadata.download_url = buildCdnUrl(metadata.id, metadata.title, metadata.artist)

  return metadata
}

module.exports = spotify
