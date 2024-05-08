import SavedPlaylist from "./SavedPlaylist";
import Playlist from "../interfaces/Playlist";

const SavedPlaylists = () => {
    let playlists: Playlist[] = [];
    fetch("/get-playlists", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {
            data.forEach((p: Playlist) => {
                playlists.push({
                    title: p.title,
                    owner: p.owner,
                    thumbnail: p.thumbnail,
                    platform: p.platform,
                });
            });
        });

    return (
        <>
            <section>
                <div className="grid grid-cols-4 gap-4 justify-evenly justify-items-center items-center content-center">
                    {playlists.map((playlist: Playlist) => (
                        <div>
                            <SavedPlaylist {...playlist} />
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default SavedPlaylists;
