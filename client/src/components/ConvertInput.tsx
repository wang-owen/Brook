import { useState, useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";

const ConvertInput = ({
    convertSubmit,
}: {
    convertSubmit: (event: React.FormEvent, link: string) => Promise<void>;
}) => {
    const { theme } = useContext(ThemeContext);

    const platforms = ["YouTube", "Spotify", "Apple", "Amazon"];
    const [convertPlatform, setConvertPlatform] = useState("Spotify");
    const platformColors = ["#ff0000", "#108954", "#e6335d", "#05a0d1"];
    const [platformColor, setPlatformColor] = useState("#108954");

    const [link, setLink] = useState("");

    const [inputHover, setInputHover] = useState(false);
    const formClass = `bg-zinc-900 rounded-lg p-3 py-2 duration-1000 border ${
        inputHover
            ? theme === "light"
                ? "w-1/2 shadow-2xl shadow-black"
                : "w-1/2 shadow-2xl shadow-white"
            : "w-1/4 2xl:w-1/5"
    }`;
    const inputBar = `absolute h-0 mt-9 ${
        theme === "light" ? "black" : "white"
    } border-b-2 hover:w-full duration-1000 ease-in-out ${
        inputHover ? "w-full" : "w-0"
    }`;
    return (
        <div className="w-full animate-fadeInFromBottom">
            <div className="flex justify-center">
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
                            style={{ color: platformColor }}
                        >
                            {convertPlatform}
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-white"
                        >
                            {platforms.map((platform, i) => (
                                <li key={platform}>
                                    <a
                                        onClick={() => {
                                            setConvertPlatform(platform);
                                            setPlatformColor(platformColors[i]);
                                        }}
                                    >
                                        {platform}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <form
                onSubmit={(event) => convertSubmit(event, link)}
                className="w-full flex flex-col justify-center items-center gap-12"
            >
                <div
                    className={formClass}
                    style={{ borderColor: platformColor }}
                >
                    <div className="relative flex justify-between items-center mx-5 my-2">
                        <input
                            id="convert-input"
                            className="bg-transparent text-white w-full border-none focus:outline-none"
                            type="url"
                            name="link"
                            placeholder="YouTube Playlist URL"
                            onChange={(event) => setLink(event.target.value)}
                            onFocus={() => setInputHover(true)}
                            onBlur={() => setInputHover(false)}
                            onMouseOver={() => setInputHover(true)}
                            onMouseOut={() => setInputHover(false)}
                        />
                        <div className={inputBar} />
                    </div>
                </div>
                <button
                    type="submit"
                    className="hover:scale-110 duration-300"
                    style={{
                        border: "4px solid transparent",
                        borderRadius: "20px",
                        backgroundClip: "padding-box, border-box",
                        backgroundOrigin: "padding-box, border-box",
                        backgroundImage: `linear-gradient(to right, black, black), linear-gradient(0deg, ${platformColor}, black)`,
                        color: "white",
                        padding: 25,
                        fontWeight: "bold",
                        width: 100,
                        height: 40,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    Convert
                </button>
            </form>
        </div>
    );
};

export default ConvertInput;
