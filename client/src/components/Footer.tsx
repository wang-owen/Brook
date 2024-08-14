import { useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import { FaGithub } from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

const Footer = ({ toggleTheme }: { toggleTheme: () => void }) => {
    const { theme } = useContext(ThemeContext);
    return (
        <footer className="footer p-4 bg-zinc-950 animate-fadeInFromBottom z-50 flex justify-between">
            <aside className="items-center grid-flow-col">
                <label className="flex cursor-pointer gap-2 p-2">
                    <MdOutlineLightMode size={25} />
                    <input
                        type="checkbox"
                        className="toggle theme-controller"
                        onChange={toggleTheme}
                        checked={theme === "dark"}
                    />
                    <MdOutlineDarkMode size={25} />
                </label>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <a href="https://wangowen.com" target="_blank">
                    <CgWebsite className="size-8 hover:opacity-50 duration-200" />
                </a>
                <a href="https://github.com/wang-owen/Brook" target="_blank">
                    <FaGithub className="size-8 hover:opacity-50 duration-200" />
                </a>
            </nav>
        </footer>
    );
};

export default Footer;
