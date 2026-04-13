import Cookies from "js-cookie";
import Playlist from "../interfaces/Playlist";
import { Id, toast } from "react-toastify";
import { FaDownload, FaTrash } from "react-icons/fa6";
import { FaExternalLinkAlt } from "react-icons/fa";
import { RxUpdate } from "react-icons/rx";

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
        onUpdate(await brew(playlist.link.toString()));
    };

    const update = async () => {
        const toastID = toast.loading(`Updating playlist...`);

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
                const brewSuccess = await pollTaskStatus(data.task_id, toastID);
                if (brewSuccess) {
                    onUpdate(data.playlist_data);
                }
            } else {
                onUpdate(data.playlist_data);
            }
            toast.update(toastID, {
                render: `${String.fromCodePoint(0x1f3a7)} Updated`,
                type: "success",
                isLoading: false,
                autoClose: 5000,
            });
        }
    };

    const remove = async () => {
        const response = await toast.promise(
            fetch(
                `${import.meta.env.VITE_API_URL}/playlist/${playlist.playlist_id}`,
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
            onRemove(playlist.playlist_id);
        }
    };

    const actionBtnClass =
        "p-2 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors";

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow">
            <img
                src={playlist.thumbnail?.toString()}
                key={playlist.thumbnail?.toString()}
                alt={`${playlist.name} thumbnail`}
                className="w-full h-40 object-cover"
            />
            <div className="p-4">
                <h3 className="font-semibold text-sm truncate">
                    {playlist.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {playlist.owner}
                </p>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                        onClick={download}
                        className={actionBtnClass}
                        title="Download"
                    >
                        <FaDownload size={14} />
                    </button>
                    <button
                        onClick={update}
                        className={actionBtnClass}
                        title="Update"
                    >
                        <RxUpdate size={14} />
                    </button>
                    <button
                        onClick={remove}
                        className={actionBtnClass}
                        title="Remove"
                    >
                        <FaTrash size={14} />
                    </button>
                    <button
                        onClick={() => window.open(playlist.link)}
                        className={actionBtnClass}
                        title="Open link"
                    >
                        <FaExternalLinkAlt size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SavedPlaylist;
