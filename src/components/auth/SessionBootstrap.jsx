import { useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { refreshRequest } from "../../services/auth.service";
import { connectSocketForCurrentUser } from "../../services/socket";

export default function SessionBootstrap({ children }) {
  const setSession = useAuthStore((state) => state.setSession);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await refreshRequest();

        if (!mounted) return;

        const user = response?.data?.user;
        const accessToken = response?.data?.accessToken;

        if (user && accessToken) {
          setSession({
            user,
            token: accessToken,
          });

          connectSocketForCurrentUser();
        } else {
          clearSession();
        }
      } catch (_error) {
        if (!mounted) return;
        clearSession();
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [setSession, setAuthReady, clearSession]);

  return children;
}