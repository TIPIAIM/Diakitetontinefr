import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getRedirectByRole } from "../../utils/roleRedirect";

export default function GuestOnly() {
  const { user, token, isAuthReady } = useAuthStore();

  if (!isAuthReady) {
    return null;
  }

  if (user && token) {
    return <Navigate to={getRedirectByRole(user.role)} replace />;
  }

  return <Outlet />;
}