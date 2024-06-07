import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = ({}: {}) => {
    return (
        <div className="animate-fadeIn bg-stone-200">
            <Navbar />
            <Outlet />
            <Footer />
            <ToastContainer newestOnTop />
        </div>
    );
};

export default MainLayout;
