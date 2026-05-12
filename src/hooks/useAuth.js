 
import { useCallback, useState } from "react";
import useAuthStore from "../store/authStore";
import {
  registerRequest,
  verifyEmailRequest,
  resendVerificationCodeRequest,
  loginRequest,
  meRequest,
  refreshRequest,
  logoutRequest,
} from "../services/auth.service";

const normalizeAuthResponse = (response) => {
  if (!response || typeof response !== "object") {
    return { user: null, accessToken: null };
  }

  if (response.user || response.accessToken) {
    return {
      user: response.user || null,
      accessToken: response.accessToken || null,
    };
  }

  if (response.data && (response.data.user || response.data.accessToken)) {
    return {
      user: response.data.user || null,
      accessToken: response.data.accessToken || null,
    };
  }

  return { user: null, accessToken: null };
};

export default function useAuth() {
  const {
    user,
    token,
    isAuthReady,
    setSession,
    updateUser,
    setAuthReady,
    clearSession,
  } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      return await registerRequest(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (payload) => {
    setLoading(true);
    try {
      return await verifyEmailRequest(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerificationCode = useCallback(async (payload) => {
    setLoading(true);
    try {
      return await resendVerificationCodeRequest(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const response = await loginRequest(payload);
        const { user, accessToken } = normalizeAuthResponse(response);

        if (!user || !accessToken) {
          throw new Error(
            "Réponse de connexion invalide : utilisateur ou token manquant."
          );
        }

        setSession({ user, token: accessToken });
        return response;
      } finally {
        setLoading(false);
      }
    },
    [setSession]
  );

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const response = await meRequest();
      const nextUser = response?.user || response?.data || null;
      updateUser(nextUser);
      return response;
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await refreshRequest();
      const { user, accessToken } = normalizeAuthResponse(response);

      if (!user || !accessToken) {
        throw new Error(
          "Réponse de refresh invalide : utilisateur ou token manquant."
        );
      }

      setSession({ user, token: accessToken });
      return response;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const bootstrapAuth = useCallback(async () => {
    if (isAuthReady) return;

    try {
      const response = await refreshRequest();
      const { user, accessToken } = normalizeAuthResponse(response);

      if (user && accessToken) {
        setSession({ user, token: accessToken });
      } else {
        clearSession();
      }
    } catch (_error) {
      clearSession();
    } finally {
      setAuthReady(true);
    }
  }, [isAuthReady, setSession, clearSession, setAuthReady]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (_error) {
      // même si ça échoue côté backend, on nettoie côté frontend
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return {
    user,
    token,
    isAuthReady,
    loading,
    register,
    verifyEmail,
    resendVerificationCode,
    login,
    fetchMe,
    refreshSession,
    bootstrapAuth,
    logout,
  };
}