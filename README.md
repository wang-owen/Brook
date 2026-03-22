# Brook

A full-stack web app for downloading, managing, and converting music playlists across YouTube and Spotify.

## Features

**Download** — Paste a YouTube or Spotify link to download individual tracks or entire playlists as audio files (M4A, MP3, WAV, OPUS, FLAC). Playlists are zipped automatically.

**Saved Playlists** — Save playlists to track changes over time. When a saved playlist is updated, Brook detects added and removed tracks and lets you download just the new ones as a zip.

**Convert** — Transfer playlists between YouTube Music and Spotify. Authenticate with OAuth, select a playlist, and Brook recreates it on the other platform.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, DaisyUI
- **Backend:** Django, Django REST Framework
- **Task Queue:** Celery with RabbitMQ (AMQP)
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Audio:** yt-dlp, ffmpeg

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- [ffmpeg](https://ffmpeg.org/download.html)
- [RabbitMQ](https://www.rabbitmq.com/docs/download) (required for async downloads via Celery)

### API Keys

You'll need credentials from the following services:

- [YouTube Data API v3](https://console.cloud.google.com/) — API key + OAuth 2.0 client ID/secret
- [Spotify Web API](https://developer.spotify.com/dashboard) — client ID/secret

### Setup

**1. Client**

Create `client/.env`:
```
VITE_API_URL=http://127.0.0.1:8000
VITE_USE_LOCAL_DOWNLOADS=true
VITE_MAINTENANCE=false
VITE_YOUTUBE_CLIENT_ID=<your youtube oauth client id>
VITE_SPOTIFY_CLIENT_ID=<your spotify client id>
```

```sh
cd client
npm install
npm run dev
```

**2. Server**

Create `server/.env`:
```
DJANGO_DEBUG=1
USE_SQLITE=1
YOUTUBE_API_KEY=<your youtube data api key>
YOUTUBE_CLIENT_ID=<your youtube oauth client id>
YOUTUBE_CLIENT_SECRET=<your youtube oauth client secret>
SPOTIFY_CLIENT_ID=<your spotify client id>
SPOTIFY_CLIENT_SECRET=<your spotify client secret>
```

```sh
cd server
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

**3. Celery Worker** (in a separate terminal)

```sh
cd server
celery -A server worker -l INFO
```

The client runs at `http://127.0.0.1:3000` and the server at `http://127.0.0.1:8000`.
