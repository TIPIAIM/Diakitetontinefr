// src/pages/admin/audits/AuditsPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import auditService from "../../../services/auditService";

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

const defaultFilters = {
  search: "",
  module: "",
  status: "",
  severity: "",
  method: "",
  actorEmail: "",
  dateFrom: "",
  dateTo: "",
  page: 1,
  limit: 10,
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const formatDateTime = (date) => {
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

const getSeverityLabel = (severity) => {
  switch (severity) {
    case "critical":
      return "Critique";
    case "warning":
      return "Attention";
    case "info":
      return "Info";
    default:
      return severity || "—";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "success":
      return "Succès";
    case "failed":
      return "Échec";
    default:
      return status || "—";
  }
};

export default function AuditsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [modules, setModules] = useState([]);

  const [audits, setAudits] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    critical: 0,
    warning: 0,
    info: 0,
    modules: [],
    latest: [],
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const [selectedAudit, setSelectedAudit] = useState(null);

  const fetchModules = useCallback(async () => {
    try {
      const data = await auditService.getModules();
      setModules(data || []);
    } catch (_error) {
      setModules([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const data = await auditService.getStats({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      setStats({
        total: data?.total || 0,
        success: data?.success || 0,
        failed: data?.failed || 0,
        critical: data?.critical || 0,
        warning: data?.warning || 0,
        info: data?.info || 0,
        modules: data?.modules || [],
        latest: data?.latest || [],
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);

      const data = await auditService.getAudits(filters);

      setAudits(data?.audits || []);
      setPagination(
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
      setLoading(false);
    }
  }, [filters]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchModules(), fetchStats(), fetchAudits()]);
  }, [fetchModules, fetchStats, fetchAudits]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const statCards = useMemo(
    () => [
      {
        title: "Actions totales",
        value: stats.total,
        icon: Activity,
        tone: "navy",
        description: "Actions enregistrées",
      },
      {
        title: "Succès",
        value: stats.success,
        icon: CheckCircle2,
        tone: "green",
        description: "Actions réussies",
      },
      {
        title: "Échecs",
        value: stats.failed,
        icon: XCircle,
        tone: "danger",
        description: "Actions échouées",
      },
      {
        title: "Critiques",
        value: stats.critical,
        icon: ShieldAlert,
        tone: "warning",
        description: "Actions sensibles",
      },
    ],
    [stats]
  );

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    handleChangeFilter("page", page);
  };

  const handleCleanup = async () => {
    if (
      !window.confirm(
        "Voulez-vous supprimer les anciens journaux de plus de 180 jours ?"
      )
    ) {
      return;
    }

    try {
      setCleanupLoading(true);

      const result = await auditService.cleanupOldAudits({
        olderThanDays: 180,
      });

      toast.success(`${result?.deletedCount || 0} ancien(s) journal(aux) supprimé(s).`);

      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCleanupLoading(false);
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
              Audit & traçabilité
            </HeroBadge>

            <h1>Journal d’activité admin</h1>

            <p>
              Suivez toutes les actions sensibles réalisées dans la plateforme :
              paiements, relances, exports, paramètres, cycles et modifications
              de données.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <Activity size={15} />
                {stats.total || 0} action(s)
              </HeroMetaItem>

              <HeroMetaItem>
                <ShieldAlert size={15} />
                {stats.critical || 0} critique(s)
              </HeroMetaItem>

              <HeroMetaItem>
                <XCircle size={15} />
                {stats.failed || 0} échec(s)
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <GhostButton type="button" onClick={refreshAll}>
              <RefreshCcw size={17} />
              Actualiser
            </GhostButton>

            <DangerButton
              type="button"
              onClick={handleCleanup}
              disabled={cleanupLoading}
            >
              {cleanupLoading ? <Spinner /> : <Trash2 size={17} />}
              Nettoyer anciens logs
            </DangerButton>
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
              <h2>Recherche dans le journal</h2>
            </div>
          </SectionHeader>

          <FilterGrid>
            <InputGroup>
              <label>Recherche</label>
              <InputIconBox>
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Action, route, email, module..."
                  value={filters.search}
                  onChange={(event) =>
                    handleChangeFilter("search", event.target.value)
                  }
                />
              </InputIconBox>
            </InputGroup>

            <InputGroup>
              <label>Module</label>
              <select
                value={filters.module}
                onChange={(event) =>
                  handleChangeFilter("module", event.target.value)
                }
              >
                <option value="">Tous les modules</option>
                {modules.map((moduleName) => (
                  <option key={moduleName} value={moduleName}>
                    {moduleName}
                  </option>
                ))}
              </select>
            </InputGroup>

            <InputGroup>
              <label>Statut</label>
              <select
                value={filters.status}
                onChange={(event) =>
                  handleChangeFilter("status", event.target.value)
                }
              >
                <option value="">Tous</option>
                <option value="success">Succès</option>
                <option value="failed">Échec</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Sensibilité</label>
              <select
                value={filters.severity}
                onChange={(event) =>
                  handleChangeFilter("severity", event.target.value)
                }
              >
                <option value="">Toutes</option>
                <option value="info">Info</option>
                <option value="warning">Attention</option>
                <option value="critical">Critique</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Méthode</label>
              <select
                value={filters.method}
                onChange={(event) =>
                  handleChangeFilter("method", event.target.value)
                }
              >
                <option value="">Toutes</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Date début</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) =>
                  handleChangeFilter("dateFrom", event.target.value)
                }
              />
            </InputGroup>

            <InputGroup>
              <label>Date fin</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(event) =>
                  handleChangeFilter("dateTo", event.target.value)
                }
              />
            </InputGroup>
          </FilterGrid>
        </FiltersCard>

        <TableCard>
          <TableHeader>
            <div>
              <SectionKicker>
                <Activity size={15} />
                Registre d’audit
              </SectionKicker>

              <h2>
                {pagination.total} action
                {pagination.total > 1 ? "s" : ""} trouvée
                {pagination.total > 1 ? "s" : ""}
              </h2>
            </div>
          </TableHeader>

          <TableScroll>
            <AuditTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Route</th>
                  <th>Statut</th>
                  <th>Sensibilité</th>
                  <th>Acteur</th>
                  <th>Détail</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`loading-${index}`}>
                      <td colSpan="8">
                        <SkeletonLine />
                      </td>
                    </tr>
                  ))
                ) : audits.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <EmptyBox>Aucune activité trouvée.</EmptyBox>
                    </td>
                  </tr>
                ) : (
                  audits.map((audit) => (
                    <tr key={audit.id}>
                      <td>{formatDateTime(audit.createdAt)}</td>

                      <td>
                        <ModuleBadge>{audit.module}</ModuleBadge>
                      </td>

                      <td>
                        <ActionText>
                          <strong>{audit.action}</strong>
                          <span>{audit.method}</span>
                        </ActionText>
                      </td>

                      <td>
                        <RouteText>{audit.route}</RouteText>
                      </td>

                      <td>
                        <StatusBadge $status={audit.status}>
                          {getStatusLabel(audit.status)}
                        </StatusBadge>
                      </td>

                      <td>
                        <SeverityBadge $severity={audit.severity}>
                          {getSeverityLabel(audit.severity)}
                        </SeverityBadge>
                      </td>

                      <td>
                        <ActorText>
                          <strong>{audit.actorName || "Admin"}</strong>
                          <span>{audit.actorEmail || "—"}</span>
                        </ActorText>
                      </td>

                      <td>
                        <MiniButton
                          type="button"
                          onClick={() => setSelectedAudit(audit)}
                        >
                          <Eye size={15} />
                          Voir
                        </MiniButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </AuditTable>
          </TableScroll>

          <PaginationBar>
            <span>
              Page {pagination.page} sur {pagination.totalPages}
            </span>

            <PaginationActions>
              <SmallButton
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
                Précédent
              </SmallButton>

              <SmallButton
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Suivant
                <ChevronRight size={16} />
              </SmallButton>
            </PaginationActions>
          </PaginationBar>
        </TableCard>
      </ContentGrid>

      <AnimatePresence>
        {selectedAudit && (
          <ModalLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalBackdrop onClick={() => setSelectedAudit(null)} />

            <ModalCard
              as={motion.div}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22 }}
            >
              <ModalHeader>
                <div>
                  <SectionKicker>
                    <Activity size={15} />
                    Détail audit
                  </SectionKicker>
                  <h2>{selectedAudit.action}</h2>
                  <p>{selectedAudit.description}</p>
                </div>

                <CloseButton type="button" onClick={() => setSelectedAudit(null)}>
                  <X size={19} />
                </CloseButton>
              </ModalHeader>

              <DetailGrid>
                <DetailItem>
                  <span>Date</span>
                  <strong>{formatDateTime(selectedAudit.createdAt)}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Module</span>
                  <strong>{selectedAudit.module}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Méthode</span>
                  <strong>{selectedAudit.method}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Statut HTTP</span>
                  <strong>{selectedAudit.statusCode}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Route</span>
                  <strong>{selectedAudit.route}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Resource ID</span>
                  <strong>{selectedAudit.resourceId || "—"}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Acteur</span>
                  <strong>
                    {selectedAudit.actorName} — {selectedAudit.actorEmail || "—"}
                  </strong>
                </DetailItem>

                <DetailItem>
                  <span>Adresse IP</span>
                  <strong>{selectedAudit.ipAddress || "—"}</strong>
                </DetailItem>
              </DetailGrid>

              <MetadataBox>
                <span>Métadonnées</span>
                <pre>{JSON.stringify(selectedAudit.metadata || {}, null, 2)}</pre>
              </MetadataBox>
            </ModalCard>
          </ModalLayer>
        )}
      </AnimatePresence>
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
  color: ${colors.white};
  background: ${({ $tone }) => {
    if ($tone === "green") return "linear-gradient(135deg, #0F6B4F, #16A34A)";
    if ($tone === "warning") return "linear-gradient(135deg, #B54708, #F79009)";
    if ($tone === "danger") return "linear-gradient(135deg, #B42318, #D92D20)";
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
  }

  strong {
    display: block;
    color: ${colors.white};
    font-size: clamp(1.15rem, 2vw, 1.6rem);
    margin: 0.22rem 0;
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

const FiltersCard = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
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

const SectionKicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${colors.gold};
  font-weight: 900;
  font-size: 0.78rem;
  text-transform: uppercase;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) repeat(6, minmax(120px, 1fr));
  gap: 0.85rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
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

const TableCard = styled.section`
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: clamp(1rem, 2vw, 1.25rem);
  border-bottom: 1px solid ${colors.border};
  background: linear-gradient(135deg, rgba(14, 45, 79, 0.04), rgba(15, 107, 79, 0.05));

  h2 {
    margin: 0.25rem 0 0;
    color: ${colors.navy};
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    font-family: Georgia, "Times New Roman", serif;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const AuditTable = styled.table`
  width: 100%;
  min-width: 1120px;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 0.9rem 1rem;
    color: ${colors.navy};
    font-size: 0.76rem;
    text-transform: uppercase;
    background: rgba(14, 45, 79, 0.035);
    border-bottom: 1px solid ${colors.border};
  }

  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba(14, 45, 79, 0.08);
    vertical-align: middle;
    font-size: 0.9rem;
  }

  tbody tr:hover {
    background: rgba(214, 168, 65, 0.07);
  }
