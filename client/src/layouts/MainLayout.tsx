import { useState, createContext } from "react";
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
        localStorage.getItem("theme") || "light"
    );
    const toggleTheme = () => {
        localStorage.setItem("theme", theme === "light" ? "dark" : "light");
        setTheme(theme === "light" ? "dark" : "light");
    };
    return (
        <div
            className={`animate-fadeIn ${
                theme === "light" ? "bg-stone-200" : "bg-sky-950"
            } duration-200`}
        >
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                <Navbar />
                <Outlet />
                <Footer toggleTheme={toggleTheme} />
            </ThemeContext.Provider>
            <ToastContainer newestOnTop />
        </div>
    );
};

export default MainLayout;
