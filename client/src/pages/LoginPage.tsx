import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { toast } from "react-toastify";
import { LoginContext } from "../App.jsx";

const LoginPage = () => {
    const { setLoggedIn } = useContext(LoginContext);

    const navigate = useNavigate();

    const login = async (credentials: Object) => {
        const response = await fetch("http://127.0.0.1:8000/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
            credentials: "include",
        });

        const data = await response.json();
        console.log(data.message);

        if (response.ok) {
            setLoggedIn(true);
            navigate("/");
            toast.success(
                `${String.fromCodePoint(0x1f44b)} Logged in!`
            );
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
