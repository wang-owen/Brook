# Brook

Brook offers a variety of tools for YouTube and Spotify.
* Download tracks and entire playlists from YouTube and Spotify
* Saved playlists track any changes made to the playlist (e.g. added/removed tracks, name change, thumbnail change etc.)
* When saved playlists are "updated", a zip file containing any new tracks are downloaded.
* Convert (transfer) your playlists between music streaming services

---

## 📝 To-do
- Refactor database so tracks have a many-to-many relationship with playlists instead of Foreign Key (saves database space)
- Add a download ETA to toast
- Disable queueing more downloads as one is occurring
- Implement "Public playlists" page, where users can opt to share their saved playlists publically

## ✍️ Contributing
1. Fork this repository
2. Create a `.env` file in the `client` root directory and add the following:
     * `VITE_API_URL=http://127.0.0.1:8000`
     * `VITE_AWS_ACCESS_KEY_ID=<your aws access key id>`
     * `VITE_AWS_SECRET_ACCESS_KEY=<your aws secret access key>`
     * `VITE_SPOTIFY_CLIENT_ID=<your spotify client id>`
4. Create a `.env` file in the `server` root directory and add the following:
     * `DJANGO_DEBUG=1`
     * `YOUTUBE_API_KEY=<your youtube data api key>`
     * `SPOTIFY_CLIENT_ID=<your spotify client id>`
     * `SPOTIFY_CLIENT_SECRET<your spotify client secret`
     * `AWS_ACCESS_KEY_ID=<your aws access key id>`
     * `AWS_SECRET_ACCESS_KEY=<your aws secret access key>`
     * `USE_SQLITE=1`
5. In your terminal, `cd` into `Brook/client` and run the following:
     1. `npm install`
     2. `npm run dev`
6. In another terminal window, `cd` into `Brook/server` and run the following:
     1. `pip install -r requirements.txt`
     2. `python manage.py migrate`
     3. `python manage.py runserver 127.0.0.1:8000`
7. Create a pull request after making your changes
