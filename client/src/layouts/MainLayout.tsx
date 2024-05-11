import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";

const MainLayout = ({loggedIn}: {loggedIn: boolean}) => {
    const navbarHeight: number = 12;
    return (
        <>
            <Navbar loggedIn={loggedIn} height={navbarHeight} />
            <div>
                <Outlet />
            </div>
            <ToastContainer />
        </>
    );
};

export default MainLayout;
