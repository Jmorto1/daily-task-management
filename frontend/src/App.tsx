import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useEffect } from "react";
import { AppDataProvider } from "./context/appDataContext";
import { LangProvider } from "./context/languageContext";
import SignupPage from "./pages/signUp";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/dashboard";
import LoadingPage from "./pages/loading";
import { useAppData } from "./hooks/useAppData";
import ForgotPasswordForm from "./pages/forgetPassword";
import ResetPasswordForm from "./pages/resetPassword";
function AppRoutes() {
  const { isLoggedIn, setIsLoggedIn, loading, serverAddress } = useAppData();
  useEffect(() => {
    if (isLoggedIn) {
      let idleTimer: NodeJS.Timeout;

      const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          fetch(`${serverAddress}/users/logout/`, {
            method: "POST",
            credentials: "include",
          }).finally(() => {
            setIsLoggedIn(false);
          });
        }, 30 * 60 * 1000);
      };
      ["mousemove", "keydown", "click"].forEach((evt) =>
        window.addEventListener(evt, resetIdleTimer)
      );
      resetIdleTimer();
      const refreshToken = () => {
        fetch(`${serverAddress}/users/refresh/`, {
          method: "POST",
          credentials: "include",
        }).catch(() => setIsLoggedIn(false));
      };
      refreshToken();
      const refreshInterval = setInterval(refreshToken, 55 * 60 * 1000);

      return () => {
        clearTimeout(idleTimer);
        clearInterval(refreshInterval);
        ["mousemove", "keydown", "click"].forEach((evt) =>
          window.removeEventListener(evt, resetIdleTimer)
        );
      };
    }
  }, [isLoggedIn]);
  const router = createBrowserRouter([
    {
      path: "/dashboard",
      element: isLoggedIn ? <Dashboard /> : <Navigate to="/" />,
    },
    {
      path: "/signup",
      element: loading ? <LoadingPage /> : <SignupPage />,
    },
    {
      path: "/login",
      element: isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordForm />,
    },
    {
      path: "/reset-password/:uid/:token",
      element: <ResetPasswordForm />,
    },
    {
      path: "/",
      element: loading ? (
        <LoadingPage />
      ) : isLoggedIn ? (
        <Navigate to="/dashboard" />
      ) : (
        <Navigate to="/login" />
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AppDataProvider>
      <LangProvider>
        <AppRoutes />
      </LangProvider>
    </AppDataProvider>
  );
}

export default App;
