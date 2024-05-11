import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import SavedPlaylist from "./SavedPlaylist";
import Playlist from "../interfaces/Playlist";

const SavedPlaylists = () => {
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

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getPlaylists();
            setPlaylists(data);
        };
        fetchData();
    }, []);

    const handlePlaylistUpdate = async (updatedPlaylist: Playlist) => {
        // Update the playlist in state
        const updatedPlaylists = playlists.map((playlist) =>
            playlist.playlist_id === updatedPlaylist.playlist_id
                ? updatedPlaylist
                : playlist
        );
        setPlaylists(updatedPlaylists);
    };

    const handlePlaylistRemove = async (removedPlaylistId: string) => {
        // Remove the playlist from state
        const updatedPlaylists = playlists.filter(
            (playlist) => playlist.playlist_id !== removedPlaylistId
        );
        setPlaylists(updatedPlaylists);
    };

    return (
        <>
            <section>
                <div className="grid grid-cols-4 gap-4 justify-evenly justify-items-center items-center content-center">
                    {playlists.map((playlist) => (
                        <SavedPlaylist
                            key={playlist.playlist_id}
                            playlist={playlist}
                            onUpdate={handlePlaylistUpdate}
                            onRemove={handlePlaylistRemove}
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

export default SavedPlaylists;
