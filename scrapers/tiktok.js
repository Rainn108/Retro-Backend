const axios = require('axios')

function formatNumber(n) {
  return Number(parseInt(n)).toLocaleString().replace(/,/g, '.')
}

function formatDate(n, locale = 'en') {
  return new Date(n).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
  })
}

async function tiktok(url) {
  if (!url) throw new Error('Parameter url wajib diisi')

  try {
    const res = await axios.post(
      'https://www.tikwm.com/api/',
      {},
      {
        headers: {
          'Accept':          'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type':    'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin':          'https://www.tikwm.com',
          'Referer':         'https://www.tikwm.com/',
          'User-Agent':      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: { url, hd: 1 },
      }
    )

    const d = res.data.data
    if (!d) throw new Error('No data returned')

    const data = []

    // Slide / photo mode
    if (!d.size && !d.wm_size && !d.hd_size && d.images) {
      d.images.forEach(v => data.push({ type: 'photo', url: v }))
    } else {
      if (d.wmplay)  data.push({ type: 'watermark',      url: d.wmplay,  quality: 'SD'  })
      if (d.play)    data.push({ type: 'nowatermark',     url: d.play,    quality: 'HD'  })
      if (d.hdplay)  data.push({ type: 'nowatermark_hd',  url: d.hdplay,  quality: 'FHD' })
      if (d.music || d.music_info?.play) {
        data.push({ type: 'audio', url: d.music || d.music_info.play, quality: 'Audio' })
      }
    }

    return {
      title:       d.title,
      taken_at:    formatDate(d.create_time).replace('1970', ''),
      region:      d.region,
      id:          d.id,
      duration:    `${d.duration} Seconds`,
      cover:       d.cover,
      size_wm:     d.wm_size,
      size_nowm:   d.size,
      size_nowm_hd: d.hd_size,
      data,
      music_info: {
        id:     d.music_info?.id,
        title:  d.music_info?.title,
        author: d.music_info?.author,
        album:  d.music_info?.album || null,
        url:    d.music || d.music_info?.play,
      },
      stats: {
        views:    formatNumber(d.play_count),
        likes:    formatNumber(d.digg_count),
        comment:  formatNumber(d.comment_count),
        share:    formatNumber(d.share_count),
        download: formatNumber(d.download_count),
      },
      author: {
        id:       d.author?.id,
        fullname: d.author?.unique_id,
        nickname: d.author?.nickname,
        avatar:   d.author?.avatar,
      },
    }
  } catch (e) {
    throw new Error('Failed to fetch TikTok data.')
  }
}

module.exports = tiktok
