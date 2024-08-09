import { useContext, useState } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import { formInputClass, inputBarClass } from "./FormClasses";

const BrewHero = ({ brew }: { brew: (link: string) => void }) => {
    const { theme } = useContext(ThemeContext);

    const [link, setLink] = useState("");

    const [inputHover, setInputHover] = useState(false);
    const formClass = formInputClass(inputHover, theme);
    const inputBar = inputBarClass(inputHover);

    const brewSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Clear input field
        const inputElement = document.getElementById("brew-input");
        if (inputElement) {
            (inputElement as HTMLInputElement).value = "";
        }
        return brew(link);
    };

    return (
        <div className="flex items-center gap-16 w-full">
            <div className="w-full animate-fadeIn">
                <div className="flex justify-center">
                    <div
                        className={`m-12 text-7xl h-full bg-gradient-to-r ${
                            theme === "light" ? "bg-black" : "bg-white"
                        } text-transparent bg-clip-text flex items-center font-semibold text-center hover:scale-110 duration-200`}
                    >
                        Brook
                    </div>
                </div>
                <div className="flex justify-center">
                    <form
                        onSubmit={brewSubmit}
                        className="w-full flex flex-col justify-center items-center gap-16"
                    >
                        <div className={formClass}>
                            <div className="relative flex justify-between items-center mx-5 my-2">
                                <input
                                    id="brew-input"
                                    className="bg-transparent text-white w-full border-none focus:outline-none"
                                    type="url"
                                    name="link"
                                    placeholder="YouTube/Spotify URL"
                                    onChange={(event) =>
                                        setLink(event.target.value)
                                    }
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
                                backgroundImage:
                                    "linear-gradient(to right, black, black), linear-gradient(0deg, white, black)",
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
                            Brew
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BrewHero;
