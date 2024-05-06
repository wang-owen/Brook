import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
    const navigate = useNavigate();

    const register = async (credentials: Object) => {
        const response = await fetch("http://127.0.0.1:8000/register/", {
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
                <RegisterForm register={register} />
            </section>
        </>
    );
};

export default RegisterPage;
