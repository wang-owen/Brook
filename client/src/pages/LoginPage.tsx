import { useState, useContext, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
        <section className="h-screen flex justify-center items-center">
            <div className="border border-black rounded-lg">
                <form onSubmit={loginSubmit}>
                    <label className="input input-bordered flex items-center gap-2 m-2">
                        <FaUser />
                        <input
                            type="username"
                            id="username"
                            name="username"
                            className="grow"
                            placeholder="Username"
                            onChange={loginChange}
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
                            onChange={loginChange}
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="btn btn-primary m-2 w-1/3 float-right"
                    >
                        Login
                    </button>
                </form>
            </div>
        </section>
    );
};

export default LoginPage;
