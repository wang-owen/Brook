import { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {},
});

const MainLayout = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "dark"
    );

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", next);
        setTheme(next);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                {import.meta.env.VITE_MAINTENANCE !== "true" ? (
                    <>
                        <Navbar />
                        <main className="flex-1">
                            <Outlet />
                        </main>
                        <Footer toggleTheme={toggleTheme} />
                    </>
                ) : (
                    <div className="h-screen flex flex-col leading-10 items-center justify-center">
                        <div className="text-5xl font-bold">
                            Site under maintenance
                        </div>
                        <div className="text-base text-neutral-500 dark:text-neutral-400 mt-2">
                            Try it locally{" "}
                            <a
                                href="https://github.com/wang-owen/Brook"
                                className="underline hover:opacity-75 transition-opacity"
                            >
                                here
                            </a>
                        </div>
                    </div>
                )}
            </ThemeContext.Provider>
            <ToastContainer newestOnTop />
        </div>
    );
};

export default MainLayout;
