import { useState } from "react";
import ConvertSpotify from "../components/ConvertSpotify";
import ConvertYouTube from "../components/ConvertYouTube";

const ConvertPage = ({ platform }: { platform: string | null }) => {
    const [convertPlatform, setConvertPlatform] = useState(
        platform || window.localStorage.getItem("convertPlatform") || "YouTube"
    );

    const platforms = ["YouTube", "Spotify"];
    const platformColors = new Map([
        ["YouTube", "#ff0000"],
        ["Spotify", "#108954"],
    ]);

    const authButtons = new Map([
        [
            "YouTube",
            <ConvertYouTube platformColor={platformColors.get("YouTube")!} />,
        ],
        [
            "Spotify",
            <ConvertSpotify platformColor={platformColors.get("Spotify")!} />,
        ],
    ]);

    return (
        <section className="min-h-screen pt-14 flex flex-col justify-center items-center">
            <h1 className="font-bold text-5xl lg:text-6xl text-center mb-4">
                Convert to{" "}
                <span
                    style={{
                        color: platformColors.get(convertPlatform),
                    }}
                >
                    {convertPlatform}
                </span>
            </h1>
            <div className="flex gap-2 mb-12">
                {platforms.map((p) => (
                    <button
                        key={p}
                        onClick={() => setConvertPlatform(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            convertPlatform === p
                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>
            {authButtons.get(convertPlatform)}
        </section>
    );
};

export default ConvertPage;
