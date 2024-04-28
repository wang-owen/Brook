import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import BrewPage from "./pages/BrewPage";

const App = () => {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<MainLayout />}>
                <Route index element={<BrewPage />} />
            </Route>
        )
    );
    return <RouterProvider router={router} />;
};

export default App;
