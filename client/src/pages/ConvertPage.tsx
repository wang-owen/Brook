import { useState, useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import ConvertSpotify from "./ConvertSpotify";

const ConvertPage = () => {
    const { theme } = useContext(ThemeContext);

    const platforms = ["YouTube", "Spotify", "Apple", "Amazon"];
    const [convertPlatform, setConvertPlatform] = useState("Spotify");
    const platformColors = new Map();
    platformColors.set("YouTube", "#ff0000");
    platformColors.set("Spotify", "#108954");
    platformColors.set("Apple", "#e6335d");
    platformColors.set("Amazon", "#05a0d1");

    const authButtons = new Map([
        ["Spotify", <ConvertSpotify color={platformColors.get("Spotify")} />],
    ]);

    return (
        <section className="h-screen">
            <div className="h-full w-full animate-fadeIn flex flex-col justify-center items-center">
                <div
                    className={`${
                        theme === "light" ? "text-black" : "text-white"
                    } font-semibold text-7xl m-12`}
                >
                    Convert to{" "}
                    <div className="dropdown dropdown-top dropdown-hover">
                        <div
                            tabIndex={0}
                            role="button"
                            className="opacity-50 hover:opacity-100 duration-300"
                            style={{
                                color: platformColors.get(convertPlatform),
                            }}
                        >
                            {convertPlatform}
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-white"
                        >
                            {platforms.map((platform) => (
                                <li key={platform}>
                                    <a
                                        onClick={() => {
                                            setConvertPlatform(platform);
                                        }}
                                    >
                                        {platform}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {authButtons.get(convertPlatform)}
            </div>
        </section>
    );
};

export default ConvertPage;
