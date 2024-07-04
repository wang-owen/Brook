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
            {/* <ThemeContext.Provider value={{ theme, toggleTheme }}>
                <Navbar />
                <Outlet />
                <Footer toggleTheme={toggleTheme} />
            </ThemeContext.Provider>
            <ToastContainer newestOnTop /> */}
            <div className="h-screen flex items-center justify-center">
                <h1
                    className={`animate-pulse text-7xl ${
                        theme === "light" && "text-black"
                    }`}
                >
                    🛠️ Site under maintenance...
                </h1>
            </div>
            <Footer toggleTheme={toggleTheme} />
        </div>
    );
};

export default MainLayout;
