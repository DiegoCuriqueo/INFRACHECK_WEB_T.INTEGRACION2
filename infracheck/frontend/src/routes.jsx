import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Home from "./pages/home";
import Profile from "./pages/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Home /> },       // /
      { path: "perfil", element: <Profile /> }, // /perfil
    ],
  },
]);
