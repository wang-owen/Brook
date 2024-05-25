import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = ({}: {}) => {
    return (
        <body className="animate-fadeIn bg-gray-200">
            <Navbar />
            <Outlet />
            <Footer />
            <ToastContainer newestOnTop />
        </body>
    );
};

export default MainLayout;
