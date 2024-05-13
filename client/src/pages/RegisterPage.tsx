import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { toast } from "react-toastify";

const RegisterPage = ({
    setLoggedIn,
}: {
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
            toast.success("Registered");
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
