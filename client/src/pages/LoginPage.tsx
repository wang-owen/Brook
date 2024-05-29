import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { toast } from "react-toastify";
import { LoginContext } from "../App.jsx";

const LoginPage = () => {
    const { setLoggedIn } = useContext(LoginContext);

    const navigate = useNavigate();

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

    return (
        <>
            <section className="h-screen flex justify-center items-center">
                <LoginForm login={login} />
            </section>
        </>
    );
};

export default LoginPage;
