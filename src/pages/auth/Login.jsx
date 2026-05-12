import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import useAuth from "../../hooks/useAuth";
import useAuthStore from "../../store/authStore";
import { getRedirectByRole } from "../../utils/authRedirect";

export default function Login() {
  const { login, loading } = useAuth();
  const { token, user, isAuthReady } = useAuthStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  if (!isAuthReady) return null;

  if (token) {
    return <Navigate to={getRedirectByRole(user?.role)} replace />;
  }

  const handleLogin = async (values) => {
    setMessage("");

    try {
      const response = await login(values);

      const role =
        response?.user?.role ||
        response?.data?.user?.role ||
        user?.role;

      setMessage(response?.message || "Connexion réussie.");
      navigate(getRedirectByRole(role), { replace: true });
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendErrors = error?.response?.data?.errors;

      if (backendMessage?.includes("pas encore vérifiée")) {
        navigate("/verify-email", {
          state: { email: values.email },
        });
        return;
      }

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setMessage(`${backendMessage} - ${backendErrors.join(" | ")}`);
      } else {
        setMessage(backendMessage || "Erreur lors de la connexion.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "28px",
        display: "grid",
        gap: "18px",
      }}
    >
      <div>
        <h1 style={{ margin: 0 }}>Connexion</h1>
        <p style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.5 }}>
          Connectez-vous à votre compte .
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            color: "#111827",
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      )}

      <LoginForm onSubmit={handleLogin} loading={loading} />

      <p style={{ margin: 0, color: "#4b5563" }}>
        Vous n’avez pas encore de compte ?{" "}
        <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}