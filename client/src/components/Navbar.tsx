import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { LoginContext } from "../App";

const Navbar = () => {
    const { loggedIn, setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();

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

    return (
        <div className="navbar bg-zinc-950 fixed animate-fadeInFromTop z-50">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">Brook</a>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1 gap-3">
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
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
