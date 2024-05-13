import { FaGithub } from "react-icons/fa";

const Footer = () => {
    return (
        <div className="p-2 flex justify-center align-middle bg-gray-300">
            <a href="https://github.com/wang-owen/Brook" target="_blank">
                <FaGithub className="size-4 hover:opacity-50 duration-200" />
            </a>
        </div>
    );
};

export default Footer;
