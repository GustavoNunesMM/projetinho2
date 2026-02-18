import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "@heroui/react";

import { useAuth } from "./contexts/AuthContext";
import { Login } from "./Pages/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./Pages/home";
import DevTools from "./components/common/DevTools";
import DevOnly from "./components/common/DevOnly";

import UpdateNotification from "@/components/common/UpdateNotification";
import { useUpdater } from "@/hooks/useUpdater";
import DefaultLayout from "@/layouts/default";

const App = () => {
  const { isAuthenticated, loading } = useAuth();
  const { checkForUpdates } = useUpdater();

  useEffect(() => {
    checkForUpdates();

    const interval = setInterval(
      () => {
        checkForUpdates();
      },
      60 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          element={!isAuthenticated ? <Login /> : <Navigate to="/home" />}
          path="/auth"
        />
        <Route
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <Home />
              </DefaultLayout>
            </ProtectedRoute>
          }
          path="/home"
        />
        <Route
          element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />}
          path="*"
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