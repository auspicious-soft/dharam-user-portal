import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { isAuthenticated } from "../auth/Authenticated";
import { readSelectedCourseHasAccess } from "@/utils/courseAccess";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [hasCourseAccess, setHasCourseAccess] = useState(
    readSelectedCourseHasAccess()
  );

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

  useEffect(() => {
    const handleCourseAccessUpdate = () => {
      setHasCourseAccess(readSelectedCourseHasAccess());
    };

    handleCourseAccessUpdate();
    window.addEventListener("storage", handleCourseAccessUpdate);
    window.addEventListener(
      "courseChanged",
      handleCourseAccessUpdate as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleCourseAccessUpdate);
      window.removeEventListener(
        "courseChanged",
        handleCourseAccessUpdate as EventListener
      );
    };
  }, []);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const isAllowedWithoutCourseAccess =
    location.pathname === "/dashboard" || location.pathname === "/profile";

  if (!hasCourseAccess && !isAllowedWithoutCourseAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
