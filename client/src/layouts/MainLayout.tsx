import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";

const MainLayout = ({
    loggedIn,
    setLoggedIn,
}: {
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const navbarHeight: number = 12;
    return (
        <>
            <Navbar
                height={navbarHeight}
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
            />
            <Outlet />
            <ToastContainer />
        </>
    );
};

export default MainLayout;
