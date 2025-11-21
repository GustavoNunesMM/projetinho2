import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Spinner } from "@heroui/react";

const AuthScreen = () => {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <Login onSwitchToRegister={() => setShowLogin(false)} />
  ) : (
    <Register onSwitchToLogin={() => setShowLogin(true)} />
  );
};

const MainApp = () => {
  return (
    <div className="min-h-screen">
      <h1>Aplicação Principal</h1>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return isAuthenticated ? (
    <ProtectedRoute>
      <MainApp />
    </ProtectedRoute>
  ) : (
    <AuthScreen />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;