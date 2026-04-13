import { useState } from "react";

const BrewHero = ({ brew }: { brew: (link: string) => void }) => {
    const [link, setLink] = useState("");

    const brewSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const inputElement = document.getElementById(
            "brew-input"
        ) as HTMLInputElement;
        if (inputElement) {
            inputElement.value = "";
        }
        return brew(link);
    };

    return (
        <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-xl px-4">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-center mb-12">
                    Brook
                </h1>
                <form
                    onSubmit={brewSubmit}
                    className="flex flex-col items-center gap-4"
                >
                    <input
                        id="brew-input"
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                        type="url"
                        name="link"
                        placeholder="YouTube or Spotify URL"
                        onChange={(event) => setLink(event.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-80 transition-opacity"
                    >
                        Brew
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BrewHero;
