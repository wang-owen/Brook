import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
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
            navigate("/");
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
