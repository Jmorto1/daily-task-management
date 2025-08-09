import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppDataProvider } from "./context/appDataContext";
import { LangProvider } from "./context/languageContext";
import SignupPage from "./pages/singUp";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/dashboard";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
]);
function App() {
  return (
    <AppDataProvider>
      <LangProvider>
        <RouterProvider router={router} />
      </LangProvider>
    </AppDataProvider>
  );
}

export default App;
