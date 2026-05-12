// src/pages/admin/settings/SettingsPage.jsx
import { useCallback, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  BellRing,
  Building2,
  CalendarDays,
  Mail,
  RefreshCcw,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import settingService from "../../../services/settingService";

const colors = {
  navy: "#0E2D4F",
  greenDark: "#0B3D2E",
  green: "#0F6B4F",
  gold: "#D6A841",
  goldSoft: "#FFF6D8",
  bg: "#F4F7F6",
  bg2: "#EAF0EE",
  white: "#FFFFFF",
  text: "#132238",
  muted: "#667085",
  border: "rgba(14, 45, 79, 0.13)",
  danger: "#B42318",
  dangerSoft: "#FEE4E2",
  success: "#027A48",
  successSoft: "#D1FADF",
  warning: "#B54708",
  warningSoft: "#FEF0C7",
  shadow: "0 22px 70px rgba(14, 45, 79, 0.14)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const defaultForm = {
  appName: "DIAKITE-TONTINE",
  organizationName: "DIAKITE-TONTINE",
  currency: "GNF",

  defaultContributionAmount: 0,
  defaultFrequency: "monthly",
  defaultPaymentStartDay: 5,
  defaultPaymentDeadlineDay: 15,

  emailNotificationsEnabled: true,
  contributionPaymentEmailEnabled: true,
  payoutPaymentEmailEnabled: true,
  reminderEmailEnabled: true,

  reminderCooldownHours: 12,
  autoMarkLateEnabled: false,

  contactEmail: "",
  contactPhone: "",
  address: "",

  reportFooterNote:
    "Rapport généré automatiquement par la plateforme DIAKITE-TONTINE.",

  notes: "",
};

const getErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Une erreur est survenue.";

  const errors = error?.response?.data?.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    return `${message} ${errors.join(" ")}`;
  }

  return message;
};

