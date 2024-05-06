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
        });

        const data = await response.json();
        if (response.ok) {
            navigate("/");
        }
        console.log(data.message);
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
