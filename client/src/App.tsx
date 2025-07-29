import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  );
}

export default App;
