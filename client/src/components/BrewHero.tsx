import { useState } from "react";
import heroBanner from "../assets/img/brew-hero.png";

const BrewHero = ({
    getBrewData,
}: {
    getBrewData: (link: string) => Promise<string>;
}) => {
    const [link, setLink] = useState("");

    const brewSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const path: string = await getBrewData(link);
        if (path) {
            window.location.href = "http://127.0.0.1:8000/download/" + path;
        }

        return;
    };

    const [inputHover, setInputHover] = useState(false);
    const formClass = `bg-gray-900 rounded-lg p-3 py-2 shadow-2xl duration-1000 ${
        inputHover ? "w-1/2" : "w-1/5"
    }`;
    const inputBar = `absolute h-0 mt-9 border-white border-b-2 hover:w-full duration-1000 ease-in-out ${
        inputHover ? "w-full" : "w-0"
    }`;

    return (
        <section>
            <div
                className="flex h-dvh bg-cover bg-no-repeat items-center shadow-lg"
                style={{ backgroundImage: `url(${heroBanner})` }}
            >
                <div className="w-full">
                    <div className="mb-14 text-center text-5xl">
                        <h1>Brook</h1>
                    </div>
                    <div className="flex justify-center">
                        <form onSubmit={brewSubmit} className={formClass}>
                            <div className="relative flex justify-between items-center mx-5 my-2">
                                <input
                                    className="bg-transparent text-white w-full border-none focus:outline-none"
                                    type="url"
                                    name="link"
                                    placeholder="YouTube/Spotify URL"
                                    onChange={(event) => {
                                        setLink(event.target.value);
                                    }}
                                    onMouseOver={() => {
                                        setInputHover(!inputHover);
                                    }}
                                    onMouseOut={() => {
                                        setInputHover(!inputHover);
                                    }}
                                />
                                <div className={inputBar}></div>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 -blue-600 hover:-blue-700 duration-200 text-sm -4 text-white rounded-lg float-right px-4 py-2"
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
