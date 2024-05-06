import { FormEvent, useState } from "react";

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
        <section>
            <div className="w-full max-w-xs">
                <form
                    onSubmit={loginSubmit}
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                >
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
                            Username
                        </label>
                        <input
                            onChange={loginChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            id="username"
                            name="username"
                            type="username"
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            onChange={loginChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="******************"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 duration-200 text-white py-2 px-4 rounded"
                            type="submit"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default LoginForm;
