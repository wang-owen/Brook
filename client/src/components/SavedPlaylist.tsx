import Playlist from "../interfaces/Playlist";

const SavedPlaylist = (playlist: Playlist) => {
    const buttonClass =
        "inline-block bg-gray-200 hover:bg-gray-300 duration-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 hover:text-gray-800 mr-2 mb-2";
    return (
        <>
            <div className="max-w-sm rounded shadow-lg">
                <img
                    className="w-full"
                    src={playlist.thumbnail}
                    alt="Thumbnail"
                />
                <div className="px-6 pt-4 pb-2 text-center">
                    <span className={buttonClass}>
                        <button>Download</button>
                    </span>
                    <span className={buttonClass}>
                        <button>Update</button>
                    </span>
                    <span className={buttonClass}>
                        <button>Remove</button>
                    </span>
                </div>
            </div>
        </>
    );
};

export default SavedPlaylist;
