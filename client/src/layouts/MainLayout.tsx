import { useState, createContext } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bgDark from "../assets/img/bg-dark.jpg";
import bgLight from "../assets/img/bg-light.jpg";

export const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {},
});
const MainLayout = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
    const toggleTheme = () => {
        localStorage.setItem("theme", theme === "light" ? "dark" : "light");
        setTheme(theme === "light" ? "dark" : "light");
    };
    return (
        <div
            className={`animate-fadeIn duration-200`}
            style={{
                backgroundImage: `url(${theme === "light" ? bgLight : bgDark})`,
            }}
        >
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                {import.meta.env.VITE_DEBUG != 1 ? (
                    <>
                        <Navbar />
                        <Outlet />
                        <Footer toggleTheme={toggleTheme} />
                    </>
                ) : (
                    <div className="h-screen flex flex-col leading-10 items-center justify-center">
                        <div
                            className={`text-6xl ${
                                theme === "light" && "text-black"
                            }`}
                        >
                            🛠️ Site under maintenance
                        </div>
                        <div
                            className={`text-normal ${
                                theme === "light" && "text-black"
                            }`}
                        >
                            Try it locally{" "}
                            <a
                                href="https://github.com/wang-owen/Brook"
                                className="underline hover:opacity-75"
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