`;

const ModuleBadge = styled.span`
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: ${colors.goldSoft};
  color: ${colors.navy};
  font-weight: 900;
  font-size: 0.78rem;
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.78rem;
  color: ${({ $status }) =>
    $status === "success" ? colors.success : colors.danger};
  background: ${({ $status }) =>
    $status === "success" ? colors.successSoft : colors.dangerSoft};
`;

const SeverityBadge = styled.span`
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.78rem;
  color: ${({ $severity }) => {
    if ($severity === "critical") return colors.danger;
    if ($severity === "warning") return colors.warning;
    return colors.success;
  }};
  background: ${({ $severity }) => {
    if ($severity === "critical") return colors.dangerSoft;
    if ($severity === "warning") return colors.warningSoft;
    return colors.successSoft;
  }};
`;

const ActionText = styled.div`
  strong {
    display: block;
    color: ${colors.navy};
  }

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.78rem;
    margin-top: 0.1rem;
  }
`;

const RouteText = styled.code`
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${colors.green};
  background: rgba(15, 107, 79, 0.08);
  padding: 0.3rem 0.45rem;
  border-radius: 8px;
`;

const ActorText = styled.div`
  strong {
    display: block;
    color: ${colors.navy};
  }

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.78rem;
  }
`;

const MiniButton = styled.button`
  border: none;
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
`;

const PaginationBar = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  border-top: 1px solid ${colors.border};

  span {
    color: ${colors.muted};
    font-weight: 800;
  }

  @media (max-width: 620px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PaginationActions = styled.div`
  display: flex;
  gap: 0.55rem;
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
  gap: 0.4rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
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
  gap: 0.48rem;
  cursor: pointer;
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
  text-align: center;
