import { useState } from "react";
import { Id } from "react-toastify";
import SavedPlaylist from "./SavedPlaylist";
import Playlist from "../interfaces/Playlist";

const SavedPlaylists = ({
    playlists,
    pollTaskStatus,
    brew,
    watchPlaylist,
    handlePlaylistUpdate,
    handlePlaylistRemove,
}: {
    playlists: Playlist[];
    pollTaskStatus: (
        taskID: string,
        toastID: Id
    ) => Promise<boolean | undefined>;
    brew: (link: string) => any;
    watchPlaylist: (link: string) => void;
    handlePlaylistUpdate: (updatedPlaylist: Playlist) => void;
    handlePlaylistRemove: (removedPlaylistID: string) => void;
}) => {
    const [watchLink, setWatchLink] = useState("");

    const watchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        watchPlaylist(watchLink);

        // Clear input field
        const inputElement = document.getElementById("watch-input");
        if (inputElement) {
            (inputElement as HTMLInputElement).value = "";
        }

        setWatchLink("");
        return;
    };

    return (
        <>
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 justify-evenly justify-items-center items-center content-center animate-fadeInFromLeft">
                    {playlists.map((playlist) => (
                        <SavedPlaylist
                            key={playlist.playlist_id}
                            pollTaskStatus={pollTaskStatus}
                            playlist={playlist}
                            brew={brew}
                            onUpdate={handlePlaylistUpdate}
                            onRemove={handlePlaylistRemove}
                        />
                    ))}
                </div>
                <div className="my-10 text-center">
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                const watchModal = document.getElementById(
                                    "watchModal"
                                ) as HTMLDialogElement;
                                if (watchModal) {
                                    watchModal.showModal();
                                }
                            }}
                            className="btn btn-circle m-4"
                        >
                            +
                        </button>
                        <dialog id="watchModal" className="modal">
                            <div className="modal-box">
                                <form method="dialog">
                                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                        ✕
                                    </button>
                                </form>
                                <form onSubmit={watchSubmit} method="dialog">
                                    <input
                                        onChange={(event) => {
                                            setWatchLink(event.target.value);
                                        }}
                                        type="url"
                                        placeholder="YouTube/Spotify Playlist URL"
                                        id="watch-input"
                                        className="input input-bordered input-primary w-full max-w-xs mr-6"
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary mr-4"
                                        onClick={() => {
                                            const watchModal =
                                                document.getElementById(
                                                    "watchModal"
                                                ) as HTMLDialogElement;
                                            if (watchModal) {
                                                watchModal.close();
                                            }
                                        }}
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>
                        </dialog>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SavedPlaylists;
