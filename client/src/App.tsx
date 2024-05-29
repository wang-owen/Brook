import { useState, useEffect, createContext } from "react";
import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from "react-router-dom";
import Cookies from "js-cookie";
import MainLayout from "./layouts/MainLayout";
import BrewPage from "./pages/BrewPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

interface LoginContextProps {
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoginContext = createContext<LoginContextProps>({
    loggedIn: false,
    setLoggedIn: () => {},
});

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const fetchLoggedIn = async () => {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/get-logged-in`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": Cookies.get("csrftoken") || "",
                    },
                    credentials: "include",
                }
            );

            if (response.headers.get("Content-Type") !== null) {
                const data = await response.json();
                setLoggedIn(data.loggedIn);
            }
        };
        fetchLoggedIn();
    });

    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<MainLayout />}>
                <Route index element={<BrewPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>
        )
    );
    return (
        <LoginContext.Provider value={{ loggedIn, setLoggedIn }}>
            <RouterProvider router={router} />
        </LoginContext.Provider>
    );
};

export default App;
