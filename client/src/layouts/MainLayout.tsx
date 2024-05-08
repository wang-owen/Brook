import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";

const MainLayout = () => {
    const navbarHeight: number = 12;
    return (
        <>
            <Navbar height={navbarHeight} />
            <div>
                <Outlet />
            </div>
            <ToastContainer />
        </>
    );
};

export default MainLayout;
