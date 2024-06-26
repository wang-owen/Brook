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
- [x] **[FIXED]** Saved playlists will be duplicated if downloaded from main form
- [x] **[FIXED]** Spotify bug where some songs are not downloaded and/or saved to duplicate file names
- [x] **[FIXED]** CloudAMQP instance downloads files successfully, but files cannot be found on Heroku filesystem, resulting in Server Error 500 when attempting to fetch
- [x] **[FIXED]** Downloads that take over 30 seconds initiate a Heroku timeout (not an issue when running locally)

## 📝 To-do
- [ ] Refactor database so tracks have a many-to-many relationship with playlists instead of Foreign Key (saves database space)
- [ ] Add a download ETA to toast
- [ ] Disable queueing more downloads as one is occurring
- [ ] Implement "Public playlists" page, where users can opt to share their saved playlists publically
- [ ] Integrate Apple Music and Amazon Music
- [ ] Enable playlist conversion between platforms
- [ ] Desktop app that automatically manages file transfers?

## ✍️ Contributing
1. Fork this repository
2. Create a `.env` file in the `client` root directory and add the following:
     * `VITE_API_URL=http://127.0.0.1:8000`
     * `VITE_AWS_ACCESS_KEY_ID=<your aws access key id>`
     * `VITE_AWS_SECRET_ACCESS_KEY=<your aws secret access key>`
4. Create a `.env` file in the `server` root directory and add the following:
     * `DJANGO_DEBUG=1`
     * `YOUTUBE_API_KEY=<your youtube data api key>`
     * `SPOTIFY_CLIENT_ID=<your spotify client id>`
     * `SPOTIFY_CLIENT_SECRET<your spotify client secret`
     * `AWS_ACCESS_KEY_ID=<your aws access key id>`
     * `AWS_SECRET_ACCESS_KEY=<your aws secret access key>`
5. In your terminal, `cd` into `Brook/client` and run the following:
     1. `npm install`
     2. `npm run dev`
6. In another terminal window, `cd` into `Brook/server` and run the following:
     1. `pip install -r requirements.txt`
     2. `python manage.py migrate`
     3. `python manage.py runserver 127.0.0.1:8000`
7. Create a pull request after making your changes
