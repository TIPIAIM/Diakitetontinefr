// src/pages/admin/reminders/RemindersPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Mail,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import reminderService from "../../../services/reminderService";

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

const defaultFilters = {
  search: "",
  status: "",
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  page: 1,
  limit: 10,
};

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

const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "late", label: "En retard" },
];

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
    hour: "2-digit",
    minute: "2-digit",
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

const getStatusLabel = (status) => {
  switch (status) {
    case "sent":
      return "Envoyée";
    case "failed":
      return "Échouée";
    case "skipped":
      return "Ignorée";
    case "pending":
      return "En attente";
    case "late":
      return "En retard";
    default:
      return status || "—";
  }
};

export default function RemindersPage() {
  const [filters, setFilters] = useState(defaultFilters);

  const [targets, setTargets] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [targetPagination, setTargetPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [historyPagination, setHistoryPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  });

  const [targetsLoading, setTargetsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const periodLabel = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(Number(filters.year), Number(filters.month) - 1, 1));
  }, [filters.month, filters.year]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const data = await reminderService.getStats({
        month: filters.month,
        year: filters.year,
      });

      setStats({
        total: data?.total || 0,
        sent: data?.sent || 0,
        failed: data?.failed || 0,
        skipped: data?.skipped || 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, [filters.month, filters.year]);

  const fetchTargets = useCallback(async () => {
    try {
      setTargetsLoading(true);

      const data = await reminderService.getTargets({
        search: filters.search,
        status: filters.status,
        month: filters.month,
        year: filters.year,
        page: filters.page,
        limit: filters.limit,
      });

      setTargets(data?.targets || []);
      setTargetPagination(
        data?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setTargetsLoading(false);
    }
  }, [filters]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const data = await reminderService.getReminders({
        search: filters.search,
        month: filters.month,
        year: filters.year,
        page: 1,
        limit: 8,
      });

      setReminders(data?.reminders || []);
      setHistoryPagination(
        data?.pagination || {
          total: 0,
          page: 1,
          limit: 8,
          totalPages: 1,
        }
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setHistoryLoading(false);
    }
  }, [filters.search, filters.month, filters.year]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchTargets(), fetchHistory()]);
  }, [fetchStats, fetchTargets, fetchHistory]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const statCards = useMemo(
    () => [
      {
        title: "Relances totales",
        value: stats.total,
        icon: BellRing,
        tone: "navy",
        description: `Période ${periodLabel}`,
      },
      {
        title: "Envoyées",
        value: stats.sent,
        icon: CheckCircle2,
        tone: "green",
        description: "Emails confirmés",
      },
      {
        title: "Échouées",
        value: stats.failed,
        icon: XCircle,
        tone: "danger",
        description: "Emails non envoyés",
      },
      {
        title: "Ignorées",
        value: stats.skipped,
        icon: Clock3,
        tone: "warning",
        description: "Anti-doublon activé",
      },
    ],
    [stats, periodLabel]
  );

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleSendOne = async (target) => {
    const id = target?.id || target?._id;

    if (!id) return;

    try {
      setActionLoading(`one-${id}`);

      const result = await reminderService.sendOne({
        contributionId: id,
        type: target.status === "late" ? "late" : "pending",
        force: false,
      });

      if (result?.status === "sent") {
        toast.success("Relance envoyée avec succès.");
      } else if (result?.status === "skipped") {
        toast.warning("Relance ignorée : une relance récente existe déjà.");
      } else {
        toast.error(result?.errorMessage || "Relance non envoyée.");
      }

      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const handleSendBulk = async (status) => {
    const label = status === "late" ? "en retard" : "en attente";

    if (!window.confirm(`Envoyer une relance à toutes les cotisations ${label} ?`)) {
      return;
    }

    try {
      setActionLoading(`bulk-${status}`);

      const result = await reminderService.sendBulk({
        status,
        type: status,
        month: filters.month,
        year: filters.year,
        force: false,
      });

      toast.success(
        `Relances traitées : ${result?.sent || 0} envoyée(s), ${result?.skipped || 0} ignorée(s), ${result?.failed || 0} échouée(s).`
      );

      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const goToTargetPage = (page) => {
    if (page < 1 || page > targetPagination.totalPages) return;
    handleChangeFilter("page", page);
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

            <h1>Notifications et relances</h1>

            <p>
              Relancez les membres qui n’ont pas encore payé, suivez
              l’historique des emails envoyés et évitez les doublons grâce à la
              traçabilité automatique.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <CalendarDays size={15} />
                Période : {periodLabel}
              </HeroMetaItem>

              <HeroMetaItem>
                <Mail size={15} />
                Relance email
              </HeroMetaItem>

              <HeroMetaItem>
                <BellRing size={15} />
                Anti-doublon 12h
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <PrimaryButton type="button" onClick={() => handleSendBulk("pending")}>
              {actionLoading === "bulk-pending" ? <Spinner /> : <Send size={17} />}
              Relancer en attente
            </PrimaryButton>

            <DangerButton type="button" onClick={() => handleSendBulk("late")}>
              {actionLoading === "bulk-late" ? <Spinner /> : <AlertTriangle size={17} />}
              Relancer retards
            </DangerButton>

            <GhostButton type="button" onClick={refreshAll}>
              <RefreshCcw size={17} />
              Actualiser
            </GhostButton>
          </HeroAction>
        </HeroContent>

        <StatsGrid>
          {statCards.map((card, index) => {
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
                  <strong>{statsLoading ? "..." : card.value}</strong>
                  <small>{card.description}</small>
                </StatBody>
              </StatCard>
            );
          })}
        </StatsGrid>
      </Hero>

      <ContentGrid>
        <FiltersCard>
          <SectionHeader>
            <div>
              <SectionKicker>
                <Filter size={15} />
                Filtres
              </SectionKicker>
              <h2>Cotisations à relancer</h2>
            </div>
          </SectionHeader>

          <FilterGrid>
            <InputGroup>
              <label>Recherche</label>
              <InputIconBox>
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Nom, téléphone, email..."
                  value={filters.search}
                  onChange={(event) =>
                    handleChangeFilter("search", event.target.value)
                  }
                />
              </InputIconBox>
            </InputGroup>

            <InputGroup>
              <label>Statut</label>
              <select
                value={filters.status}
                onChange={(event) =>
                  handleChangeFilter("status", event.target.value)
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </InputGroup>

            <InputGroup>
              <label>Mois</label>
              <select
                value={filters.month}
                onChange={(event) =>
                  handleChangeFilter("month", Number(event.target.value))
                }
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </InputGroup>

            <InputGroup>
              <label>Année</label>
              <input
                type="number"
                value={filters.year}
                onChange={(event) =>
                  handleChangeFilter("year", Number(event.target.value))
                }
              />
            </InputGroup>
          </FilterGrid>
        </FiltersCard>

        <SplitGrid>
          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <Users size={15} />
                  Relances à faire
                </SectionKicker>
                <h2>
                  {targetPagination.total} cotisation
                  {targetPagination.total > 1 ? "s" : ""} concernée
                  {targetPagination.total > 1 ? "s" : ""}
                </h2>
              </div>
            </PanelHeader>

            <TableScroll>
              <ReminderTable>
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Période</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Historique</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {targetsLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`target-loading-${index}`}>
                        <td colSpan="6">
                          <SkeletonLine />
                        </td>
                      </tr>
                    ))
                  ) : targets.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <EmptyBox>Aucune cotisation à relancer.</EmptyBox>
                      </td>
                    </tr>
                  ) : (
                    targets.map((target) => {
                      const id = target.id || target._id;

                      return (
                        <tr key={id}>
                          <td>
                            <MemberIdentity>
                              <Avatar>{getInitials(target.member?.fullName)}</Avatar>
                              <div>
                                <strong>{target.member?.fullName || "Membre"}</strong>
                                <span>
                                  {target.member?.email ||
                                    target.member?.telephone ||
                                    "Contact absent"}
                                </span>
                              </div>
                            </MemberIdentity>
                          </td>

                          <td>{target.periodLabel}</td>

                          <td>{formatCurrency(target.amountExpected)}</td>

                          <td>
                            <ContributionBadge $status={target.status}>
                              {getStatusLabel(target.status)}
                            </ContributionBadge>
                          </td>

                          <td>
                            <HistoryText>
                              {target.reminderMeta?.reminderCount || 0} relance(s)
                              <span>
                                Dernière :{" "}
                                {formatDate(target.reminderMeta?.lastReminderAt)}
                              </span>
                            </HistoryText>
                          </td>

                          <td>
                            <PrimaryMiniButton
                              type="button"
                              disabled={actionLoading === `one-${id}`}
                              onClick={() => handleSendOne(target)}
                            >
                              {actionLoading === `one-${id}` ? (
                                <Spinner />
                              ) : (
                                <Send size={15} />
                              )}
                              Relancer
                            </PrimaryMiniButton>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </ReminderTable>
            </TableScroll>

            <PaginationBar>
              <span>
                Page {targetPagination.page} sur {targetPagination.totalPages}
              </span>

              <PaginationActions>
                <SmallButton
                  type="button"
                  disabled={targetPagination.page <= 1}
                  onClick={() => goToTargetPage(targetPagination.page - 1)}
                >
                  <ChevronLeft size={16} />
                  Précédent
                </SmallButton>

                <SmallButton
                  type="button"
                  disabled={targetPagination.page >= targetPagination.totalPages}
                  onClick={() => goToTargetPage(targetPagination.page + 1)}
                >
                  Suivant
                  <ChevronRight size={16} />
                </SmallButton>
              </PaginationActions>
            </PaginationBar>
          </PanelCard>

          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <Mail size={15} />
                  Historique récent
                </SectionKicker>
                <h2>
                  {historyPagination.total} relance
                  {historyPagination.total > 1 ? "s" : ""} enregistrée
                  {historyPagination.total > 1 ? "s" : ""}
                </h2>
              </div>
            </PanelHeader>

            <HistoryList>
              {historyLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonLine key={`history-loading-${index}`} />
                ))
              ) : reminders.length === 0 ? (
                <EmptyBox>Aucune relance enregistrée pour cette période.</EmptyBox>
              ) : (
                reminders.map((reminder) => (
                  <HistoryItem key={reminder.id || reminder._id}>
                    <HistoryIcon $status={reminder.status}>
                      {reminder.status === "sent" ? (
                        <CheckCircle2 size={18} />
                      ) : reminder.status === "failed" ? (
                        <XCircle size={18} />
                      ) : (
                        <Clock3 size={18} />
                      )}
                    </HistoryIcon>

                    <div>
                      <strong>{reminder.member?.fullName || "Membre"}</strong>
                      <span>{reminder.subject || "Relance"}</span>
                      <small>{formatDate(reminder.sentAt || reminder.createdAt)}</small>

                      {reminder.errorMessage && (
                        <ErrorText>{reminder.errorMessage}</ErrorText>
                      )}
                    </div>

                    <StatusBadge $status={reminder.status}>
                      {getStatusLabel(reminder.status)}
                    </StatusBadge>
                  </HistoryItem>
                ))
              )}
            </HistoryList>
          </PanelCard>
        </SplitGrid>
      </ContentGrid>
    </PageShell>
  );
}

