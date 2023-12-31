# Brook
<img src="https://github.com/wang-owen/Brook/assets/69203168/6fe89c73-76af-4b9f-bcf5-5f6a4299bb0e" align="right"
     alt="Brook logo">

Brook is a web app which allows users to download YouTube and Spotify tracks as well as entire playlists.
* Users may create accounts and save playlists
* Playlists are automatically added to *Recent Playlists* when downloaded as long as user is logged in
* Added playlists keep track of new and removed tracks since its last update
* When watched playlists are updated, a zip file containing any new tracks are downloaded.

*Try it here:* https://brook-app-d889b0c7d9da.herokuapp.com/

# Usage
Clone the repository
```
git clone https://github.com/wang-owen/Brook.git
```

cd into the project directory and install requirements
```
pip install -r requirements.txt
```
Add your YouTube API and Spotify Client ID and Secret to your environment variables

Run the command
```
python manage.py runserver
```

Go to `http://127.0.0.1:8000/` in your browser
