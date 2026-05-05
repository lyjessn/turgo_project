import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ProtectedRoute = ({ roles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        Memuat...
      </div>
    );
  }

  if (!user) {
    
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const normalizedRole = role?.toLowerCase().replace(/\s+/g, "_");

  if (roles && !roles.includes(normalizedRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;