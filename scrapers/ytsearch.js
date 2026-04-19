const axios   = require('axios')
const headers = require('../lib/headers')

/**
 * Search YouTube videos
 * @param {string} query - keyword pencarian
 * @param {number} limit - jumlah hasil (max 20)
 */
async function ytsearch(query, limit = 10) {
  if (!query) throw new Error('Parameter q wajib diisi')

  const res = await axios.get('https://www.youtube.com/results', {
    params: { search_query: query },
    headers: headers.browser,
  })

  // Parse ytInitialData dari HTML
  const match = res.data.match(/var ytInitialData = ({.+?});/)
  if (!match) throw new Error('Gagal parse data YouTube')

  const data    = JSON.parse(match[1])
  const contents = data?.contents
    ?.twoColumnSearchResultsRenderer
    ?.primaryContents
    ?.sectionListRenderer
    ?.contents?.[0]
    ?.itemSectionRenderer
    ?.contents || []

  const results = []
  for (const item of contents) {
    const v = item.videoRenderer
    if (!v) continue

    results.push({
      title:     v.title?.runs?.[0]?.text || '',
      url:       `https://youtube.com/watch?v=${v.videoId}`,
      videoId:   v.videoId,
      thumbnail: v.thumbnail?.thumbnails?.at(-1)?.url || '',
      duration:  v.lengthText?.simpleText || '',
      views:     v.viewCountText?.simpleText || '',
      channel:   v.ownerText?.runs?.[0]?.text || '',
      published: v.publishedTimeText?.simpleText || '',
    })

    if (results.length >= limit) break
  }

  return results
}

module.exports = ytsearch
