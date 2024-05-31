import Cookies from "js-cookie";
import Playlist from "../interfaces/Playlist";
import { Id, toast } from "react-toastify";

const SavedPlaylist = ({
    playlist,
    pollTaskStatus,
    brew,
    onUpdate,
    onRemove,
}: {
    playlist: Playlist;
    pollTaskStatus: (
        taskID: string,
        toastID: Id
    ) => Promise<boolean | undefined>;
    brew: (link: string) => any;
    onUpdate: (updatedPlaylist: Playlist) => void;
    onRemove: (removedPlaylistID: string) => void;
}) => {
    const download = async () => {
        // Update position of playlist
        onUpdate(brew(playlist.link.toString()));
    };

    const update = async () => {
        const toastID = toast.loading(
            `${String.fromCodePoint(0x1f3bb)} Brewing music...`
        );

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/playlist/${playlist.playlist_id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }
        );

        let data: any = null;
        if (response.ok) {
            if (response.headers.get("Content-Type") !== null) {
                data = await response.json();
            }
            if (data.task_id) {
                // Wait for brew result
                const brewSuccess = await pollTaskStatus(data.task_id, toastID);
                if (brewSuccess) {
                    onUpdate(data.playlist_data);
                }
            }
        }
    };

    const remove = async () => {
        const response = await toast.promise(
            fetch(
                `${import.meta.env.VITE_API_URL}/playlist/${
                    playlist.playlist_id
                }`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": Cookies.get("csrftoken") || "",
                    },
                    credentials: "include",
                }
            ),
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
