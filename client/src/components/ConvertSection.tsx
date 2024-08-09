import { useState, useContext, SetStateAction } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import { convertSubmit } from "./ConvertTools";
import { formInputClass, inputBarClass } from "./FormClasses";

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
    const { theme } = useContext(ThemeContext);

    const [link, setLink] = useState("");
    const [inputHover, setInputHover] = useState(false);
    const formClass = formInputClass(inputHover, theme);
    const inputBar = inputBarClass(inputHover);

    return isAuthenticated ? (
        <div className="flex w-full justify-center">
            <form
                onSubmit={(event) =>
                    convertSubmit(event, platform, getBody, link)
                }
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
                            placeholder="Playlist URL"
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
            <button
                className={`btn btn-sm text-white hover:opacity-80 absolute bottom-24`}
                style={{ backgroundColor: platformColor }}
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
                className={`btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white hover:opacity-80`}
                style={{ backgroundColor: platformColor }}
                onClick={() => redirect()}
            >
                Connect with {platform}
            </button>
        </div>
    );
};

export default ConvertSection;
