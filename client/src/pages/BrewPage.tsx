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
        let data: any = null;
        toast.promise(
            fetch("http://127.0.0.1:8000/brew/", {
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
            }).then(async (response) => {
                if (response.ok) {
                    if (response.headers.get("Content-Type") !== null) {
                        data = await response.json();
                    }
                    if (
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
                    window.location.href =
                        "http://127.0.0.1:8000/download/" + data.path;
                }
            }),
            {
                pending: `${String.fromCodePoint(0x1f3bb)} Brewing music...`,
                success: {
                    render() {
                        return (
                            <div>
                                {String.fromCodePoint(0x1f3a7)} Music
                                downloaded!
                                <button
                                    className="m-2 px-2 border rounded-md"
                                    onClick={() => {
                                        window.location.href =
                                            "http://127.0.0.1:8000/download/" +
                                            data.path;
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        );
                    },
                },
                error: "Invalid link",
            }
        );
        return data;
    };

    const getPlaylists = async (): Promise<Playlist[]> => {
        let playlists: Playlist[] = [];
        const response = await fetch("http://127.0.0.1:8000/playlist/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken") || "",
            },
            credentials: "include",
        });

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
            fetch("http://127.0.0.1:8000/playlist/", {
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
