import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
    const register = () => {};

    return (
        <>
            <section className="h-screen flex justify-center items-center">
                <RegisterForm register={register} />
            </section>
        </>
    );
};

export default RegisterPage;
