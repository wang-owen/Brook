import { useState, useEffect } from "react";
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

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const fetchLoggedIn = async () => {
            const response = await fetch(
                "http://127.0.0.1:8000/get-logged-in",
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
    }, []);

    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route
                path="/"
                element={
                    <MainLayout loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
                }
            >
                <Route index element={<BrewPage loggedIn={loggedIn} />} />
                <Route
                    path="/register"
                    element={<RegisterPage setLoggedIn={setLoggedIn} />}
                />
                <Route
                    path="/login"
                    element={<LoginPage setLoggedIn={setLoggedIn} />}
                />
            </Route>
        )
    );
    return <RouterProvider router={router} />;
};

export default App;
