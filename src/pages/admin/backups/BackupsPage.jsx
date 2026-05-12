// src/pages/admin/backups/BackupsPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArchiveRestore,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DatabaseBackup,
  Download,
  FileJson,
  History,
  RefreshCcw,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import backupService from "../../../services/backupService";

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

const RESTORE_CONFIRMATION_TEXT = "RESTORE_TONTINE_DATA";

const defaultHistoryFilters = {
  action: "",
  status: "",
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

const formatBytes = (bytes = 0) => {
  const value = Number(bytes || 0);

  if (value < 1024) return `${value} o`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;

  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
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

const getActionLabel = (action) => {
  switch (action) {
    case "snapshot":
      return "Snapshot";
    case "export":
      return "Export";
    case "restore":
      return "Restauration";
    default:
      return action || "—";
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

export default function BackupsPage() {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [historyFilters, setHistoryFilters] = useState(defaultHistoryFilters);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const [includeAudits, setIncludeAudits] = useState(false);
  const [restoreAudits, setRestoreAudits] = useState(false);

  const [backupFile, setBackupFile] = useState(null);
  const [backupPreview, setBackupPreview] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [restoreNotes, setRestoreNotes] = useState("");

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);

      const data = await backupService.getSnapshot();

      setSnapshot(data || null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const data = await backupService.getHistory(historyFilters);

      setHistory(data?.backups || []);
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
      setHistoryLoading(false);
    }
  }, [historyFilters]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSnapshot(), fetchHistory()]);
  }, [fetchSnapshot, fetchHistory]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const statCards = useMemo(
    () => [
      {
        title: "Membres",
        value: snapshot?.database?.members || 0,
        icon: DatabaseBackup,
        tone: "navy",
        description: "Membres sauvegardables",
      },
      {
        title: "Cycles",
        value: snapshot?.database?.cycles || 0,
        icon: FileJson,
        tone: "green",
        description: "Cycles enregistrés",
      },
      {
        title: "Cotisations",
        value: snapshot?.database?.contributions || 0,
        icon: CheckCircle2,
        tone: "gold",
        description: "Paiements et statuts",
      },
      {
        title: "Journaux",
        value: snapshot?.database?.audits || 0,
        icon: History,
        tone: "warning",
        description: "Audits disponibles",
      },
    ],
    [snapshot]
  );

  const handleExport = async () => {
    try {
      setExporting(true);

      await backupService.exportBackup({
        includeAudits,
      });

      toast.success("Sauvegarde exportée avec succès.");

      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    setBackupFile(null);
    setBackupPreview(null);

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed?.data) {
        toast.error("Le fichier sélectionné n'est pas une sauvegarde valide.");
        return;
      }

      setBackupFile(file);
      setBackupPreview(parsed);

      toast.success("Fichier de sauvegarde chargé.");
    } catch (_error) {
      toast.error("Impossible de lire ce fichier JSON.");
    }
  };

  const handleRestore = async () => {
    if (!backupPreview) {
      toast.error("Veuillez sélectionner un fichier de sauvegarde.");
      return;
    }

    if (confirmation !== RESTORE_CONFIRMATION_TEXT) {
      toast.error(`Tape exactement : ${RESTORE_CONFIRMATION_TEXT}`);
      return;
    }

    if (
      !window.confirm(
        "Attention : cette restauration remplacera les données métier actuelles. Continuer ?"
      )
    ) {
      return;
    }

    try {
      setRestoring(true);

      const result = await backupService.restoreBackup({
        backup: backupPreview,
        confirmation,
        restoreAudits,
        notes: restoreNotes,
      });

      toast.success("Restauration effectuée avec succès.");

      setBackupFile(null);
      setBackupPreview(null);
      setConfirmation("");
      setRestoreNotes("");

      await refreshAll();

      console.log("Résultat restauration :", result);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRestoring(false);
    }
  };

  const handleHistoryFilter = (key, value) => {
    setHistoryFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;

    handleHistoryFilter("page", page);
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
              Sauvegarde & sécurité
            </HeroBadge>

            <h1>Sauvegarde et export complet</h1>

            <p>
              Exportez toutes les données métier de la tontine en JSON,
              conservez un historique des sauvegardes et restaurez les données
              uniquement avec une confirmation administrative stricte.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <DatabaseBackup size={15} />
                Snapshot global
              </HeroMetaItem>

              <HeroMetaItem>
                <Download size={15} />
                Export JSON
              </HeroMetaItem>

              <HeroMetaItem>
                <ArchiveRestore size={15} />
                Restauration contrôlée
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <GhostButton type="button" onClick={refreshAll}>
              {loading ? <Spinner /> : <RefreshCcw size={17} />}
              Actualiser
            </GhostButton>

            <PrimaryButton type="button" onClick={handleExport} disabled={exporting}>
              {exporting ? <Spinner /> : <Download size={17} />}
              Exporter JSON
            </PrimaryButton>
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
                  <strong>{loading ? "..." : card.value}</strong>
                  <small>{card.description}</small>
                </StatBody>
              </StatCard>
            );
          })}
        </StatsGrid>
      </Hero>

      <ContentGrid>
        <SplitGrid>
          <PanelCard>
            <PanelHeader>
              <SectionKicker>
                <Download size={15} />
                Export complet
              </SectionKicker>
              <h2>Télécharger une sauvegarde JSON</h2>
            </PanelHeader>

            <InfoBox>
              <CheckCircle2 size={20} />
              <div>
                <strong>Export sécurisé</strong>
                <span>
                  Le fichier contient les membres, cycles, cotisations,
                  bénéficiaires, relances et paramètres. Les comptes admin ne
                  sont pas exportés.
                </span>
              </div>
            </InfoBox>

            <ToggleLine>
              <div>
                <strong>Inclure les journaux d’audit</strong>
                <span>
                  Active cette option uniquement si tu veux sauvegarder aussi le
                  journal d’activité.
                </span>
              </div>

              <SwitchButton
                type="button"
                $active={includeAudits}
                onClick={() => setIncludeAudits((prev) => !prev)}
              >
                <span />
              </SwitchButton>
            </ToggleLine>

            <ActionRow>
              <PrimaryButton type="button" onClick={handleExport} disabled={exporting}>
                {exporting ? <Spinner /> : <Download size={17} />}
                Exporter la sauvegarde
              </PrimaryButton>
            </ActionRow>
          </PanelCard>

          <PanelCard>
            <PanelHeader>
              <SectionKicker>
                <UploadCloud size={15} />
                Restauration
              </SectionKicker>
              <h2>Restaurer une sauvegarde</h2>
            </PanelHeader>

            <WarningBox>
              <AlertTriangle size={20} />
              <div>
                <strong>Action sensible</strong>
                <span>
                  La restauration remplace les données métier actuelles. Elle ne
                  touche pas au compte administrateur connecté.
                </span>
              </div>
            </WarningBox>

            <FormGrid>
              <InputGroup $full>
                <label>Fichier JSON de sauvegarde</label>
                <input type="file" accept="application/json,.json" onChange={handleFileChange} />
              </InputGroup>

              {backupPreview && (
                <PreviewBox>
                  <strong>Fichier chargé : {backupFile?.name}</strong>
                  <span>
                    Généré le : {formatDateTime(backupPreview.generatedAt)}
                  </span>
                  <small>
                    Membres : {backupPreview.data?.members?.length || 0} ·
                    Cycles : {backupPreview.data?.cycles?.length || 0} ·
                    Cotisations :{" "}
                    {backupPreview.data?.contributions?.length || 0}
                  </small>
                </PreviewBox>
              )}

              <ToggleLine>
                <div>
                  <strong>Restaurer aussi les audits</strong>
                  <span>
                    Option recommandée seulement pour une restauration complète.
                  </span>
                </div>

                <SwitchButton
                  type="button"
                  $active={restoreAudits}
                  onClick={() => setRestoreAudits((prev) => !prev)}
                >
                  <span />
                </SwitchButton>
              </ToggleLine>

              <InputGroup $full>
                <label>Phrase de confirmation</label>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={RESTORE_CONFIRMATION_TEXT}
                />
              </InputGroup>

              <InputGroup $full>
                <label>Note de restauration</label>
                <textarea
                  rows="3"
                  value={restoreNotes}
                  onChange={(event) => setRestoreNotes(event.target.value)}
                  placeholder="Exemple : restauration après migration serveur..."
                />
              </InputGroup>
            </FormGrid>

            <ActionRow>
              <DangerButton type="button" onClick={handleRestore} disabled={restoring}>
                {restoring ? <Spinner /> : <ArchiveRestore size={17} />}
                Restaurer les données
              </DangerButton>
            </ActionRow>
          </PanelCard>
        </SplitGrid>

        <TableCard>
          <TableHeader>
            <div>
              <SectionKicker>
                <History size={15} />
                Historique
              </SectionKicker>
              <h2>
                {pagination.total} opération
                {pagination.total > 1 ? "s" : ""} de sauvegarde
              </h2>
            </div>

            <HistoryFilters>
              <select
                value={historyFilters.action}
                onChange={(event) =>
                  handleHistoryFilter("action", event.target.value)
                }
              >
                <option value="">Toutes les actions</option>
                <option value="snapshot">Snapshot</option>
                <option value="export">Export</option>
                <option value="restore">Restauration</option>
              </select>

              <select
                value={historyFilters.status}
                onChange={(event) =>
                  handleHistoryFilter("status", event.target.value)
                }
              >
                <option value="">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="failed">Échec</option>
              </select>
            </HistoryFilters>
          </TableHeader>

          <TableScroll>
            <BackupTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Statut</th>
                  <th>Fichier</th>
                  <th>Éléments</th>
                  <th>Taille</th>
                  <th>Admin</th>
                </tr>
              </thead>

              <tbody>
                {historyLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`loading-${index}`}>
                      <td colSpan="7">
                        <SkeletonLine />
                      </td>
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <EmptyBox>Aucune opération de sauvegarde trouvée.</EmptyBox>
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.createdAt)}</td>

                      <td>
                        <ActionBadge>{getActionLabel(item.action)}</ActionBadge>
                      </td>

                      <td>
                        <StatusBadge $status={item.status}>
                          {item.status === "success" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {getStatusLabel(item.status)}
                        </StatusBadge>
                      </td>

                      <td>
                        <FileName>{item.filename || "—"}</FileName>
                      </td>

                      <td>
                        <CountText>
                          M:{item.counts?.members || 0} · C:
                          {item.counts?.cycles || 0} · Cot:
                          {item.counts?.contributions || 0}
                        </CountText>
                      </td>

                      <td>{formatBytes(item.sizeBytes)}</td>

                      <td>
                        <AdminText>
                          <strong>{item.performedByEmail || "Admin"}</strong>
                          <span>{item.performedByRole || "—"}</span>
                        </AdminText>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </BackupTable>
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

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1050px) {
    grid-template-columns: 1fr;
  }
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
`;

const InfoBox = styled.div`
  display: flex;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 0 18px 0 18px;
  background: ${colors.successSoft};
  color: ${colors.success};
  margin-bottom: 1rem;

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 0.2rem;
    color: ${colors.text};
    line-height: 1.55;
  }
