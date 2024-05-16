import { useContext } from "react";
import { NavLink, Path, useNavigate } from "react-router-dom";
import favicon from "../assets/img/favicon.png";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { LoginContext } from "../App.jsx";

const Navbar = () => {
    const { loggedIn, setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();

    const linkClass =
        "text-white text-sm hover:bg-gray-600 hover:text-base duration-200 rounded-sm px-3 py-2";

    const LoggedInItem = ({
        showIfLoggedIn,
        loggedIn,
        label,
        path,
    }: {
        showIfLoggedIn: Boolean;
        loggedIn: Boolean;
        label: String;
        path: Path;
    }) => {
        if (showIfLoggedIn === loggedIn) {
            return (
                <NavLink to={path} className={linkClass}>
                    {label}
                </NavLink>
            );
        }
        return null;
    };

    const LogoutButton = ({ loggedIn }: { loggedIn: boolean }) => {
        if (loggedIn) {
            return (
                <button
                    className={linkClass}
                    onClick={async () => {
                        const response = await fetch(
                            "http://127.0.0.1:8000/logout/",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-CSRFToken":
                                        Cookies.get("csrftoken") || "",
                                },
                                credentials: "include",
                            }
                        );

                        const data = await response.json();
                        console.log(data.message);

                        if (response.ok) {
                            setLoggedIn(false);
                            navigate("/");
                            toast.success(
                                `${String.fromCodePoint(0x1f4a4)} Logged out`
                            );
                        }
                    }}
                >
                    Logout
                </button>
            );
        }
        return null;
    };

    return (
        <header className="fixed top-0 w-full bg-gray-500 flex justify-center shadow-xl">
            <nav className={`flex h-full w-2/3 items-center justify-between`}>
                {/* <!-- Logo --> */}
                <NavLink className="flex items-center" to="/">
                    <img className="h-10 w-auto" src={favicon} alt="Brook" />
                    <span className="text-white text-2xl font-bold ml-2 mt-0.5 hover:opacity-50 duration-200">
                        Brook
                    </span>
                </NavLink>
                <div>
                    <NavLink to="/" className={linkClass}>
                        Brew
                    </NavLink>
                    <LoggedInItem
                        showIfLoggedIn={false}
                        loggedIn={loggedIn}
                        label="Register"
                        path={"/register" as unknown as Path}
                    />
                    <LoggedInItem
                        showIfLoggedIn={false}
                        loggedIn={loggedIn}
                        label="Login"
                        path={"/login" as unknown as Path}
                    />
                    <LogoutButton loggedIn={loggedIn} />
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
