import { FaGithub } from "react-icons/fa";

const Footer = () => {
    return (
        <div className="mt-8 p-2 flex justify-center align-middle bg-gray-300">
            <a href="https://github.com/wang-owen/Brook" target="_blank">
                <FaGithub className="size-5 hover:opacity-50 duration-200" />
            </a>
        </div>
    );
};

export default Footer;
