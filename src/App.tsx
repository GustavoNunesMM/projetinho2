import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Spinner } from "@heroui/react";
import UpdateNotification from '@/components/common/UpdateNotification';
import { useUpdater } from '@/hooks/useUpdater';

import Home from "./Pages/home";

const AuthScreen = () => {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <Login onSwitchToRegister={() => setShowLogin(false)} />
  ) : (
    <Register onSwitchToLogin={() => setShowLogin(true)} />
  );
};

const App = () => {
  const { isAuthenticated, loading } = useAuth();
   const { checkForUpdates } = useUpdater();

  useEffect(() => {
    checkForUpdates();
    
    const interval = setInterval(() => {
      checkForUpdates();
    }, 60 * 60 * 1000); 

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
        <Route path="/auth" element={!isAuthenticated ? <AuthScreen /> : <Navigate to="/home" />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />} />
      </Routes>
      <UpdateNotification />
    </>
  );
};

export default App;