import { useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";

const ConvertCard = ({ link, img }: { link: string; img: string }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <a href={link}>
            <div
                className={`px-8 w-80 h-52 rounded-2xl bg-base-200 flex place-items-center hover:scale-110 duration-300 hover:shadow-2xl ${
                    theme === "light"
                        ? "hover:shadow-black"
                        : "hover:shadow-white"
                }`}
            >
                <img src={img} />
            </div>
        </a>
    );
};

export default ConvertCard;
