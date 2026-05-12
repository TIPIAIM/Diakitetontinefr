 
import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import useAuth from "../../hooks/useAuth";
import useAuthStore from "../../store/authStore";
import { getRedirectByRole } from "../../utils/authRedirect";

export default function Register() {
  const { register, loading } = useAuth();
  const { token, user, isAuthReady } = useAuthStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  if (!isAuthReady) {
    return null;
  }

  if (token) {
    return <Navigate to={getRedirectByRole(user?.role)} replace />;
  }

  const handleRegister = async (values) => {
    setMessage("");

    try {
      const response = await register(values);

      setMessage(
        response?.message ||
          "Inscription réussie. Vérifie maintenant ton email."
      );

      navigate("/verify-email", {
        state: { email: values.email },
      });
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendErrors = error?.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setMessage(`${backendMessage} - ${backendErrors.join(" | ")}`);
      } else {
        setMessage(backendMessage || "Erreur lors de l'inscription.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "560px",
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
        <h1 style={{ margin: 0 }}>Inscription</h1>
        <p style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.5 }}>
          Créez votre compte puis validez votre adresse email pour
          activer votre accès.
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

      <RegisterForm onSubmit={handleRegister} loading={loading} />

      <p style={{ margin: 0, color: "#4b5563" }}>
        Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}