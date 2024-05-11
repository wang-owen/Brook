import { useState } from "react";
import heroBanner from "../assets/img/brew-hero.png";

const BrewHero = ({ getBrewData }: { getBrewData: Function }) => {
    const [link, setLink] = useState("");

    const brewSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const path: string = await getBrewData(link);
        if (path) {
            window.location.href = "http://127.0.0.1:8000/download/" + path;
        }

        return;
    };

    return (
        <section>
            <div
                className="flex h-dvh bg-cover bg-no-repeat items-center shadow-lg"
                style={{ backgroundImage: `url(${heroBanner})` }}
            >
                <div className="w-full">
                    <div className="my-4 text-center text-4xl">
                        <h1>Brook</h1>
                    </div>
                    <div className="flex justify-center">
                        <form
                            onSubmit={brewSubmit}
                            className="bg-gray-900 rounded-lg p-3 py-2 shadow-2xl w-1/2"
                        >
                            <div className="flex justify-between items-center mx-5 my-2">
                                <input
                                    className="bg-transparent -none text-gray-700 w-1/5 border-b-2 focus:outline-none focus:w-11/12 duration-200"
                                    type="url"
                                    name="link"
                                    placeholder="YouTube/Spotify URL"
                                    onChange={(event) => {
                                        setLink(event.target.value);
                                    }}
                                />
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