export default function SettingsPage() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      const data = await settingService.getSettings();

      setForm({
        ...defaultForm,
        ...(data || {}),
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const updated = await settingService.updateSettings(form);

      setForm({
        ...defaultForm,
        ...(updated || {}),
      });

      toast.success("Paramètres enregistrés avec succès.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Voulez-vous vraiment réinitialiser tous les paramètres ?"
      )
    ) {
      return;
    }

    try {
      setSaving(true);

      const reset = await settingService.resetSettings();

      setForm({
        ...defaultForm,
        ...(reset || {}),
      });

      toast.success("Paramètres réinitialisés avec succès.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <Hero
        as={motion.section}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.45 }}
      >
        <HeroOverlay />

        <HeroContent>
          <HeroText>
            <HeroBadge>
              <ShieldCheck size={16} />
              Administration de la tontine
            </HeroBadge>

            <h1>Paramètres de la tontine</h1>

            <p>
              Configurez les informations générales, les règles de paiement, les
              notifications, les relances et les informations utilisées dans les
              rapports.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <Building2 size={15} />
                Organisation : {form.organizationName || "—"}
              </HeroMetaItem>

              <HeroMetaItem>
                <WalletCards size={15} />
                Devise : {form.currency || "GNF"}
              </HeroMetaItem>

              <HeroMetaItem>
                <BellRing size={15} />
                Relances : {form.reminderCooldownHours || 12}h
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <GhostButton type="button" onClick={fetchSettings}>
              {loading ? <Spinner /> : <RefreshCcw size={17} />}
              Actualiser
            </GhostButton>

            <DangerButton type="button" onClick={handleReset} disabled={saving}>
              <RotateCcw size={17} />
              Réinitialiser
            </DangerButton>

            <PrimaryButton type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? <Spinner /> : <Save size={17} />}
              Enregistrer
            </PrimaryButton>
          </HeroAction>
        </HeroContent>
      </Hero>

      <FormCard as="form" onSubmit={handleSubmit}>
        <SplitGrid>
          <Panel>
            <PanelHeader>
              <SectionKicker>
                <Building2 size={15} />
                Informations générales
              </SectionKicker>
              <h2>Identité de la plateforme</h2>
            </PanelHeader>

            <FormGrid>
              <InputGroup>
                <label>Nom de l’application *</label>
                <input
                  type="text"
                  value={form.appName}
                  onChange={(event) =>
                    handleChange("appName", event.target.value)
                  }
                  placeholder="DIAKITE-TONTINE"
                />
              </InputGroup>

              <InputGroup>
                <label>Nom de l’organisation *</label>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(event) =>
                    handleChange("organizationName", event.target.value)
                  }
                  placeholder="DIAKITE-TONTINE"
                />
              </InputGroup>

              <InputGroup>
                <label>Devise</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(event) =>
                    handleChange("currency", event.target.value)
                  }
                  placeholder="GNF"
                />
              </InputGroup>

              <InputGroup>
                <label>Email de contact</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) =>
                    handleChange("contactEmail", event.target.value)
                  }
                  placeholder="contact@exemple.com"
                />
              </InputGroup>

              <InputGroup>
                <label>Téléphone de contact</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(event) =>
                    handleChange("contactPhone", event.target.value)
                  }
                  placeholder="+224..."
                />
              </InputGroup>

              <InputGroup>
                <label>Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                  placeholder="Adresse de l’organisation"
                />
              </InputGroup>
            </FormGrid>
          </Panel>

          <Panel>
            <PanelHeader>
              <SectionKicker>
                <CalendarDays size={15} />
                Règles de cotisation
              </SectionKicker>
              <h2>Paramètres par défaut</h2>
            </PanelHeader>

            <FormGrid>
              <InputGroup>
                <label>Montant de cotisation par défaut</label>
                <input
                  type="number"
                  min="0"
                  value={form.defaultContributionAmount}
                  onChange={(event) =>
                    handleChange(
                      "defaultContributionAmount",
                      event.target.value
                    )
                  }
                />
              </InputGroup>

              <InputGroup>
                <label>Fréquence</label>
                <select
                  value={form.defaultFrequency}
                  onChange={(event) =>
                    handleChange("defaultFrequency", event.target.value)
                  }
                >
                  <option value="monthly">Mensuelle</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </InputGroup>

              <InputGroup>
                <label>Début paiement</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.defaultPaymentStartDay}
                  onChange={(event) =>
                    handleChange("defaultPaymentStartDay", event.target.value)
                  }
                />
              </InputGroup>

              <InputGroup>
                <label>Jour limite</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.defaultPaymentDeadlineDay}
                  onChange={(event) =>
                    handleChange(
                      "defaultPaymentDeadlineDay",
                      event.target.value
                    )
                  }
                />
              </InputGroup>

              <InputGroup>
                <label>Délai anti-doublon relance en heures</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={form.reminderCooldownHours}
                  onChange={(event) =>
                    handleChange("reminderCooldownHours", event.target.value)
                  }
                />
              </InputGroup>

              <SwitchLine>
                <div>
                  <strong>Marquage automatique des retards</strong>
                  <span>
                    Option prévue pour automatiser le passage en retard après la
                    date limite.
                  </span>
                </div>

                <SwitchButton
                  type="button"
                  $active={form.autoMarkLateEnabled}
                  onClick={() =>
                    handleChange(
                      "autoMarkLateEnabled",
                      !form.autoMarkLateEnabled
                    )
                  }
                >
                  <span />
                </SwitchButton>
              </SwitchLine>
            </FormGrid>
          </Panel>
        </SplitGrid>

        <Panel>
          <PanelHeader>
            <SectionKicker>
              <Mail size={15} />
              Notifications email
            </SectionKicker>
            <h2>Activation des emails</h2>
          </PanelHeader>

          <SwitchGrid>
            <SwitchLine>
              <div>
                <strong>Notifications email globales</strong>
                <span>Active ou désactive les notifications email.</span>
              </div>

              <SwitchButton
                type="button"
                $active={form.emailNotificationsEnabled}
                onClick={() =>
                  handleChange(
                    "emailNotificationsEnabled",
                    !form.emailNotificationsEnabled
                  )
                }
              >
                <span />
              </SwitchButton>
            </SwitchLine>

            <SwitchLine>
              <div>
                <strong>Email paiement cotisation</strong>
                <span>
                  Confirmation envoyée quand une cotisation est marquée payée.
                </span>
              </div>

              <SwitchButton
                type="button"
                $active={form.contributionPaymentEmailEnabled}
                onClick={() =>
                  handleChange(
                    "contributionPaymentEmailEnabled",
                    !form.contributionPaymentEmailEnabled
                  )
                }
              >
                <span />
              </SwitchButton>
            </SwitchLine>

            <SwitchLine>
              <div>
                <strong>Email bénéficiaire</strong>
                <span>
                  Confirmation envoyée lorsqu’un membre reçoit la tontine.
                </span>
              </div>

              <SwitchButton
                type="button"
                $active={form.payoutPaymentEmailEnabled}
                onClick={() =>
                  handleChange(
                    "payoutPaymentEmailEnabled",
                    !form.payoutPaymentEmailEnabled
                  )
                }
              >
                <span />
              </SwitchButton>
            </SwitchLine>

            <SwitchLine>
              <div>
                <strong>Email relance</strong>
                <span>
                  Autorise l’envoi des emails de relance pour les retards.
                </span>
              </div>

              <SwitchButton
                type="button"
                $active={form.reminderEmailEnabled}
                onClick={() =>
                  handleChange(
                    "reminderEmailEnabled",
                    !form.reminderEmailEnabled
                  )
                }
              >
                <span />
              </SwitchButton>
            </SwitchLine>
          </SwitchGrid>
        </Panel>

        <Panel>
          <PanelHeader>
            <SectionKicker>
              <SlidersHorizontal size={15} />
              Rapports et observations
            </SectionKicker>
            <h2>Textes administratifs</h2>
          </PanelHeader>

          <FormGrid>
            <InputGroup $full>
              <label>Note footer des rapports</label>
              <textarea
                rows="4"
                value={form.reportFooterNote}
                onChange={(event) =>
                  handleChange("reportFooterNote", event.target.value)
                }
                placeholder="Texte affiché en bas des rapports"
              />
            </InputGroup>

            <InputGroup $full>
              <label>Notes internes</label>
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                placeholder="Observations internes..."
              />
            </InputGroup>
          </FormGrid>
        </Panel>

        <StickyFooter>
          <FooterInfo>
            <Settings size={17} />
            Dernière mise à jour :{" "}
            {form.updatedAt
              ? new Date(form.updatedAt).toLocaleString("fr-FR")
              : "—"}
          </FooterInfo>

          <FooterActions>
            <GhostDarkButton type="button" onClick={fetchSettings}>
              <RefreshCcw size={17} />
              Recharger
            </GhostDarkButton>

            <PrimaryButton type="submit" disabled={saving}>
              {saving ? <Spinner /> : <Save size={17} />}
              Enregistrer les paramètres
            </PrimaryButton>
          </FooterActions>
        </StickyFooter>
      </FormCard>
    </PageShell>
  );
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const PageShell = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(214, 168, 65, 0.18), transparent 32rem),
    linear-gradient(135deg, ${colors.bg}, ${colors.bg2});
  padding: clamp(1rem, 2vw, 2rem);
  color: ${colors.text};
  overflow-x: clip;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 0 28px 0 28px;
  background:
    linear-gradient(135deg, rgba(14, 45, 79, 0.96), rgba(11, 61, 46, 0.96)),
    radial-gradient(circle at top right, rgba(214, 168, 65, 0.35), transparent 28rem);
  box-shadow: ${colors.shadow};
  color: ${colors.white};
  padding: clamp(1.1rem, 2.5vw, 2rem);
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 44px 44px;
  opacity: 0.3;
  pointer-events: none;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1050px) {
    grid-template-columns: 1fr;
  }
