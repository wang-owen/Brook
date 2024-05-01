import { FormEvent } from "react";

const LoginForm = ({ login }: { login: Function }) => {
    const loginSubmit = (event: FormEvent) => {
        event.preventDefault();

        login();
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
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            id="username"
                            name="username"
                            type="text"
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
                            type="button"
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
