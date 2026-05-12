import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getRedirectByRole } from "../../utils/roleRedirect";

export default function RequireAuth({ allowedRoles = [] }) {
  const location = useLocation();
  const { user, token, isAuthReady } = useAuthStore();

  if (!isAuthReady) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRedirectByRole(user.role)} replace />;
  }

  return <Outlet />;
}