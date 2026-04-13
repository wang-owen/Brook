import { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { LoginContext } from "../App";
import { IoMenu, IoClose } from "react-icons/io5";

const Navbar = () => {
    const { loggedIn, setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const logout = async () => {
        const response = await toast.promise(
            fetch(`${import.meta.env.VITE_API_URL}/logout/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Cookies.get("csrftoken") || "",
                },
                credentials: "include",
            }),
            {
                pending: "Logging out...",
                success: `${String.fromCodePoint(0x1f4a4)} Logged out`,
            }
        );

        if (response.ok) {
            setLoggedIn(false);
            navigate("/");
        }
    };

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium transition-colors ${
            isActive
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        }`;

    const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block px-4 py-2 text-sm transition-colors ${
            isActive
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        }`;

    const navLinks = (mobile: boolean) => {
        const cls = mobile ? mobileLinkClass : linkClass;
        return (
            <>
                <NavLink to="/" className={cls} onClick={() => setShowMenu(false)}>
                    Brew
                </NavLink>
                <NavLink to="/convert" className={cls} onClick={() => setShowMenu(false)}>
                    Convert
                </NavLink>
                {!loggedIn ? (
                    <>
                        <NavLink to="/register" className={cls} onClick={() => setShowMenu(false)}>
                            Register
                        </NavLink>
                        <NavLink to="/login" className={cls} onClick={() => setShowMenu(false)}>
                            Login
                        </NavLink>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setShowMenu(false);
                            logout();
                        }}
                        className={`text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors ${
                            mobile ? "block px-4 py-2 text-left w-full" : ""
                        }`}
                    >
                        Logout
                    </button>
                )}
            </>
        );
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <NavLink
                    to="/"
                    className="text-lg font-semibold hover:opacity-70 transition-opacity"
                >
                    Brook
                </NavLink>
                {windowWidth > 768 ? (
                    <div className="flex items-center gap-6">
                        {navLinks(false)}
                    </div>
                ) : (
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        {showMenu ? <IoClose size={20} /> : <IoMenu size={20} />}
                    </button>
                )}
            </div>
            {showMenu && windowWidth <= 768 && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-2">
                    {navLinks(true)}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