`;

const ModalLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const ModalBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(7, 17, 29, 0.62);
  backdrop-filter: blur(8px);
`;

const ModalCard = styled.div`
  position: relative;
  z-index: 1;
  width: min(860px, 100%);
  max-height: min(90vh, 860px);
  overflow-y: auto;
  border-radius: 0 28px 0 28px;
  background: ${colors.white};
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.28);
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(14, 45, 79, 0.97), rgba(11, 61, 46, 0.95));
  color: ${colors.white};
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0.35rem 0;
    font-family: Georgia, "Times New Roman", serif;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.55;
  }
`;

const CloseButton = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.1);
  color: currentColor;
  border-radius: 0 12px 0 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: 0 0 auto;
`;

const DetailGrid = styled.div`
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  padding: 0.8rem;
  border: 1px solid ${colors.border};
  border-radius: 0 14px 0 14px;
  background: rgba(14, 45, 79, 0.025);

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  strong {
    color: ${colors.navy};
    word-break: break-word;
  }
`;

const MetadataBox = styled.div`
  padding: 0 1.25rem 1.25rem;

  span {
    display: block;
    color: ${colors.navy};
    font-weight: 900;
    margin-bottom: 0.5rem;
  }

  pre {
    max-height: 320px;
    overflow: auto;
    margin: 0;
    padding: 1rem;
    border-radius: 0 14px 0 14px;
    background: #101828;
    color: #e7f0ff;
    font-size: 0.82rem;
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