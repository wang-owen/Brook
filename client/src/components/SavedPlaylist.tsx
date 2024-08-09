import Cookies from "js-cookie";
import Playlist from "../interfaces/Playlist";
import { Id, toast } from "react-toastify";
import { FaDownload, FaTrash } from "react-icons/fa6";
import { FaExternalLinkAlt } from "react-icons/fa";
import { RxUpdate } from "react-icons/rx";
import { useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";

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
                // Wait for brew result
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

    const { theme } = useContext(ThemeContext);
    return (
        <div
            className={`card w-72 lg:w-96 hover:shadow-2xl image-full hover:scale-105 ${
                theme === "light" ? "hover:shadow-black" : "hover:shadow-white"
            } duration-200`}
        >
            <figure>
                <img
                    src={playlist.thumbnail.toString()}
                    key={playlist.thumbnail.toString()}
                    alt={`${playlist.name} thumbnail`}
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title text-white">{playlist.name}</h2>
                <p className="text-white">{playlist.owner}</p>
                <div className="card-actions justify-center">
                    <ul className="menu menu-horizontal bg-base-200 rounded-box">
                        <li>
                            <a
                                onClick={download}
                                className="tooltip"
                                data-tip="Download"
                            >
                                <FaDownload />
                            </a>
                        </li>
                        <li>
                            <a
                                onClick={update}
                                className="tooltip"
                                data-tip="Update"
                            >
                                <RxUpdate />
                            </a>
                        </li>
                        <li>
                            <a
                                onClick={remove}
                                className="tooltip"
                                data-tip="Remove"
                            >
                                <FaTrash />
                            </a>
                        </li>
                        <li>
                            <a
                                onClick={() => window.open(playlist.link)}
                                className="tooltip"
                            >
                                <FaExternalLinkAlt />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SavedPlaylist;
