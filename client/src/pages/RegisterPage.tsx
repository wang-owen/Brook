import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
    const navigate = useNavigate();

    const register = async (credentials: Object) => {
        const response = await Promise.all([
            await fetch("http://127.0.0.1:8000/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
                credentials: "include",
            }),
            await fetch("http://127.0.0.1:8000/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
                credentials: "include",
            }),
        ]);

        navigate("/");
    };

    return (
        <>
            <section className="h-screen flex justify-center items-center">
                <RegisterForm register={register} />
            </section>
        </>
    );
};

export default RegisterPage;
