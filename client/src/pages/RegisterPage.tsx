import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RegisterForm from "../components/RegisterForm";
import { LoginContext } from "../App.jsx";

const RegisterPage = () => {
    const { setLoggedIn } = useContext(LoginContext);
    const navigate = useNavigate();

    const register = async (credentials: Object) => {
        const response = await Promise.all([
            await fetch("http://127.0.0.1:8000/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
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

        const registerStatus = response[0];
        const loginStatus = response[1];
        console.log(registerStatus.json());
        console.log(loginStatus.json());

        if (registerStatus.ok && loginStatus.ok) {
            setLoggedIn(true);
            navigate("/");
            toast.success(`${String.fromCodePoint(0x1f37b)} Registered!`);
        }
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