`;

const WarningBox = styled(InfoBox)`
  background: ${colors.warningSoft};
  color: ${colors.warning};
`;

const ToggleLine = styled.div`
  padding: 0.95rem;
  border-radius: 0 18px 0 18px;
  border: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;

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

const FormGrid = styled.div`
  display: grid;
  gap: 0.85rem;
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
  }

  textarea {
    resize: vertical;
  }
`;

const PreviewBox = styled.div`
  padding: 0.9rem;
  border-radius: 0 16px 0 16px;
  background: ${colors.goldSoft};
  color: ${colors.navy};
  display: grid;
  gap: 0.2rem;

  strong,
  span,
  small {
    display: block;
  }

  span,
  small {
    color: ${colors.muted};
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
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
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;

  h2 {
    margin: 0.25rem 0 0;
    color: ${colors.navy};
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    font-family: Georgia, "Times New Roman", serif;
  }
`;

const HistoryFilters = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;

  select {
    border: 1px solid ${colors.border};
    background: ${colors.white};
    color: ${colors.text};
    border-radius: 0 14px 0 14px;
    padding: 0.75rem 0.85rem;
    font-weight: 800;
    outline: none;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const BackupTable = styled.table`
  width: 100%;
  min-width: 980px;
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

const ActionBadge = styled.span`
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: ${colors.goldSoft};
  color: ${colors.navy};
  font-weight: 900;
  font-size: 0.78rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.78rem;
  color: ${({ $status }) =>
    $status === "success" ? colors.success : colors.danger};
  background: ${({ $status }) =>
    $status === "success" ? colors.successSoft : colors.dangerSoft};
`;

const FileName = styled.code`
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(14, 45, 79, 0.06);
  color: ${colors.navy};
  padding: 0.3rem 0.45rem;
  border-radius: 8px;
`;

const CountText = styled.span`
  color: ${colors.muted};
  font-weight: 800;
`;

const AdminText = styled.div`
  strong,
  span {
    display: block;
  }

  strong {
    color: ${colors.navy};
  }

  span {
    color: ${colors.muted};
    font-size: 0.78rem;
  }
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

const Spinner = styled.span`
  width: 17px;
  height: 17px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 0.75s linear infinite;
`;