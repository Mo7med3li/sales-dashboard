import { createBrowserRouter } from "react-router-dom";

import Dashboard from "./routes/Dashboard";
import Header from "./components/Header";
import Signin from "./components/Signin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Signin />,
  },
  {
    path: "/dashboard",
    element: (
      <>
        <Header />
        <Dashboard />
      </>
    ),
  },
]);
