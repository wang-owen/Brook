import { useState, useContext, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { FaUser, FaKey } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { LoginContext } from "../App";

const RegisterPage = () => {
    const { setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({});

    const register = async (credentials: Object) => {
        const [registerResponse, loginResponse] = await toast.promise(
            Promise.all([
                await fetch(`${import.meta.env.VITE_API_URL}/register/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": Cookies.get("csrftoken") || "",
                    },
                    body: JSON.stringify(credentials),
                    credentials: "include",
                }),
                await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": Cookies.get("csrftoken") || "",
                    },
                    body: JSON.stringify(credentials),
                    credentials: "include",
                }),
            ]),
            {
                pending: "Registering user...",
                success: `${String.fromCodePoint(0x1f37b)} Registered!`,
                error: "Username not available",
            }
        );

        if (registerResponse.ok && loginResponse.ok) {
            setLoggedIn(true);
            navigate("/");
        }
    };

    const registerChange = (event: any) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const registerSubmit = (event: FormEvent) => {
        event.preventDefault();
        register(inputs);
    };

    return (
        <section className="min-h-screen pt-14 flex justify-center items-center">
            <div className="w-full max-w-sm mx-auto p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Register
                </h1>
                <form onSubmit={registerSubmit}>
                    <div className="relative mb-4">
                        <IoMdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                            placeholder="Email"
                            onChange={registerChange}
                            required
                        />
                    </div>
                    <div className="relative mb-4">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                        <input
                            type="username"
                            id="username"
                            name="username"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
                            placeholder="Username"
                            onChange={registerChange}
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
                            onChange={registerChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-80 transition-opacity"
                    >
                        Register
                    </button>
                </form>
            </div>
        </section>
    );
};

export default RegisterPage;
