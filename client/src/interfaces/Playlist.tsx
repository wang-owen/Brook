interface Playlist {
    playlist_id: string;
    name: string;
    owner: string;
    link: URL;
    thumbnail: URL;
    platform: string;
    last_modified: Date;
}

export default Playlist;
