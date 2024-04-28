import { NavLink } from "react-router-dom";
import favicon from "../assets/img/favicon.png";

const Navbar = () => {
    const linkClass =
        "text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2";

    return (
        <nav className="bg-gray-500 border-b">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
                        {/* <!-- Logo --> */}
                        <NavLink
                            className="flex flex-shrink-0 items-center mr-4"
                            to="/"
                        >
                            <img
                                className="h-10 w-auto"
                                src={favicon}
                                alt="Brook"
                            />
                            <span className="hidden md:block text-white text-2xl font-bold ml-2">
                                Brook
                            </span>
                        </NavLink>
                        <div className="md:ml-auto">
                            <div className="flex space-x-2">
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
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
