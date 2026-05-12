import { useState } from "react";
import { useForm } from "react-hook-form";

const fieldStyles = {
  display: "grid",
  gap: 6,
};

const inputBaseStyles = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
  boxSizing: "border-box",
};

const labelStyles = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#111827",
};

const hintStyles = {
  fontSize: "12px",
  color: "#6b7280",
};

const errorStyles = {
  fontSize: "12px",
  color: "#b91c1c",
};

// Supprime les accents
const removeAccents = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Email : lettres/chiffres + @ . -
const sanitizeEmail = (value = "") =>
  removeAccents(value)
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9@.\-]/g, "")
    .toLowerCase();

// Mot de passe : on ne filtre pas agressivement pour ne pas affaiblir la sécurité
const sanitizePassword = (value = "") => value.replace(/[<>]/g, "");

export default function LoginForm({ onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitHandler = (values) => {
    const payload = {
      email: sanitizeEmail(values.email.trim()),
      password: sanitizePassword(values.password),
    };

    onSubmit(payload);
  };

  const isDisabled = loading || isSubmitting || !isValid;

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      style={{ display: "grid", gap: 16 }}
      noValidate
    >
      <div style={fieldStyles}>
        <label htmlFor="login-email" style={labelStyles}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="exemple@gmail.com"
          autoComplete="email"
          maxLength={254}
          inputMode="email"
          aria-invalid={errors.email ? "true" : "false"}
          style={{
            ...inputBaseStyles,
            borderColor: errors.email ? "#dc2626" : "#d1d5db",
          }}
          onInput={(e) => {
            e.target.value = sanitizeEmail(e.target.value);
          }}
          {...register("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[A-Za-z0-9.\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/,
              message:
                "Email invalide. Caractères autorisés : lettres, chiffres, @, point et tiret.",
            },
          })}
        />
        {!errors.email && (
          <span style={hintStyles}>
            Caractères autorisés : lettres, chiffres, @, point et tiret.
          </span>
        )}
        {errors.email && <span style={errorStyles}>{errors.email.message}</span>}
      </div>

      <div style={fieldStyles}>
        <label htmlFor="login-password" style={labelStyles}>
          Mot de passe
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Entrez votre mot de passe"
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : "false"}
            style={{
              ...inputBaseStyles,
              borderColor: errors.password ? "#dc2626" : "#d1d5db",
              paddingRight: "90px",
            }}
            onInput={(e) => {
              e.target.value = sanitizePassword(e.target.value);
            }}
            {...register("password", {
              required: "Le mot de passe est requis",
              minLength: {
                value: 8,
                message:
                  "Le mot de passe doit contenir au moins 8 caractères",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#374151",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        </div>
        {errors.password ? (
          <span style={errorStyles}>{errors.password.message}</span>
        ) : (
          <span style={hintStyles}>
            Le mot de passe doit correspondre à celui défini à l’inscription.
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          border: "none",
          cursor: isDisabled ? "not-allowed" : "pointer",
          background: isDisabled ? "#9ca3af" : "#111827",
          color: "#ffffff",
          fontWeight: 600,
        }}
      >
        {loading || isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}