`;

const HeroText = styled.div`
  max-width: 900px;

  h1 {
    margin: 0.8rem 0 0.65rem;
    font-size: clamp(1.8rem, 4vw, 3.2rem);
    line-height: 1.05;
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    max-width: 820px;
    color: rgba(255, 255, 255, 0.82);
    font-size: clamp(0.92rem, 1.5vw, 1.04rem);
    line-height: 1.75;
  }
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 0.72rem;
  border-radius: 999px;
  background: rgba(214, 168, 65, 0.16);
  border: 1px solid rgba(214, 168, 65, 0.32);
  color: ${colors.goldSoft};
  font-weight: 800;
  font-size: 0.82rem;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.1rem;
`;

const HeroMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.5rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.82rem;
  font-weight: 700;
`;

const HeroAction = styled.div`
  display: flex;
  gap: 0.7rem;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 1050px) {
    justify-content: flex-start;
  }
`;

const FormCard = styled.form`
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
  overflow: hidden;
`;

const PanelHeader = styled.div`
  margin-bottom: 1rem;

  h2 {
    margin: 0.25rem 0 0;
    color: ${colors.navy};
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    font-family: Georgia, "Times New Roman", serif;
  }
`;

const SectionKicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${colors.gold};
  font-weight: 900;
  font-size: 0.78rem;
  text-transform: uppercase;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  label {
    font-size: 0.82rem;
    font-weight: 900;
    color: ${colors.navy};
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid ${colors.border};
    background: ${colors.white};
    color: ${colors.text};
    border-radius: 0 14px 0 14px;
    padding: 0.82rem 0.9rem;
    font-size: 0.93rem;
    outline: none;
    transition: 0.2s ease;
    font-family: inherit;

    &:focus {
      border-color: rgba(214, 168, 65, 0.75);
      box-shadow: 0 0 0 4px rgba(214, 168, 65, 0.16);
    }
  }

  textarea {
    resize: vertical;
    min-height: 110px;
  }
