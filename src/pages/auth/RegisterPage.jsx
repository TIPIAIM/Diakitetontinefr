import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Building2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";

import colors from "../../Styles/colors";
import { registerRequest } from "../../services/auth.Service";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    telephone: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getErrorMessage = (error) => {
    const message =
      error?.response?.data?.message ||
      "Erreur lors de la création du compte.";

    const errors = error?.response?.data?.errors;

    if (Array.isArray(errors) && errors.length > 0) {
      return `${message} ${errors.join(" ")}`;
    }

    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await registerRequest({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        address: form.address.trim(),
        password: form.password,
      });

      toast.success("Compte administrateur créé. Vérifiez votre email.");

      navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
   

        <AdminNotice>
          <ShieldCheck size={20} />

          <div>
            <strong>Compte administrateur unique</strong>
            <span>
              Cette plateforme accepte un seul administrateur. Une fois ce
              compte créé, les autres inscriptions seront automatiquement
              bloquées pour protéger la gestion de la tontine.
            </span>
          </div>
        </AdminNotice>

        <Form onSubmit={handleSubmit}>
          <Grid>
            <Field>
              <Label>Nom complet</Label>

              <InputWrap>
                <UserRound size={18} />
                <Input
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Nom complet"
                  required
                />
              </InputWrap>
            </Field>

            <Field>
              <Label>Email</Label>

              <InputWrap>
                <Mail size={18} />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="exemple@email.com"
                  required
                />
              </InputWrap>
            </Field>

            <Field>
              <Label>Téléphone</Label>

              <InputWrap>
                <Phone size={18} />
                <Input
                  value={form.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                  placeholder="622000000"
                  required
                />
              </InputWrap>
            </Field>

            <Field>
              <Label>Mot de passe</Label>

              <InputWrap>
                <Lock size={18} />
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="8 caractères, lettre et chiffre"
                  required
                />
              </InputWrap>
            </Field>

            <Field $full>
              <Label>Adresse</Label>

              <InputWrap>
                <Building2 size={18} />
                <Input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Adresse"
                />
              </InputWrap>
            </Field>
          </Grid>

          <Button type="submit" disabled={loading}>
            {loading ? "Création en cours..." : "Créer le compte admin"}
          </Button>
        </Form>

        <FooterText>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </FooterText>
      </Card>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${colors.primary} 50%,
    ${colors.primaryDark} 50%,
    ${colors.badgeApprovedBg} 50%
  );
  display: grid;
  place-items: center;
  padding: 20px;
`;

const Card = styled.section`
  width: min(780px, 100%);
  background: ${colors.white};
  border-radius: 0 24px 0 24px;
  padding: clamp(20px, 4vw, 34px);
  box-shadow: ${colors.shadowXl};
  display: grid;
  gap: 24px;
`;

 

const Title = styled.h1`
  margin: 0;
  color: ${colors.text};
  font-size: clamp(1.5rem, 3vw, 2rem);
`;

const Text = styled.p`
  margin: 0;
  color: ${colors.textSecondary};
  line-height: 1.6;
`;

const AdminNotice = styled.div`
  border: 1px solid ${colors.border};
  background: ${colors.successBg};
  color: ${colors.text};
  border-radius: 0 10px 0 0px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  svg {
    color: ${colors.primary};
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: ${colors.primary};
    font-weight: 900;
    margin-bottom: 4px;
  }

  span {
    display: block;
    color: ${colors.textSecondary};
    line-height: 1.5;
    font-size: 0.92rem;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};
`;

const Label = styled.label`
  color: ${colors.text};
  font-weight: 900;
`;

const InputWrap = styled.div`
  min-height: 50px;
  border: 1px solid ${colors.inputBorder};
  border-radius: 0 10px 0 0px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  color: ${colors.textSecondary};
  background: ${colors.inputBg};

  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 4px ${colors.primary10};
  }
`;

const Input = styled.input`
  border: 0;
  outline: 0;
  flex: 1;
  min-width: 0;
  background: transparent;
  color: ${colors.text};
`;

const Button = styled.button`
  min-height: 52px;
  border: 0;
  border-radius: 0 10px 0 0px;
  background: ${colors.gradientPrimary};
  color: ${colors.white};
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${colors.shadowLg};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  margin: 0;
  color: ${colors.textSecondary};
  text-align: center;

  a {
    color: ${colors.primary};
    font-weight: 900;
  }
`;