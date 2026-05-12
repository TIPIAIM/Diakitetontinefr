import { useMemo, useState } from "react";
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

const removeAccents = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const sanitizeFullName = (value = "") =>
  removeAccents(value).replace(/[^A-Za-z /\-.]/g, "");

const sanitizeEmail = (value = "") =>
  removeAccents(value)
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9@.\-]/g, "")
    .toLowerCase();

const sanitizeTelephone = (value = "") => value.replace(/\D/g, "").slice(0, 9);

const sanitizeAddress = (value = "") =>
  removeAccents(value).replace(/[^A-Za-z0-9 /\-.]/g, "");

const sanitizePassword = (value = "") => value.replace(/[<>]/g, "");

const sanitizeReferralCode = (value = "") =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 30);

export default function RegisterForm({ onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      telephone: "",
      address: "",
      password: "",
      role: "admin",
      referralCode: "",
    },
  });

  const passwordValue = watch("password", "");

  const passwordRules = useMemo(
    () => ({
      minLength: passwordValue.length >= 8,
      hasLetter: /[A-Za-z]/.test(passwordValue),
      hasDigit: /\d/.test(passwordValue),
    }),
    [passwordValue]
  );

  const submitHandler = (values) => {
    const payload = {
      fullName: sanitizeFullName(values.fullName.trim()).replace(/\s+/g, " "),
      email: sanitizeEmail(values.email.trim()),
      telephone: sanitizeTelephone(values.telephone.trim()),
      address: sanitizeAddress(values.address?.trim() || "").replace(
        /\s+/g,
        " "
      ),
      password: sanitizePassword(values.password),
      role: values.role,
      referralCode: sanitizeReferralCode(values.referralCode || ""),
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
        <label htmlFor="fullName" style={labelStyles}>
          Nom complet
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="Entrez votre nom complet"
          autoComplete="name"
          maxLength={120}
          aria-invalid={errors.fullName ? "true" : "false"}
          style={{
            ...inputBaseStyles,
            borderColor: errors.fullName ? "#dc2626" : "#d1d5db",
          }}
          onInput={(e) => {
            e.target.value = sanitizeFullName(e.target.value);
          }}
          {...register("fullName", {
            required: "Le nom complet est requis",
            minLength: {
              value: 2,
              message: "Le nom doit contenir au moins 2 caractères",
            },
            maxLength: {
              value: 120,
              message: "Le nom est trop long",
            },
          })}
        />
        {errors.fullName && (
          <span style={errorStyles}>{errors.fullName.message}</span>
        )}
      </div>

      <div style={fieldStyles}>
        <label htmlFor="email" style={labelStyles}>
          Email
        </label>
        <input
          id="email"
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
              message: "Email invalide",
            },
          })}
        />
        {errors.email && (
          <span style={errorStyles}>{errors.email.message}</span>
        )}
      </div>

      <div style={fieldStyles}>
        <label htmlFor="telephone" style={labelStyles}>
          Téléphone
        </label>
        <input
          id="telephone"
          type="text"
          placeholder="Ex: 612345678"
          autoComplete="tel"
          maxLength={9}
          inputMode="numeric"
          aria-invalid={errors.telephone ? "true" : "false"}
          style={{
            ...inputBaseStyles,
            borderColor: errors.telephone ? "#dc2626" : "#d1d5db",
          }}
          onInput={(e) => {
            e.target.value = sanitizeTelephone(e.target.value);
          }}
          {...register("telephone", {
            required: "Le numéro de téléphone est requis",
            pattern: {
              value: /^\d{9}$/,
              message:
                "Le numéro de téléphone doit contenir exactement 9 chiffres.",
            },
          })}
        />
        {errors.telephone && (
          <span style={errorStyles}>{errors.telephone.message}</span>
        )}
      </div>

      <div style={fieldStyles}>
        <label htmlFor="address" style={labelStyles}>
          Adresse <span style={hintStyles}>(facultatif)</span>
        </label>
        <input
          id="address"
          type="text"
          placeholder="Votre adresse"
          autoComplete="street-address"
          maxLength={250}
          aria-invalid={errors.address ? "true" : "false"}
          style={{
            ...inputBaseStyles,
            borderColor: errors.address ? "#dc2626" : "#d1d5db",
          }}
          onInput={(e) => {
            e.target.value = sanitizeAddress(e.target.value);
          }}
          {...register("address", {
            maxLength: {
              value: 250,
              message: "Adresse trop longue",
            },
          })}
        />
        {errors.address && (
          <span style={errorStyles}>{errors.address.message}</span>
        )}
      </div>

      <div style={fieldStyles}>
        <label htmlFor="role" style={labelStyles}>
          Type de compte
        </label>
        <select id="role" style={inputBaseStyles} {...register("role")}>
          <option value="member">Membre</option>
          <option value="company">Entreprise</option>
        </select>
      </div>

      <div style={fieldStyles}>
        <label htmlFor="referralCode" style={labelStyles}>
          Code de parrainage <span style={hintStyles}>(facultatif)</span>
        </label>
        <input
          id="referralCode"
          type="text"
          placeholder="Ex: SEMAB-ABC123"
          maxLength={30}
          aria-invalid={errors.referralCode ? "true" : "false"}
          style={{
            ...inputBaseStyles,
            borderColor: errors.referralCode ? "#dc2626" : "#d1d5db",
          }}
          onInput={(e) => {
            e.target.value = sanitizeReferralCode(e.target.value);
          }}
          {...register("referralCode", {
            pattern: {
              value: /^[A-Z0-9-]{0,30}$/,
              message: "Le code de parrainage est invalide.",
            },
          })}
        />
        {!errors.referralCode && (
          <span style={hintStyles}>
            Si un membre t’a invité, saisis son code ici.
          </span>
        )}
        {errors.referralCode && (
          <span style={errorStyles}>{errors.referralCode.message}</span>
        )}
      </div>

      <div style={fieldStyles}>
        <label htmlFor="password" style={labelStyles}>
          Mot de passe
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Créez un mot de passe"
            autoComplete="new-password"
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
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                message:
                  "Le mot de passe doit contenir au moins 8 caractères, avec une lettre et un chiffre",
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

        {!errors.password && (
          <div style={{ display: "grid", gap: 4 }}>
            <span
              style={{
                ...hintStyles,
                color: passwordRules.minLength ? "#15803d" : "#6b7280",
              }}
            >
              • Au moins 8 caractères
            </span>
            <span
              style={{
                ...hintStyles,
                color: passwordRules.hasLetter ? "#15803d" : "#6b7280",
              }}
            >
              • Au moins une lettre
            </span>
            <span
              style={{
                ...hintStyles,
                color: passwordRules.hasDigit ? "#15803d" : "#6b7280",
              }}
            >
              • Au moins un chiffre
            </span>
          </div>
        )}

        {errors.password && (
          <span style={errorStyles}>{errors.password.message}</span>
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
        {loading || isSubmitting ? "Inscription..." : "Créer mon compte"}
      </button>
    </form>
  );
}
