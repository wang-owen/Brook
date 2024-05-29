# Brook
<img src="https://github.com/wang-owen/Brook/assets/69203168/6fe89c73-76af-4b9f-bcf5-5f6a4299bb0e" align="right"
     alt="Brook logo">

Brook is a web app which allows users to download and save YouTube and Spotify tracks and entire playlists.
* Users may create accounts and save playlists
* Playlists are automatically added to *Saved Playlists* when downloaded as long as user is logged in
* Saved playlists track any changes made to the playlist (e.g. added/removed tracks, name change, thumbnail change etc.)
* When saved playlists are "updated", a zip file containing any new tracks are downloaded.

**This is meant for those who do not wish to pay for a music streaming subscription, and want an easy way to download their online playlists onto their phones.**

💻 *Try it here:* [brook.wangowen.com](https://brook.wangowen.com)


> ⚠️ This web app is not intended for mobile devices and thus has not been tested for it
---

## 🪲 Known issues
- [ ] Downloads that take over 30 seconds initiate a Heroku timeout (not an issue when running locally)

## 📝 To-do
- [ ] Add a download ETA to toast
- [ ] Implement "Public playlists" page, where users can opt to share their saved playlists publically
- [ ] Save database space by reusing playlist/track models when possible (i.e. playlists/tracks with same ID mapped to multiple users)
- [ ] Integrate Apple Music and Amazon Music
- [ ] Enable playlist conversion between platforms
- [ ] Desktop app that automatically manages file transfers?

## ✍️ Contributing
1. Fork this repository
2. Create a `.env` file in the `client` root directory and add `VITE_API_URL=http://127.0.0.1:8000`
3. Create a `.env` file in the `server` root directory and add the following:
     * `DJANGO_DEBUG=1`
     * `YOUTUBE_API_KEY=<your youtube data api key>`
     * `SPOTIFY_CLIENT_ID=<your spotify client id>`
     * `SPOTIFY_CLIENT_SECRET<your spotify client secret`
4. In your terminal, `cd` into `Brook/client` and run the following:
     1. `npm install`
     2. `npm run dev`
6. In another terminal window, `cd` into `Brook/server` and run the following:
     1. `pip install -r requirements.txt`
     2. `python manage.py migrate`
     3. `python manage.py runserver 127.0.0.1:8000`
7. Create a pull request after making your changes
