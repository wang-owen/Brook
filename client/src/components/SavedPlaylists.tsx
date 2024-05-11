import { useState } from "react";
import SavedPlaylist from "./SavedPlaylist";
import Playlist from "../interfaces/Playlist";

const SavedPlaylists = ({
    playlists,
    watchPlaylist,
    handlePlaylistUpdate,
    handlePlaylistRemove,
}: {
    playlists: Playlist[];
    watchPlaylist: (link: string) => void;
    handlePlaylistUpdate: (updatedPlaylist: Playlist) => void;
    handlePlaylistRemove: (removedPlaylistId: string) => void;
}) => {
    const [showInput, setShowInput] = useState(false);
    const [watchLink, setWatchLink] = useState("");

    const watchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        watchPlaylist(watchLink);

        return;
    };

    return (
        <>
            <section>
                <div className="my-10 text-center">
                    <h1 className="text-3xl">Saved Playlists</h1>
                    <button
                        onClick={() => setShowInput(!showInput)}
                        className="my-5 border border-y-black rounded-lg py-1 px-7 bg-gray-400 hover:bg-gray-500 duration-200 text-white"
                    >
                        Add
                    </button>
                    <div className="flex justify-center">
                        {showInput ? (
                            <form
                                onSubmit={watchSubmit}
                                className="bg-gray-900 rounded-lg p-3 py-2 shadow-2xl w-1/2"
                            >
                                <div className="flex justify-between items-center mx-5 my-2">
                                    <input
                                        className="bg-transparent -none text-gray-700 w-1/5 border-b-2 focus:outline-none focus:w-11/12 duration-200"
                                        type="url"
                                        name="link"
                                        placeholder="YouTube/Spotify Playlist URL"
                                        onChange={(event) => {
                                            setWatchLink(event.target.value);
                                        }}
                                    />
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 -blue-600 hover:-blue-700 duration-200 text-sm -4 text-white rounded-lg float-right px-4 py-2"
                                        type="submit"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        ) : null}
                    </div>
                </div>
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
