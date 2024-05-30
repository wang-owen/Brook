import { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import BrewHero from "../components/BrewHero";
import SavedPlaylists from "../components/SavedPlaylists";
import Playlist from "../interfaces/Playlist";
import { LoginContext } from "../App.jsx";

const BrewPage = () => {
    const { loggedIn } = useContext(LoginContext);

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const brew = async (link: string) => {
        const toastID = toast.loading(
            `${String.fromCodePoint(0x1f3bb)} Brewing music...`
        );

        const pollTaskStatus = async (taskID: string) => {
            let status = "PENDING";
            while (status !== "SUCCESS" && status !== "FAILURE") {
                const response = await fetch(
                    `${
                        import.meta.env.VITE_API_URL
                    }/check-brew-status/${taskID}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": Cookies.get("csrftoken") || "",
                        },
                        credentials: "include",
                    }
                );
                if (response.headers.get("Content-Type") !== null) {
                    const data = await response.json();

                    status = data.status;
                    if (status === "SUCCESS") {
                        await fetch(
                            `${import.meta.env.VITE_API_URL}/download/${
                                data.path
                            }`
                        )
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(
                                        "Network response was not ok"
                                    );
                                }
                                return response.blob();
                            })
                            .then((blob) => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = url;
                                a.download = data.path.split("/").reverse()[0];
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                            })
                            .catch((error) =>
                                console.error(
                                    "There was a problem with the fetch operation:",
                                    error
                                )
                            );

                        toast.update(toastID, {
                            render() {
                                return (
                                    <div>
                                        {String.fromCodePoint(0x1f3a7)} Music
                                        downloaded!
                                        <button
                                            className="m-2 px-2 border rounded-md"
                                            onClick={() => {
                                                window.location.href =
                                                    `${
                                                        import.meta.env
                                                            .VITE_API_URL
                                                    }/download/` + data.path;
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                );
                            },
                            type: "success",
                            isLoading: false,
                            autoClose: 5000,
                        });
                        return true;
                    }
                    if (status === "FAILURE") {
                        toast.update(toastID, {
                            render: "Invalid link",
                            type: "error",
                            isLoading: false,
                            autoClose: 5000,
                        });
                        return false;
                    }
                }
                // Poll server every 2 seconds
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/brew/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken") || "",
            },
            body: JSON.stringify({
                link: link,
                fileFormat: "m4a",
            }),
            credentials: "include",
        });

        let data: any = null;
        if (response.ok) {
            if (response.headers.get("Content-Type") !== null) {
                data = await response.json();
            }
            if (data.task_id) {
                // Wait for brew result
                const brewSuccess = await pollTaskStatus(data.task_id);
                if (
                    brewSuccess &&
                    loggedIn &&
                    data.music_data.contentType === "playlist"
                ) {
                    const p = data.music_data.playlist_data;
                    setPlaylists([
                        {
                            playlist_id: p.playlist_id,
                            name: p.name,
                            owner: p.owner,
                            link: p.link,
                            platform: p.platform,
                            thumbnail: p.thumbnail,
                        },
                        ...playlists,
                    ]);
                }
            }
        }
    };

    const getPlaylists = async (): Promise<Playlist[]> => {
        let playlists: Playlist[] = [];
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/playlist/`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }
        );

        const data = await response.json();
        if (response.ok) {
            data.forEach((p: Playlist) => {
                playlists.push({
                    playlist_id: p.playlist_id,
                    name: p.name,
                    owner: p.owner,
                    link: p.link,
                    platform: p.platform,
                    thumbnail: p.thumbnail,
                });
            });
        }
        return playlists;
    };

    const watchPlaylist = async (link: string) => {
        const response = await toast.promise(
            fetch(`${import.meta.env.VITE_API_URL}/playlist/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                body: JSON.stringify({
                    link: link,
                }),
                credentials: "include",
            }),
            {
                pending: "Retrieving playlist data...",
            }
        );

        let data = null;
        if (response.headers.get("Content-Type") !== null) {
            data = await response.json();
        }

        if (response.ok) {
            setPlaylists([
                {
                    playlist_id: data.playlist_id,
                    name: data.name,
                    owner: data.owner,
                    link: data.link,
                    platform: data.platform,
                    thumbnail: data.thumbnail,
                },
                ...playlists,
            ]);
            toast.success(`${String.fromCodePoint(0x1f4be)} Playlist saved!`);
        } else if (response.status === 409) {
            toast.error("Playlist already exists");
        } else {
            toast.error("Invalid link");
        }
    };

    const handlePlaylistUpdate = async (updatedPlaylist: Playlist) => {
        // Update the playlist in state
        setTimeout(
            () =>
                setPlaylists([
                    updatedPlaylist,
                    ...playlists.filter(
                        (playlist) =>
                            playlist.playlist_id !== updatedPlaylist.playlist_id
                    ),
                ]),
            1 // thumbnail doesn't update unless delay, temp fix
        );
    };

    const handlePlaylistRemove = async (removedPlaylistID: string) => {
        // Remove the playlist from state
        const updatedPlaylists = playlists.filter(
            (playlist) => playlist.playlist_id !== removedPlaylistID
        );
        setPlaylists(updatedPlaylists);
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getPlaylists();
            setPlaylists(data);
        };
        if (loggedIn) {
            fetchData();
        }
    }, [loggedIn]);

    return (
        <>
            <BrewHero brew={brew} />
            {loggedIn ? (
                <SavedPlaylists
                    playlists={playlists}
                    brew={brew}
                    watchPlaylist={watchPlaylist}
                    handlePlaylistUpdate={handlePlaylistUpdate}
                    handlePlaylistRemove={handlePlaylistRemove}
                />
            ) : null}
        </>
    );
};

export default BrewPage;
