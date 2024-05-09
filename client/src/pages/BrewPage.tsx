import Cookies from "js-cookie";
import BrewHero from "../components/BrewHero";
import SavedPlaylists from "../components/SavedPlaylists";

const BrewPage = () => {
    const getFile = async (link: string) => {
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

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            return data.path;
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