const shimmer = keyframes`
  0% { background-position: -500px 0; }
  100% { background-position: 500px 0; }
`;

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

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
  gap: 1rem;

  @media (max-width: 1150px) {
    grid-template-columns: 1fr;
  }
`;

const FiltersCard = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
`;

const PanelCard = styled.section`
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  margin-bottom: 1rem;

  h2 {
    margin: 0.25rem 0 0;
    color: ${colors.navy};
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    font-family: Georgia, "Times New Roman", serif;
  }
`;

const PanelHeader = styled(SectionHeader)``;

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

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1.6fr) repeat(3, minmax(150px, 1fr));
  gap: 0.85rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  label {
    font-size: 0.82rem;
    font-weight: 900;
    color: ${colors.navy};
  }

  input,
  select {
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
`;

const InputIconBox = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.muted};
  }

  input {
    padding-left: 2.45rem;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const ReminderTable = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 0.85rem;
    color: ${colors.navy};
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: rgba(14, 45, 79, 0.035);
    border-bottom: 1px solid ${colors.border};
  }

  td {
    padding: 0.85rem;
    border-bottom: 1px solid rgba(14, 45, 79, 0.08);
    vertical-align: middle;
    font-size: 0.9rem;
  }

  tbody tr:hover {
    background: rgba(214, 168, 65, 0.07);
  }
`;

const MemberIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  strong {
    display: block;
    color: ${colors.navy};
  }

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.8rem;
    margin-top: 0.12rem;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: 0 14px 0 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, ${colors.navy}, ${colors.greenDark});
  color: ${colors.goldSoft};
  font-weight: 950;
