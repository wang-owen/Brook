import { useState, useContext, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
                    },
                    body: JSON.stringify(credentials),
                }),
                await fetch(`${import.meta.env.VITE_API_URL}/login/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
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
        <section className="h-screen flex justify-center items-center">
            <div className="border border-black rounded-lg">
                <form onSubmit={registerSubmit}>
                    <label className="input input-bordered flex items-center gap-2 m-2">
                        <IoMdMail />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="grow"
                            placeholder="Email"
                            onChange={registerChange}
                            required
                        />
                    </label>
                    <label className="input input-bordered flex items-center gap-2 m-2">
                        <FaUser />
                        <input
                            type="username"
                            id="username"
                            name="username"
                            className="grow"
                            placeholder="Username"
                            onChange={registerChange}
                            required
                        />
                    </label>
                    <label className="input input-bordered flex items-center gap-2 m-2">
                        <FaKey />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="grow"
                            placeholder="●●●●●●●●"
                            onChange={registerChange}
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="btn btn-primary m-2 w-1/3 float-right"
                    >
                        Register
                    </button>
                </form>
            </div>
        </section>
    );
};

export default RegisterPage;
