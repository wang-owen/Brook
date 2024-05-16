import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = ({}: {}) => {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
            <ToastContainer newestOnTop />
        </>
    );
};

export default MainLayout;
