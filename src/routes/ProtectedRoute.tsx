import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { isAuthenticated } from "../auth/Authenticated";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  useEffect(() => {
    const handleAuthUpdate = () => setIsAuth(isAuthenticated());
    window.addEventListener("storage", handleAuthUpdate);
    window.addEventListener("authUpdated", handleAuthUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleAuthUpdate);
      window.removeEventListener(
        "authUpdated",
        handleAuthUpdate as EventListener
      );
    };
  }, []);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
