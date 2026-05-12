import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";

import colors from "../../styles/colors";
import {
  resendVerificationCodeRequest,
  verifyEmailRequest,
} from "../../services/auth.service";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialEmail = useMemo(() => {
    return searchParams.get("email") || "";
  }, [searchParams]);

  const [form, setForm] = useState({
    email: initialEmail,
    code: "",
  });

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await verifyEmailRequest(form);

      toast.success("Email vérifié avec succès. Vous pouvez vous connecter.");

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors de la vérification du code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);

      await resendVerificationCodeRequest({
        email: form.email,
      });

      toast.success("Nouveau code envoyé.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Impossible de renvoyer le code."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Header>
          <Badge>Vérification email</Badge>
          <Title>Confirmer votre compte</Title>
          <Text>
            Saisissez le code à 6 chiffres envoyé à votre adresse email.
          </Text>
        </Header>

        <Form onSubmit={handleVerify}>
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="exemple@email.com"
              required
            />
          </Field>

          <Field>
            <Label>Code de vérification</Label>
            <Input
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
          </Field>

          <Button type="submit" disabled={loading}>
            {loading ? "Vérification..." : "Vérifier mon compte"}
          </Button>
        </Form>

        <SecondaryButton
          type="button"
          onClick={handleResend}
          disabled={resendLoading || !form.email}
        >
          {resendLoading ? "Envoi..." : "Renvoyer le code"}
        </SecondaryButton>

        <FooterText>
          Retour à la connexion ? <Link to="/login">Se connecter</Link>
        </FooterText>
      </Card>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.gradientPage};
  display: grid;
  place-items: center;
  padding: 20px;
`;

const Card = styled.section`
  width: min(460px, 100%);
  background: ${colors.white};
  border-radius: 0 24px 0 24px;
  padding: clamp(20px, 4vw, 34px);
  box-shadow: ${colors.shadowXl};
  display: grid;
  gap: 20px;
`;

const Header = styled.div`
  display: grid;
  gap: 10px;
`;

const Badge = styled.div`
  width: fit-content;
  background: ${colors.successBg};
  color: ${colors.primary};
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 999px;
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

const Input = styled.input`
  min-height: 50px;
  border: 1px solid ${colors.inputBorder};
  border-radius: 0 14px 0 14px;
  padding: 0 14px;
  outline: none;
  color: ${colors.text};
  background: ${colors.inputBg};

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 4px ${colors.primary10};
  }
`;

const Button = styled.button`
  min-height: 52px;
  border: 0;
  border-radius: 0 14px 0 14px;
  background: ${colors.gradientPrimary};
  color: ${colors.white};
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  min-height: 48px;
  border: 1px solid ${colors.border};
  border-radius: 0 14px 0 14px;
  background: ${colors.surface};
  color: ${colors.primary};
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