import SavedPlaylist from "./SavedPlaylist";
import Playlist from "../interfaces/Playlist";

const SavedPlaylists = ({
    playlists,
    handlePlaylistUpdate,
    handlePlaylistRemove,
}: {
    playlists: Playlist[];
    handlePlaylistUpdate: (updatedPlaylist: Playlist) => void;
    handlePlaylistRemove: (removedPlaylistId: string) => void;
}) => {
    return (
        <>
            <section>
                <div className="grid grid-cols-4 gap-4 justify-evenly justify-items-center items-center content-center">
                    {playlists.map((playlist) => (
                        <SavedPlaylist
                            key={playlist.playlist_id}
                            playlist={playlist}
                            onUpdate={handlePlaylistUpdate}
                            onRemove={handlePlaylistRemove}
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

export default SavedPlaylists;
