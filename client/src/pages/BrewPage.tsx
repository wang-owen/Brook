import BrewHero from "../components/BrewHero";
import SavedPlaylists from "../components/SavedPlaylists";

const BrewPage = () => {
    const getFile = async (link: string) => {
        const response = await fetch("http://127.0.0.1:8000/brew/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                link: link,
                fileFormat: "m4a",
            }),
        });

        const data = await response.json();
        if (response.ok) {
            return data.path;
        } else {
            console.log(data.message);
        }
    };

    return (
        <>
            <BrewHero getFile={getFile} />
            <SavedPlaylists />
        </>
    );
};

export default BrewPage;
