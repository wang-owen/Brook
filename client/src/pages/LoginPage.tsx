import LoginForm from "../components/LoginForm";

const LoginPage = () => {
    const login = () => {};

    return (
        <>
            <section className="h-screen flex justify-center items-center">
                <LoginForm login={login} />
            </section>
        </>
    );
};

export default LoginPage;
