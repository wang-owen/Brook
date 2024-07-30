import { useState, useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";

const ConvertForm = ({
    convertSubmit,
    platform,
    body,
    platformColor,
}: {
    convertSubmit: (event: React.FormEvent, platform: string, body: any) => any;
    platform: string;
    body: any;
    platformColor: string;
}) => {
    const { theme } = useContext(ThemeContext);

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
        <form
            onSubmit={(event) =>
                convertSubmit(event, platform, { ...body, link: link })
            }
            className="w-full flex flex-col justify-center items-center gap-12"
        >
            <div className={formClass} style={{ borderColor: platformColor }}>
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
    );
};

export default ConvertForm;
