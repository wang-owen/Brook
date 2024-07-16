import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RegisterForm from "../components/RegisterForm";
import { LoginContext } from "../App";

const RegisterPage = () => {
    const { setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();

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

    return (
        <section className="h-screen flex justify-center items-center">
            <RegisterForm register={register} />
        </section>
    );
};

export default RegisterPage;
