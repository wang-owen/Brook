import { NavLink } from "react-router-dom";
import favicon from "../assets/img/favicon.png";

const Navbar = ({ height }: { height: number }) => {
    const linkClass =
        "text-white hover:bg-gray-600 duration-200 rounded-md px-3 py-2";
    return (
        <header className="fixed top-0 w-full bg-gray-500 flex justify-center shadow-xl">
            <nav
                className={`flex h-${height} w-2/3 items-center justify-between`}
            >
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
                    <NavLink to="/login" className={linkClass}>
                        Login
                    </NavLink>
                    <NavLink to="/register" className={linkClass}>
                        Register
                    </NavLink>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
