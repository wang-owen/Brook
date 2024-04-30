import heroBanner from "../assets/img/brew-hero.png";

const BrewHero = () => {
    return (
        <section>
            <div
                className="h-dvh bg-cover bg-no-repeat flex justify-center items-center"
                style={{ backgroundImage: `url(${heroBanner})` }}
            >
                <div className="w-full">
                    <div className="my-8 text-center text-4xl">
                        <h1>Brook</h1>
                    </div>
                    <div className="flex justify-center">
                        <form className="bg-gray-900 rounded-lg p-3 py-2 shadow-2xl w-1/2">
                            <div className="flex items-center mx-5 my-2">
                                <input
                                    className="bg-transparent -none text-gray-700 focus:outline-none flex-grow"
                                    type="text"
                                    placeholder="YouTube/Spotify URL"
                                />
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 -blue-600 hover:-blue-700 duration-200 text-sm -4 text-white rounded-lg float-right px-4 py-2"
                                    type="button"
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
