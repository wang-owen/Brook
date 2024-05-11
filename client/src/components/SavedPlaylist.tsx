import Cookies from "js-cookie";
import Playlist from "../interfaces/Playlist";

const SavedPlaylist = ({
    playlist,
    onUpdate,
    onRemove,
}: {
    playlist: Playlist;
    onUpdate: (updatedPlaylist: Playlist) => void;
    onRemove: (removedPlaylistId: string) => void;
}) => {
    const download = async () => {
        const response = await fetch("http://127.0.0.1:8000/brew/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken") || "",
            },
            body: JSON.stringify({
                link: playlist.link,
                fileFormat: "m4a",
            }),
            credentials: "include",
        });

        let data = null;
        if (response.headers.get("Content-Type") !== null) {
            data = await response.json();
            console.log(data);
        }

        if (response.ok) {
            if (data.path) {
                window.location.href =
                    "http://127.0.0.1:8000/download/" + data.path;
            }
        }
    };
    const update = async () => {
        const response = await fetch(
            `http://127.0.0.1:8000/playlist/${playlist.playlist_id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }
        );

        let data = null;
        if (response.headers.get("Content-Type") !== null) {
            data = await response.json();
            console.log(data);
        }

        if (response.ok) {
            if (data.path) {
                window.location.href =
                    "http://127.0.0.1:8000/download/" + data.path;
            }
        } else {
            // Display error toast
        }
        onUpdate(playlist); // Update the playlist in the parent component
    };
    const remove = async () => {
        const response = await fetch(
            `http://127.0.0.1:8000/playlist/${playlist.playlist_id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }
        );

        if (response.headers.get("Content-Type") === "application/json") {
            const data = await response.json();
            console.log(data);
        }

        if (response.ok) {
            // Display success toast
        } else {
            // Display error toast
        }
        onRemove(playlist.playlist_id); // Remove the playlist from the parent component
    };

    const buttonClass =
        "inline-block bg-gray-200 hover:bg-gray-300 duration-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 hover:text-gray-800 mr-2 mb-2";
    return (
        <>
            <div className="max-w-sm rounded shadow-lg">
                <a href={playlist.link.toString()} target="_blank">
                    <img
                        className="w-full"
                        src={playlist.thumbnail.toString()}
                        alt="Thumbnail"
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
