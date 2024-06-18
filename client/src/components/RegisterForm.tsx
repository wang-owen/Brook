import { FormEvent, useState } from "react";
import { FaUser, FaKey } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";

const RegisterForm = ({ register }: { register: Function }) => {
    const [inputs, setInputs] = useState({});

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
    );
};

export default RegisterForm;
