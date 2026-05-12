import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import colors from "../../Styles/colors";
import { loginRequest } from "../../services/auth.Service";
import useAuthStore from "../../store/authStore";
import { getRedirectByRole } from "../../utils/roleRedirect";
import { connectSocketForCurrentUser } from "../../services/socket";

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await loginRequest(form);

      const user = response?.data?.user;
      const accessToken = response?.data?.accessToken;

      if (!user || !accessToken) {
        throw new Error("Réponse de connexion invalide.");
      }

      setSession({
        user,
        token: accessToken,
      });

      connectSocketForCurrentUser();

      toast.success("Connexion réussie.");

      navigate(getRedirectByRole(user.role), { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Erreur de connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Header>
          <Badge>
            <ShieldCheck size={18} />
            DIAK-TONTINE
          </Badge>
          <Text>
            Connectez-vous pour accéder à votre interface .
          </Text>
        </Header>

        <Form onSubmit={handleSubmit}>
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
            <Label>Mot de passe</Label>
            <InputWrap>
              <Lock size={18} />
              <Input
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </InputWrap>
          </Field>

          <Button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </Form>

        <FooterText>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
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
  width: min(460px, 100%);
  background: ${colors.white};
  border-radius: 0 10px 0 10px;
  padding: clamp(20px, 4vw, 34px);
  box-shadow: ${colors.shadowXl};
  display: grid;
  gap: 24px;
`;

const Header = styled.div`
  display: grid;
  gap: 10px;
`;

const Badge = styled.div`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${colors.successBg};
  color: ${colors.primary};
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 0 10px 0 0px;
  font-weight: 900;
  font-size: 0.82rem;
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

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
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
