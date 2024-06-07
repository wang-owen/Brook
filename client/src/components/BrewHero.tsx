import { useState } from "react";

const BrewHero = ({ brew }: { brew: (link: string) => void }) => {
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
    const formClass = `bg-gray-900 rounded-lg p-3 py-2 shadow-2xl duration-1000 ${
        inputHover ? "w-1/2" : "w-1/4 2xl:w-1/5"
    }`;
    const inputBar = `absolute h-0 mt-9 border-white border-b-2 hover:w-full duration-1000 ease-in-out ${
        inputHover ? "w-full" : "w-0"
    }`;

    return (
        <section>
            <div className="flex h-[60vh] bg-cover bg-no-repeat items-center">
                <div className="w-full animate-fadeInFromBottom">
                    <div className="flex justify-center">
                        <h1 className="m-12 text-7xl h-full bg-gradient-to-r from-black via-blue-500 to-teal-500 text-transparent bg-clip-text flex items-center font-semibold text-center drop-shadow-2xl hover:scale-110 duration-200">
                            Brook
                        </h1>
                    </div>
                    <div className="flex justify-center">
                        <form onSubmit={brewSubmit} className={formClass}>
                            <div className="relative flex justify-between items-center mx-5 my-2">
                                <input
                                    id="brew-input"
                                    className="bg-transparent text-white w-full border-none focus:outline-none"
                                    type="url"
                                    name="link"
                                    placeholder="YouTube/Spotify URL"
                                    onChange={(event) => {
                                        setLink(event.target.value);
                                    }}
                                    onFocus={() => {
                                        setInputHover(true);
                                    }}
                                    onBlur={() => {
                                        setInputHover(false);
                                    }}
                                    onMouseOver={() => {
                                        setInputHover(true);
                                    }}
                                    onMouseOut={() => {
                                        setInputHover(false);
                                    }}
                                />
                                <div className={inputBar}></div>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 duration-200 text-sm text-white rounded-lg float-right px-4 py-2"
                                    type="submit"
                                >
                                    Brew
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrewHero;
