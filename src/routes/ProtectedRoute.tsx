import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { isAuthenticated } from "../auth/Authenticated";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
