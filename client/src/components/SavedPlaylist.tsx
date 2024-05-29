import Cookies from "js-cookie";
import Playlist from "../interfaces/Playlist";
import { toast } from "react-toastify";

const SavedPlaylist = ({
    playlist,
    brew,
    onUpdate,
    onRemove,
}: {
    playlist: Playlist;
    brew: (link: string) => any;
    onUpdate: (updatedPlaylist: Playlist) => void;
    onRemove: (removedPlaylistID: string) => void;
}) => {
    const download = async () => {
        // Update position of playlist
        onUpdate(brew(playlist.link.toString()));
    };

    const update = async () => {
        let data: any = null;
        toast.promise(
            fetch(`${import.meta.env.VITE_API_URL}/playlist/${playlist.playlist_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }).then(async (response) => {
                if (response.ok) {
                    if (response.headers.get("Content-Type") !== null) {
                        data = await response.json();
                    }
                    if (data.path) {
                        window.location.href =
                            `${import.meta.env.VITE_API_URL}/download/` + data.path;
                    }
                }
            }),
            {
                pending: "Updating playlist...",
                success: {
                    render() {
                        onUpdate(data.playlist_data);
                        return (
                            <div>
                                {String.fromCodePoint(0x1f3a7)} Playlist
                                updated!
                                {data.path ? (
                                    <button
                                        className="m-2 px-2 border rounded-md"
                                        onClick={() => {
                                            window.location.href =
                                                `${import.meta.env.VITE_API_URL}/download/` +
                                                data.path;
                                        }}
                                    >
                                        Retry
                                    </button>
                                ) : null}
                            </div>
                        );
                    },
                },
                error: "Playlist does not exist",
            }
        );
    };

    const remove = async () => {
        const response = await toast.promise(
            fetch(`${import.meta.env.VITE_API_URL}/playlist/${playlist.playlist_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }),
            {
                pending: "Removing playlist...",
                success: `${String.fromCodePoint(0x1f4a3)} Playlist removed`,
            }
        );

        if (response.ok) {
            // Remove playlist from parent component
            onRemove(playlist.playlist_id);
        }
    };

    const buttonClass =
        "inline-block bg-gray-200 hover:bg-gray-300 duration-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 hover:text-gray-800 mr-2 mb-2";
    return (
        <>
            <div className="max-w-sm rounded shadow-lg bg-white animate-fadeInFromLeft">
                <a href={playlist.link.toString()} target="_blank">
                    <img
                        className="w-full"
                        src={playlist.thumbnail.toString()}
                        key={playlist.thumbnail.toString()}
                        alt={`${playlist.name} thumbnail`}
                    />
                    <div className="px-6 pt-4 pb-2 text-center font-semibold">
                        <span>{playlist.name}</span>
                    </div>
                </a>
                <div className="px-6 pt-4 pb-2 text-center">
                    <span className={buttonClass}>
                        <button onClick={download}>Download</button>
                    </span>
                    <span className={buttonClass}>
                        <button onClick={update}>Update</button>
                    </span>
                    <span className={buttonClass}>
                        <button onClick={remove}>Remove</button>
                    </span>
                </div>
            </div>
        </>
    );
};

export default SavedPlaylist;
