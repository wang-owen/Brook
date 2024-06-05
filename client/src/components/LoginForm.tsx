import { FormEvent, useState } from "react";
import { FaUser, FaKey } from "react-icons/fa6";

const LoginForm = ({ login }: { login: Function }) => {
    const [inputs, setInputs] = useState({});

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
    );
};

export default LoginForm;
