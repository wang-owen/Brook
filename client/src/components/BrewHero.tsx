import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { LoginContext } from "../App";
import { ThemeContext } from "../layouts/MainLayout";

const BrewHero = ({ brew }: { brew: (link: string) => void }) => {
    const { theme } = useContext(ThemeContext);
    const { loggedIn } = useContext(LoginContext);

    const [link, setLink] = useState("");

    const brewSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Clear input field
        const inputElement = document.getElementById("brew-input");
        if (inputElement) {
            (inputElement as HTMLInputElement).value = "";
        }
        return brew(link);
    };

    const [inputHover, setInputHover] = useState(false);
    const formClass = `bg-zinc-900 rounded-lg p-3 py-2 duration-1000 border ${
        theme === "light" ? "border-black" : "border-white"
    } ${
        inputHover
            ? theme === "light"
                ? "w-1/2 shadow-2xl shadow-black border-white"
                : "w-1/2 shadow-2xl shadow-white border-black"
            : "w-1/4 2xl:w-1/5"
    }`;
    const inputBar = `absolute h-0 mt-9 border-white border-b-2 hover:w-full duration-1000 ease-in-out ${
        inputHover ? "w-full" : "w-0"
    }`;

    return (
        <div
            className={`flex bg-cover bg-no-repeat items-center gap-16 ${
                loggedIn ? "h-[50vh]" : "h-screen"
            }`}
        >
            <div className="w-full animate-fadeInFromBottom">
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
                        <motion.button
                            type="submit"
                            initial={{
                                backgroundImage:
                                    "linear-gradient(to right, black, black), linear-gradient(0deg, blue, black)",
                            }}
                            animate={{
                                backgroundImage: `linear-gradient(to right, ${
                                    theme === "light"
                                        ? "white, white"
                                        : "black, black"
                                }), linear-gradient(360deg, blue, ${
                                    theme === "light" ? "white" : "black"
                                })`,
                            }}
                            transition={{
                                type: "tween",
                                ease: "linear",
                                duration: 3,
                                repeat: Infinity,
                            }}
                            className="hover:scale-110 duration-300"
                            style={{
                                border: "4px solid transparent",
                                borderRadius: "20px",
                                backgroundClip: "padding-box, border-box",
                                backgroundOrigin: "padding-box, border-box",
                                color: `${
                                    theme === "light" ? "black" : "white"
                                }`,
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
                        </motion.button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BrewHero;
