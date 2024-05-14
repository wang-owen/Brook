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
    handlePlaylistRemove: (removedPlaylistID: string) => void;
}) => {
    const [showInput, setShowInput] = useState(false);
    const [watchLink, setWatchLink] = useState("");

    const watchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        watchPlaylist(watchLink);

        return;
    };

    const [inputHover, setInputHover] = useState(false);
    const formClass = `bg-gray-900 rounded-lg p-3 py-2 shadow-2xl w-${
        inputHover ? "1/2" : "1/5"
    } duration-1000`;
    const inputClass = `absolute h-0 mt-9 w-${
        inputHover ? "full" : "0"
    } border-white border-b-2 hover:w-full duration-1000 ease-in-out`;

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
                            <form onSubmit={watchSubmit} className={formClass}>
                                <div className="relative flex justify-between items-center mx-5 my-2">
                                    <input
                                        className="bg-transparent text-white w-full border-none focus:outline-none"
                                        type="url"
                                        name="link"
                                        placeholder="YouTube/Spotify Playlist URL"
                                        onChange={(event) => {
                                            setWatchLink(event.target.value);
                                        }}
                                        onMouseOver={() => {
                                            setInputHover(!inputHover);
                                        }}
                                        onMouseOut={() => {
                                            setInputHover(!inputHover);
                                        }}
                                    />
                                    <div className={inputClass}></div>
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