`;

const SwitchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SwitchLine = styled.div`
  padding: 0.95rem;
  border-radius: 0 18px 0 18px;
  border: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;

  strong {
    display: block;
    color: ${colors.navy};
    margin-bottom: 0.2rem;
  }

  span {
    color: ${colors.muted};
    font-size: 0.86rem;
    line-height: 1.45;
  }
`;

const SwitchButton = styled.button`
  width: 54px;
  height: 30px;
  flex: 0 0 auto;
  border: none;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? colors.green : "#D0D5DD")};
  padding: 3px;
  cursor: pointer;
  transition: 0.2s ease;

  span {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: ${colors.white};
    transform: ${({ $active }) =>
      $active ? "translateX(24px)" : "translateX(0)"};
    transition: 0.2s ease;
  }
`;

const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 1rem;
  border: 1px solid ${colors.border};
  border-radius: 0 20px 0 20px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
  box-shadow: 0 -12px 40px rgba(14, 45, 79, 0.08);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FooterInfo = styled.div`
  color: ${colors.muted};
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 800;
`;

const FooterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: flex-end;

  @media (max-width: 760px) {
    justify-content: stretch;

    button {
      flex: 1;
    }
  }
`;

const PrimaryButton = styled.button`
  border: none;
  min-height: 42px;
  border-radius: 0 14px 0 14px;
  padding: 0.78rem 1rem;
  background: linear-gradient(135deg, ${colors.gold}, #f6d77b);
  color: ${colors.navy};
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(214, 168, 65, 0.24);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const DangerButton = styled.button`
  border: none;
  min-height: 42px;
  border-radius: 0 14px 0 14px;
  padding: 0.78rem 1rem;
  background: ${colors.dangerSoft};
  color: ${colors.danger};
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const GhostButton = styled.button`
  border: 1px solid rgba(214, 168, 65, 0.38);
  min-height: 42px;
  border-radius: 0 14px 0 14px;
  padding: 0.78rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  cursor: pointer;
`;

const GhostDarkButton = styled.button`
  border: 1px solid ${colors.border};
  min-height: 42px;
  border-radius: 0 14px 0 14px;
  padding: 0.78rem 1rem;
  background: ${colors.white};
  color: ${colors.navy};
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  cursor: pointer;
`;

const Spinner = styled.span`
  width: 17px;
  height: 17px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 0.75s linear infinite;
`;