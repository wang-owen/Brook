import { useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import { FaGithub } from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

const Footer = ({ toggleTheme }: { toggleTheme: () => void }) => {
    const { theme } = useContext(ThemeContext);
    return (
        <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 px-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400"
                >
                    {theme === "dark" ? (
                        <MdOutlineLightMode size={20} />
                    ) : (
                        <MdOutlineDarkMode size={20} />
                    )}
                </button>
                <div className="flex items-center gap-4">
                    <a
                        href="https://wangowen.com"
                        target="_blank"
                        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                        <CgWebsite size={20} />
                    </a>
                    <a
                        href="https://github.com/wang-owen/Brook"
                        target="_blank"
                        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                        <FaGithub size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
