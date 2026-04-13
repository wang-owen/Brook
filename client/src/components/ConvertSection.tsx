import { useState, SetStateAction } from "react";
import { convertSubmit } from "./ConvertTools";

const ConvertSection = ({
    isAuthenticated,
    setIsAuthenticated,
    platform,
    platformColor,
    currentToken,
    getBody,
    redirect,
}: {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<SetStateAction<boolean>>;
    platform: string;
    platformColor: string;
    currentToken: any;
    getBody: () => Promise<any>;
    redirect: () => Promise<void>;
}) => {
    const [link, setLink] = useState("");

    return isAuthenticated ? (
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
            <form
                onSubmit={(event) =>
                    convertSubmit(event, platform, getBody, link)
                }
                className="w-full flex flex-col items-center gap-4"
            >
                <input
                    id="convert-input"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 transition-shadow"
                    style={{
                        // @ts-ignore - using CSS custom property for focus ring
                        "--tw-ring-color": platformColor,
                    } as React.CSSProperties}
                    type="url"
                    name="link"
                    placeholder="Playlist URL"
                    onChange={(event) => setLink(event.target.value)}
                />
                <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: platformColor }}
                >
                    Convert
                </button>
            </form>
            <button
                className="mt-8 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline transition-colors"
                onClick={() => {
                    currentToken.clear();
                    setIsAuthenticated(false);
                }}
            >
                Disconnect from {platform}
            </button>
        </div>
    ) : (
        <div className="flex justify-center w-full">
            <button
                className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: platformColor }}
                onClick={() => redirect()}
            >
                Connect with {platform}
            </button>
        </div>
    );
};

export default ConvertSection;
