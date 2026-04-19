# Retro API — Backend

REST API backend untuk Retro API. Deploy terpisah dari frontend.

## Deploy ke Vercel

### 1. Push folder `api/` ke GitHub repo baru

```bash
cd api
git init
git add .
git commit -m "init: retro api backend"
git remote add origin https://github.com/USERNAME/retro-api-backend.git
git push -u origin main
```

### 2. Connect ke Vercel

- Buka [vercel.com](https://vercel.com) → New Project
- Import repo `retro-api-backend`
- Framework: **Other**
- Root Directory: `.` (biarkan default)
- Klik Deploy

### 3. Update BASE_URL di frontend

Setelah dapat URL Vercel (misal `https://retro-api-backend.vercel.app`), update di:

`src/components/pages/Endpoints.jsx` baris 4:
```js
const BASE_URL = 'https://retro-api-backend.vercel.app'
```

## Jalankan Lokal

```bash
npm install
npm run dev     # dengan nodemon (auto-reload)
npm start       # production
```

Server berjalan di `http://localhost:3000`

## Endpoints

| Method | Path | Params |
|--------|------|--------|
| GET | `/api/download/ytmp3` | `url`, `bitrate` |
| GET | `/api/download/ytmp4` | `url`, `quality` |
| GET | `/api/ytsearch` | `q`, `limit` |
| GET | `/api/download/instagram` | `url` |
| GET | `/api/download/twitter` | `url` |
| GET | `/api/download/tiktok` | `url` |
| GET | `/api/download/facebook` | `url` |
| GET | `/api/download/threads` | `url` |
| GET | `/api/download/spotify` | `url` |
| GET | `/api/download/pinterest` | `url` |
| POST | `/api/ai/removebg` | `image_url` |
| POST | `/api/ai/brat` | `text` |
| POST | `/api/ai/hdr` | `image_url` |
| POST | `/api/ai/remini` | `image_url` |
| POST | `/api/ai/upscale` | `image_url` |

## Response Format

Semua endpoint return format yang sama:

```json
{
  "status": true,
  "creator": "Retro API",
  "result": { ... }
}
```

Error:
```json
{
  "status": false,
  "creator": "Retro API",
  "message": "Pesan error"
}
```
