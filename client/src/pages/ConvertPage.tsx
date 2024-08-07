import { useState, useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import ConvertSpotify from "../components/ConvertSpotify";
import ConvertYouTube from "../components/ConvertYouTube";

const ConvertPage = ({ platform }: { platform: string | null }) => {
    const { theme } = useContext(ThemeContext);

    const [convertPlatform, setConvertPlatform] = useState(
        platform || window.localStorage.getItem("convertPlatform") || "YouTube"
    );
    const platforms = ["YouTube", "Spotify"];
    const platformColors = new Map();
    platformColors.set("YouTube", "#ff0000");
    platformColors.set("Spotify", "#108954");

    const authButtons = new Map([
        [
            "YouTube",
            <ConvertYouTube platformColor={platformColors.get("YouTube")} />,
        ],
        [
            "Spotify",
            <ConvertSpotify platformColor={platformColors.get("Spotify")} />,
        ],
    ]);

    return (
        <section className="h-screen">
            <div className="h-full w-full animate-fadeIn flex flex-col justify-center items-center">
                <div
                    className={`${
                        theme === "light" ? "text-black" : "text-white"
                    } font-semibold text-6xl lg:text-7xl m-12 text-center`}
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
