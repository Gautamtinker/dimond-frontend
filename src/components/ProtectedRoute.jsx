import { Navigate, useLocation } from "react-router-dom";
import { useMemo } from "react";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check localStorage directly for token (available immediately)
  // Use useMemo to prevent unnecessary re-renders
  const isAuthenticated = useMemo(() => {
    return !!localStorage.getItem("token");
  }, []);

  if (!isAuthenticated) {
    // No token found, redirect to login, but preserve the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists, allow access to protected route
  return children;
};

export default ProtectedRoute;
