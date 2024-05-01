import { FormEvent } from "react";

const RegisterForm = ({ register }: { register: Function }) => {
    const registerSubmit = (event: FormEvent) => {
        event.preventDefault();

        register();
    };

    return (
        <section>
            <div className="w-full max-w-xs">
                <form
                    onSubmit={registerSubmit}
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                >
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="email"
                        >
                            Email Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            required
                        />
                    </div>
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
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default RegisterForm;
