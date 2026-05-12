import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import VerifyEmailForm from "./VerifyEmailForm";
import useAuth from "../../hooks/useAuth";

export default function VerifyEmail() {
  const { verifyEmail, resendVerificationCode, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();
  const location = useLocation();

  const defaultEmail = location.state?.email || "";

  const handleVerify = async (values) => {
    setMessage("");
    setMessageType("info");

    try {
      const response = await verifyEmail(values);

      setMessage(response?.message || "Adresse email vérifiée avec succès.");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendErrors = error?.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setMessage(`${backendMessage} - ${backendErrors.join(" | ")}`);
      } else {
        setMessage(backendMessage || "Erreur lors de la vérification.");
      }

      setMessageType("error");
    }
  };

  const handleResend = async (values) => {
    setMessage("");
    setMessageType("info");

    try {
      const response = await resendVerificationCode(values);

      setMessage(
        response?.message ||
          "Un nouveau code de vérification a été envoyé."
      );
      setMessageType("success");
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendErrors = error?.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setMessage(`${backendMessage} - ${backendErrors.join(" | ")}`);
      } else {
        setMessage(backendMessage || "Erreur lors du renvoi du code.");
      }

      setMessageType("error");
    }
  };

  const getMessageStyles = () => {
    if (messageType === "success") {
      return {
        border: "1px solid #86efac",
        background: "#f0fdf4",
        color: "#166534",
      };
    }

    if (messageType === "error") {
      return {
        border: "1px solid #fca5a5",
        background: "#fef2f2",
        color: "#991b1b",
      };
    }

    return {
      border: "1px solid #d1d5db",
      background: "#f9fafb",
      color: "#111827",
    };
  };

  return (
    <div
      style={{
        maxWidth: "540px",
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
        <h1 style={{ margin: 0 }}>Vérification email</h1>
        <p style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.5 }}>
          Entrez le code reçu par email pour activer votre compte et finaliser
          votre inscription.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            lineHeight: 1.5,
            ...getMessageStyles(),
          }}
        >
          {message}
        </div>
      )}

      <VerifyEmailForm
        onSubmit={handleVerify}
        onResend={handleResend}
        loading={loading}
        defaultEmail={defaultEmail}
      />

      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: 0, color: "#4b5563" }}>
          Déjà vérifié ? <Link to="/login">Se connecter</Link>
        </p>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
          Utilise toujours le dernier code reçu si tu as demandé un renvoi.
        </p>
      </div>
    </div>
  );
}