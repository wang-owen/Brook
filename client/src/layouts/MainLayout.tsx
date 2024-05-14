import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = ({
    loggedIn,
    setLoggedIn,
}: {
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    return (
        <>
            <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            <Outlet />
            <Footer />
            <ToastContainer />
        </>
    );
};

export default MainLayout;
