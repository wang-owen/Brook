import navbarIcon from "../assets/img/navbar-icon.png";
import { FaGithub } from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";

const Footer = () => {
    return (
        <footer className="footer items-center p-4 bg-neutral text-neutral-content">
            <aside className="items-center grid-flow-col">
                <img className="h-10 w-auto" src={navbarIcon} alt="Brook" />
                <p>Brook - Owen Wang</p>
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
