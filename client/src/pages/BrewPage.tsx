import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import BrewHero from "../components/BrewHero";
import SavedPlaylists from "../components/SavedPlaylists";
import Playlist from "../interfaces/Playlist";

const BrewPage = ({ loggedIn }: { loggedIn: boolean }) => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const getBrewData = async (link: string) => {
        const response = await fetch("http://127.0.0.1:8000/brew/", {
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

        let data = null;
        if (response.headers.get("Content-Type") !== null) {
            data = await response.json();
            console.log(data);
        }

        if (response.ok) {
            if (data) {
                if (loggedIn && data.musicData.contentType === "playlist") {
                    const p = data.musicData.playlist_data;
                    setPlaylists([
                        {
                            playlist_id: p.playlist_id,
                            name: p.name,
                            owner: p.owner,
                            link: p.link,
                            platform: p.platform,
                            thumbnail: p.thumbnail,
                            last_modified: p.last_modified,
                        },
                        ...playlists,
                    ]);
                }
            }
            return data.path;
        }
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
                    last_modified: p.last_modified,
                });
            });
        }
        return playlists;
    };

    const watchPlaylist = async (link: string) => {
        const response = await fetch("http://127.0.0.1:8000/playlist/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken") || "",
            },
            body: JSON.stringify({
                link: link,
            }),
            credentials: "include",
        });

        let data = null;
        if (response.headers.get("Content-Type") !== null) {
            data = await response.json();
            console.log(data);
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
                    last_modified: data.last_modified,
                },
                ...playlists,
            ]);
        }
    };

    const handlePlaylistUpdate = async (updatedPlaylist: Playlist) => {
        // Update the playlist in state
        setPlaylists([
            updatedPlaylist,
            ...playlists.filter(
                (playlist) =>
                    playlist.playlist_id !== updatedPlaylist.playlist_id
            ),
        ]);
    };

    const handlePlaylistRemove = async (removedPlaylistId: string) => {
        // Remove the playlist from state
        const updatedPlaylists = playlists.filter(
            (playlist) => playlist.playlist_id !== removedPlaylistId
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
    }, []);

    return (
        <>
            <BrewHero getBrewData={getBrewData} />
            {loggedIn ? (
                <SavedPlaylists
                    playlists={playlists}
                    watchPlaylist={watchPlaylist}
                    handlePlaylistUpdate={handlePlaylistUpdate}
                    handlePlaylistRemove={handlePlaylistRemove}
                />
            ) : null}
        </>
    );
};

export default BrewPage;