`;

const ContributionBadge = styled.span`
  display: inline-flex;
  border-radius: 999px;
  padding: 0.38rem 0.6rem;
  font-weight: 900;
  font-size: 0.78rem;
  color: ${({ $status }) =>
    $status === "late" ? colors.danger : colors.warning};
  background: ${({ $status }) =>
    $status === "late" ? colors.dangerSoft : colors.warningSoft};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  border-radius: 999px;
  padding: 0.35rem 0.55rem;
  font-weight: 900;
  font-size: 0.75rem;
  color: ${({ $status }) => {
    if ($status === "sent") return colors.success;
    if ($status === "failed") return colors.danger;
    return colors.warning;
  }};
  background: ${({ $status }) => {
    if ($status === "sent") return colors.successSoft;
    if ($status === "failed") return colors.dangerSoft;
    return colors.warningSoft;
  }};
`;

const HistoryText = styled.div`
  display: grid;
  gap: 0.15rem;
  color: ${colors.navy};
  font-weight: 800;

  span {
    color: ${colors.muted};
    font-size: 0.78rem;
    font-weight: 600;
  }
`;

const HistoryList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const HistoryItem = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem;
  border-radius: 0 16px 0 16px;
  background: rgba(14, 45, 79, 0.025);
  border: 1px solid ${colors.border};

  strong,
  span,
  small {
    display: block;
  }

  strong {
    color: ${colors.navy};
  }

  span {
    color: ${colors.text};
    font-size: 0.86rem;
    margin-top: 0.12rem;
  }

  small {
    color: ${colors.muted};
    margin-top: 0.2rem;
  }

  @media (max-width: 520px) {
    grid-template-columns: auto minmax(0, 1fr);

    > span {
      grid-column: 1 / -1;
      width: fit-content;
    }
  }
`;

const HistoryIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 0 12px 0 12px;
  display: grid;
  place-items: center;
  color: ${({ $status }) => {
    if ($status === "sent") return colors.success;
    if ($status === "failed") return colors.danger;
    return colors.warning;
  }};
  background: ${colors.white};
  border: 1px solid ${colors.border};
`;

const ErrorText = styled.em`
  display: block;
  color: ${colors.danger};
  font-style: normal;
  font-size: 0.78rem;
  margin-top: 0.2rem;
`;

const PaginationBar = styled.div`
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;

  span {
    color: ${colors.muted};
    font-weight: 800;
    font-size: 0.88rem;
  }

  @media (max-width: 620px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PaginationActions = styled.div`
  display: flex;
  gap: 0.55rem;

  @media (max-width: 620px) {
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
`;

const DangerButton = styled.button`
  border: none;
  min-height: 42px;
  border-radius: 0 14px 0 14px;
  padding: 0.78rem 1rem;
  background: linear-gradient(135deg, ${colors.danger}, #d92d20);
  color: ${colors.white};
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  cursor: pointer;
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

const SmallButton = styled.button`
  border: 1px solid ${colors.border};
  min-height: 38px;
  border-radius: 0 12px 0 12px;
  padding: 0.65rem 0.85rem;
  background: ${colors.white};
  color: ${colors.navy};
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const PrimaryMiniButton = styled.button`
  border: 0;
  min-height: 34px;
  padding: 0.48rem 0.7rem;
  border-radius: 0 10px 0 10px;
  background: linear-gradient(135deg, ${colors.green}, #16a34a);
  color: ${colors.white};
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const SkeletonLine = styled.div`
  height: 42px;
  border-radius: 0 12px 0 12px;
  background: linear-gradient(
    90deg,
    rgba(14, 45, 79, 0.06) 25%,
    rgba(14, 45, 79, 0.12) 37%,
    rgba(14, 45, 79, 0.06) 63%
  );
  background-size: 900px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;

const EmptyBox = styled.div`
  padding: 1rem;
  border-radius: 0 16px 0 16px;
  background: ${colors.goldSoft};
  color: ${colors.warning};
  font-weight: 800;
  line-height: 1.55;
  text-align: center;
`;

const Spinner = styled.span`
  width: 17px;
  height: 17px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 0.75s linear infinite;
`;