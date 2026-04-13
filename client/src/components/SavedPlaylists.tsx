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

        const inputElement = document.getElementById(
            "watch-input"
        ) as HTMLInputElement;
        if (inputElement) {
            inputElement.value = "";
        }

        setWatchLink("");
    };

    return (
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="my-8 flex justify-center">
                <button
                    onClick={() => {
                        const modal = document.getElementById(
                            "watchModal"
                        ) as HTMLDialogElement;
                        if (modal) modal.showModal();
                    }}
                    className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 dark:hover:border-neutral-500 dark:hover:text-neutral-300 transition-colors"
                >
                    +
                </button>
                <dialog
                    id="watchModal"
                    className="backdrop:bg-black/50 bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 max-w-sm w-full"
                >
                    <button
                        onClick={() => {
                            const modal = document.getElementById(
                                "watchModal"
                            ) as HTMLDialogElement;
                            if (modal) modal.close();
                        }}
                        className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    >
                        &times;
                    </button>
                    <h3 className="font-semibold mb-4">Add Playlist</h3>
                    <form onSubmit={watchSubmit}>
                        <input
                            onChange={(event) =>
                                setWatchLink(event.target.value)
                            }
                            type="url"
                            placeholder="YouTube/Spotify Playlist URL"
                            id="watch-input"
                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                        />
                        <button
                            type="submit"
                            className="w-full mt-4 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-80 transition-opacity"
                            onClick={() => {
                                const modal = document.getElementById(
                                    "watchModal"
                                ) as HTMLDialogElement;
                                if (modal) modal.close();
                            }}
                        >
                            Add
                        </button>
                    </form>
                </dialog>
            </div>
        </section>
    );
};

export default SavedPlaylists;
