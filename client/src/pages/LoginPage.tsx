import { useState, useContext, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { FaUser, FaKey } from "react-icons/fa6";
import { LoginContext } from "../App";

const LoginPage = () => {
    const { setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({});

    const login = async (credentials: Object) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken") || "",
            },
            body: JSON.stringify(credentials),
            credentials: "include",
        });

        if (response.ok) {
            setLoggedIn(true);
            toast.success(`${String.fromCodePoint(0x1f44b)} Logged in!`);
            navigate("/");
        } else {
            toast.error("Invalid credentials");
        }
    };

    const loginChange = (event: any) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const loginSubmit = (event: FormEvent) => {
        event.preventDefault();
        login(inputs);
    };

    return (
        <section className="min-h-screen pt-14 flex justify-center items-center">
            <div className="w-full max-w-sm mx-auto p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Login
                </h1>
                <form onSubmit={loginSubmit}>
                    <div className="relative mb-4">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                        <input
                            type="username"
                            id="username"
                            name="username"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                            placeholder="Username"
                            onChange={loginChange}
                            required
                        />
                    </div>
                    <div className="relative mb-4">
                        <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                            placeholder="Password"
                            onChange={loginChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-80 transition-opacity"
                    >
                        Login
                    </button>
                </form>
            </div>
        </section>
    );
};

export default LoginPage;
