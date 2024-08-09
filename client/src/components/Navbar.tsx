import { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { LoginContext } from "../App";
import { IoMenu } from "react-icons/io5";

const Navbar = () => {
    const { loggedIn, setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();

    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    );
    const [showMenu, setShowMenu] = useState(false);

    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height,
        };
    }

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const LogoutButton = (
        <button
            onClick={async () => {
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
            }}
        >
            Logout
        </button>
    );

    const navItems = (
        <>
            <li>
                <NavLink to="/">Brew</NavLink>
            </li>
            <li>
                <NavLink to="/convert">Convert</NavLink>
            </li>
            {!loggedIn ? (
                <>
                    <li>
                        <NavLink to="/register">Register</NavLink>
                    </li>
                    <li>
                        <NavLink to="/login">Login</NavLink>
                    </li>
                </>
            ) : (
                <li>
                    <a>{LogoutButton}</a>
                </li>
            )}
        </>
    );

    return (
        <>
            <nav className="navbar bg-zinc-950 absolute animate-fadeInFromTop z-50">
                <div className="flex-1">
                    <NavLink to="/" className="btn btn-ghost text-xl">
                        Brook
                    </NavLink>
                </div>
                <div className="flex-none">
                    {windowDimensions.width > 1024 ? (
                        <ul className="menu menu-horizontal px-1 gap-3">
                            {navItems}
                        </ul>
                    ) : (
                        <div
                            className="px-3 hover:opacity-50 duration-150"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <IoMenu size={25} />
                        </div>
                    )}
                </div>
            </nav>
            {showMenu && (
                <div className="absolute top-16 w-full">
                    <ul className="menu flex items-end">
                        <div className="border p-2 rounded-lg">{navItems}</div>
                    </ul>
                </div>
            )}
        </>
    );
};

export default Navbar;
