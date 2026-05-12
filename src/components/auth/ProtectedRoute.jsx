 //routeprotected
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getRedirectByRole } from "../../utils/authRedirect";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, user, isAuthReady } = useAuthStore();
  const location = useLocation();

  if (!isAuthReady) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    allowedRoles.length > 0 &&
    (!user?.role || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to={getRedirectByRole(user?.role)} replace />;
  }

  return children;
}