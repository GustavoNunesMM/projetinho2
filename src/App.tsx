import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./Pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Spinner } from "@heroui/react";
import UpdateNotification from "@/components/common/UpdateNotification";
import { useUpdater } from "@/hooks/useUpdater";
import DefaultLayout from "@/layouts/default";
import Home from "./Pages/home";
import DevTools from "./components/common/DevTools";
import DevOnly from "./components/common/DevOnly";

const App = () => {
  const { isAuthenticated, loading } = useAuth();
  const { checkForUpdates } = useUpdater();

  useEffect(() => {
    checkForUpdates();

    const interval = setInterval(
      () => {
        checkForUpdates();
      },
      60 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={!isAuthenticated ? <Login /> : <Navigate to="/home" />}
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <Home />
              </DefaultLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />}
        />
      </Routes>
      <UpdateNotification />
      <DevOnly>
        <DevTools />
      </DevOnly>
    </>
  );
};

export default App;
