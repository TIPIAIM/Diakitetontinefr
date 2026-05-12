// src/pages/admin/dashboard/DashboardPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  LayoutDashboard,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import dashboardService from "../../../services/dashboardService";

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

const now = new Date();

const monthOptions = Array.from({ length: 12 }).map((_, index) => {
  const month = index + 1;
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(new Date(2026, index, 1));

  return {
    value: month,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "GNF",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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

const getInitials = (name = "") => {
  const clean = String(name || "").trim();

  if (!clean) return "M";

  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [period, setPeriod] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const data = await dashboardService.getOverview({
        month: period.month,
        year: period.year,
      });

      setOverview(data || null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const mainCards = useMemo(
    () => [
      {
        title: "Membres actifs",
        value: overview?.members?.active || 0,
        icon: Users,
        tone: "navy",
        description: `${overview?.members?.total || 0} membre(s) enregistré(s)`,
      },
      {
        title: "Cotisations payées",
        value: overview?.contributions?.paid || 0,
        icon: CheckCircle2,
        tone: "green",
        description: `${overview?.contributions?.paymentRate || 0}% de paiement`,
      },
      {
        title: "Cotisations en attente",
        value: overview?.contributions?.pending || 0,
        icon: Clock3,
        tone: "warning",
        description: "Paiements non encore reçus",
      },
      {
        title: "Cotisations en retard",
        value: overview?.contributions?.late || 0,
        icon: AlertTriangle,
        tone: "danger",
        description: "À relancer rapidement",
      },
    ],
    [overview]
  );

  const financeCards = useMemo(
    () => [
      {
        label: "Total attendu",
        value: formatCurrency(overview?.contributions?.totalExpected || 0),
      },
      {
        label: "Total encaissé",
        value: formatCurrency(overview?.contributions?.totalCollected || 0),
      },
      {
        label: "Reste à encaisser",
        value: formatCurrency(overview?.contributions?.remainingToCollect || 0),
      },
      {
        label: "Total distribué",
        value: formatCurrency(overview?.payouts?.totalDistributed || 0),
      },
      {
        label: "Solde théorique",
        value: formatCurrency(overview?.treasury?.theoreticalBalance || 0),
      },
      {
        label: "Bénéficiaires payés",
        value: overview?.payouts?.total || 0,
      },
    ],
    [overview]
  );

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

            <h1>Tableau de bord général</h1>

            <p>
              Vue centrale de la tontine : membres, cycle actif, cotisations,
              bénéficiaires, encaissements, retards, alertes et dernières
              opérations.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <CalendarDays size={15} />
                Période : {overview?.period?.label || "—"}
              </HeroMetaItem>

              <HeroMetaItem>
                <RefreshCcw size={15} />
                Cycle : {overview?.cycle?.name || "Aucun cycle actif"}
              </HeroMetaItem>

              <HeroMetaItem>
                <TrendingUp size={15} />
                Solde :{" "}
                {formatCurrency(overview?.treasury?.theoreticalBalance || 0)}
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <PeriodBox>
              <select
                value={period.month}
                onChange={(event) =>
                  setPeriod((prev) => ({
                    ...prev,
                    month: Number(event.target.value),
                  }))
                }
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={period.year}
                onChange={(event) =>
                  setPeriod((prev) => ({
                    ...prev,
                    year: Number(event.target.value),
                  }))
                }
              />
            </PeriodBox>

            <PrimaryButton type="button" onClick={fetchDashboard}>
              {loading ? <Spinner /> : <RefreshCcw size={17} />}
              Actualiser
            </PrimaryButton>
          </HeroAction>
        </HeroContent>

        <StatsGrid>
          {mainCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <StatCard
                key={card.title}
                as={motion.article}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.38, delay: 0.05 * index }}
              >
                <StatIcon $tone={card.tone}>
                  <Icon size={22} />
                </StatIcon>

                <StatBody>
                  <span>{card.title}</span>
                  <strong>{loading ? "..." : card.value}</strong>
                  <small>{card.description}</small>
                </StatBody>
              </StatCard>
            );
          })}
        </StatsGrid>
      </Hero>

      <ContentGrid>
        <PanelCard>
          <PanelHeader>
            <div>
              <SectionKicker>
                <LayoutDashboard size={15} />
                Synthèse du cycle
              </SectionKicker>
              <h2>Cycle actif</h2>
            </div>
          </PanelHeader>

          {overview?.cycle ? (
            <CycleGrid>
              <CycleInfo>
                <span>Nom du cycle</span>
                <strong>{overview.cycle.name}</strong>
              </CycleInfo>

              <CycleInfo>
                <span>Statut</span>
                <strong>{overview.cycle.status}</strong>
              </CycleInfo>

              <CycleInfo>
                <span>Membres du cycle</span>
                <strong>{overview.cycle.membersCount || 0}</strong>
              </CycleInfo>

              <CycleInfo>
                <span>Cotisation</span>
                <strong>{formatCurrency(overview.cycle.contributionAmount)}</strong>
              </CycleInfo>

              <CycleInfo>
                <span>Date de début</span>
                <strong>{formatDate(overview.cycle.startDate)}</strong>
              </CycleInfo>

              <CycleInfo>
                <span>Fin prévue</span>
                <strong>{formatDate(overview.cycle.expectedEndDate)}</strong>
              </CycleInfo>
            </CycleGrid>
          ) : (
            <EmptyBox>
              Aucun cycle actif. Crée un cycle avant de générer les cotisations.
            </EmptyBox>
          )}
        </PanelCard>

        <PanelCard>
          <PanelHeader>
            <div>
              <SectionKicker>
                <Banknote size={15} />
                Situation financière
              </SectionKicker>
              <h2>Encaissements et distributions</h2>
            </div>
          </PanelHeader>

          <FinanceGrid>
            {financeCards.map((item) => (
              <FinanceItem key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </FinanceItem>
            ))}
          </FinanceGrid>
        </PanelCard>

        <SplitGrid>
          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <AlertTriangle size={15} />
                  Alertes
                </SectionKicker>
                <h2>Points à surveiller</h2>
              </div>
            </PanelHeader>

            <AlertList>
              {(overview?.alerts || []).map((alert, index) => (
                <AlertItem key={`${alert.title}-${index}`} $type={alert.type}>
                  <AlertIcon $type={alert.type}>
                    {alert.type === "success" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </AlertIcon>

                  <div>
                    <strong>{alert.title}</strong>
                    <span>{alert.message}</span>
                  </div>
                </AlertItem>
              ))}
            </AlertList>
          </PanelCard>

          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <Users size={15} />
                  Membres
                </SectionKicker>
                <h2>Répartition des membres</h2>
              </div>
            </PanelHeader>

            <MemberStats>
              <MemberStat>
                <span>Total</span>
                <strong>{overview?.members?.total || 0}</strong>
              </MemberStat>

              <MemberStat>
                <span>Actifs</span>
                <strong>{overview?.members?.active || 0}</strong>
              </MemberStat>

              <MemberStat>
                <span>Inactifs</span>
                <strong>{overview?.members?.inactive || 0}</strong>
              </MemberStat>

              <MemberStat>
                <span>Suspendus</span>
                <strong>{overview?.members?.suspended || 0}</strong>
              </MemberStat>
            </MemberStats>
          </PanelCard>
        </SplitGrid>

        <SplitGrid>
          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <WalletCards size={15} />
                  Dernières cotisations
                </SectionKicker>
                <h2>Paiements récents</h2>
              </div>
            </PanelHeader>

            <RecentList>
              {(overview?.recent?.contributions || []).length > 0 ? (
                overview.recent.contributions.map((item) => (
                  <RecentItem key={item.id}>
                    <Avatar>{getInitials(item.member?.fullName)}</Avatar>

                    <div>
                      <strong>{item.member?.fullName || "Membre"}</strong>
                      <span>
                        {formatCurrency(item.amountPaid)} ·{" "}
                        {formatDate(item.paymentDate)}
                      </span>
                    </div>

                    <RecentBadge $type="success">Payée</RecentBadge>
                  </RecentItem>
                ))
              ) : (
                <EmptyBox>Aucune cotisation payée récemment.</EmptyBox>
              )}
            </RecentList>
          </PanelCard>

          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <Crown size={15} />
                  Derniers bénéficiaires
                </SectionKicker>
                <h2>Distributions récentes</h2>
              </div>
            </PanelHeader>

            <RecentList>
              {(overview?.recent?.payouts || []).length > 0 ? (
                overview.recent.payouts.map((item) => (
                  <RecentItem key={item.id}>
                    <Avatar>{getInitials(item.member?.fullName)}</Avatar>

                    <div>
                      <strong>{item.member?.fullName || "Bénéficiaire"}</strong>
                      <span>
                        Tour {item.roundNumber} · {formatCurrency(item.amountPaid)}
                      </span>
                    </div>

                    <RecentBadge $type="gold">Payé</RecentBadge>
                  </RecentItem>
                ))
              ) : (
                <EmptyBox>Aucun bénéficiaire payé récemment.</EmptyBox>
              )}
            </RecentList>
          </PanelCard>
        </SplitGrid>
      </ContentGrid>
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

  @media (max-width: 950px) {
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

  @media (max-width: 950px) {
    justify-content: flex-start;
  }
`;

const PeriodBox = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;

  select,
  input {
    min-height: 42px;
    border-radius: 0 14px 0 14px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.1);
    color: ${colors.white};
    padding: 0.7rem 0.8rem;
    outline: none;
    font-weight: 800;
  }

  option {
    color: ${colors.text};
  }

  input {
    width: 110px;
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
  transition: 0.2s ease;
  box-shadow: 0 14px 32px rgba(214, 168, 65, 0.24);

  &:hover {
    transform: translateY(-2px);
  }
`;

const Spinner = styled.span`
  width: 17px;
  height: 17px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 0.75s linear infinite;
`;

const StatsGrid = styled.div`
  position: relative;
  z-index: 1;
  margin-top: clamp(1.2rem, 2vw, 1.8rem);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.article`
  display: flex;
  gap: 0.85rem;
  align-items: center;
  min-width: 0;
  padding: 1rem;
  border-radius: 0 18px 0 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(14px);
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  border-radius: 0 14px 0 14px;
  display: grid;
  place-items: center;
  color: ${({ $tone }) => ($tone === "gold" ? colors.navy : colors.white)};
  background: ${({ $tone }) => {
    if ($tone === "green") return "linear-gradient(135deg, #0F6B4F, #16A34A)";
    if ($tone === "warning") return "linear-gradient(135deg, #B54708, #F79009)";
    if ($tone === "danger") return "linear-gradient(135deg, #B42318, #D92D20)";
    if ($tone === "gold") return "linear-gradient(135deg, #D6A841, #FFF1B8)";
    return "linear-gradient(135deg, #1C3F6E, #0E2D4F)";
  }};
`;

const StatBody = styled.div`
  min-width: 0;

  span,
  small {
    display: block;
    color: rgba(255, 255, 255, 0.72);
  }

  span {
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  strong {
    display: block;
    color: ${colors.white};
    font-size: clamp(1.15rem, 2vw, 1.6rem);
    margin: 0.22rem 0;
    line-height: 1.1;
    word-break: break-word;
  }

  small {
    font-size: 0.78rem;
    line-height: 1.4;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const PanelCard = styled.section`
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
  letter-spacing: 0.08em;
`;

const CycleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CycleInfo = styled.div`
  padding: 0.85rem;
  border-radius: 0 16px 0 16px;
  border: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 0.35rem;
  }

  strong {
    color: ${colors.navy};
    font-size: 0.92rem;
    word-break: break-word;
  }
`;

const FinanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FinanceItem = styled.div`
  padding: 0.9rem;
  border-radius: 0 16px 0 16px;
  border: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 0.35rem;
  }

  strong {
    color: ${colors.navy};
    font-size: 0.95rem;
    word-break: break-word;
  }
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const AlertList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const AlertItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 0 16px 0 16px;
  border: 1px solid
    ${({ $type }) => {
      if ($type === "success") return "rgba(2, 122, 72, 0.18)";
      if ($type === "danger") return "rgba(180, 35, 24, 0.18)";
      return "rgba(181, 71, 8, 0.2)";
    }};
  background: ${({ $type }) => {
    if ($type === "success") return colors.successSoft;
    if ($type === "danger") return colors.dangerSoft;
    return colors.warningSoft;
  }};

  strong {
    display: block;
    color: ${colors.navy};
    margin-bottom: 0.18rem;
  }

  span {
    color: ${colors.text};
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const AlertIcon = styled.div`
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 0 12px 0 12px;
  display: grid;
  place-items: center;
  background: ${colors.white};
  color: ${({ $type }) => {
    if ($type === "success") return colors.success;
    if ($type === "danger") return colors.danger;
    return colors.warning;
  }};
`;

const MemberStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MemberStat = styled.div`
  padding: 0.85rem;
  border-radius: 0 16px 0 16px;
  background: rgba(14, 45, 79, 0.035);
  border: 1px solid ${colors.border};

  span {
    color: ${colors.muted};
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  strong {
    display: block;
    color: ${colors.navy};
    font-size: 1.5rem;
    margin-top: 0.25rem;
  }
`;

const RecentList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const RecentItem = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0 16px 0 16px;
  background: rgba(14, 45, 79, 0.025);
  border: 1px solid ${colors.border};

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: ${colors.navy};
  }

  span {
    color: ${colors.muted};
    font-size: 0.84rem;
    margin-top: 0.12rem;
  }

  @media (max-width: 520px) {
    grid-template-columns: auto minmax(0, 1fr);

    > span {
      grid-column: 1 / -1;
      width: fit-content;
    }
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 0 14px 0 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, ${colors.navy}, ${colors.greenDark});
  color: ${colors.goldSoft};
  font-weight: 950;
`;

const RecentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.55rem;
  font-weight: 900;
  font-size: 0.75rem;
  color: ${({ $type }) => ($type === "gold" ? colors.navy : colors.success)};
  background: ${({ $type }) =>
    $type === "gold" ? colors.goldSoft : colors.successSoft};
`;

const EmptyBox = styled.div`
  padding: 1rem;
  border-radius: 0 16px 0 16px;
  background: ${colors.goldSoft};
  color: ${colors.warning};
  font-weight: 800;
  line-height: 1.55;
`;