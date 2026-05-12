// src/pages/admin/cycle/CyclesPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  History,
  Layers,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  Timer,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import CycleMembersManager from "./CycleMembersManager";
 import cycleService from "../../../services/cycleService";
//group
const colors = {
  navy: "#0E2D4F",
  navy2: "#123A63",
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

const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "active", label: "Actifs" },
  { value: "paused", label: "En pause" },
  { value: "completed", label: "Clôturés" },
];

const emptyForm = {
  name: "",
  startDate: new Date().toISOString().slice(0, 10),
  expectedEndDate: "",
  contributionAmount: "",
  frequency: "monthly",
  paymentStartDay: 5,
  paymentDeadlineDay: 15,
  notes: "",
};

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

const getStatusLabel = (status) => {
  switch (status) {
    case "active":
      return "Actif";
    case "paused":
      return "En pause";
    case "completed":
      return "Clôturé";
    default:
      return status || "—";
  }
};

const getFrequencyLabel = (frequency) => {
  switch (frequency) {
    case "monthly":
      return "Mensuelle";
    case "weekly":
      return "Hebdomadaire";
    default:
      return frequency || "—";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return <CheckCircle2 size={14} />;
    case "paused":
      return <PauseCircle size={14} />;
    case "completed":
      return <BadgeCheck size={14} />;
    default:
      return <Activity size={14} />;
  }
};

export default function CyclesPage() {
  const [cycles, setCycles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    completed: 0,
    activeCycle: null,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [selectedCycle, setSelectedCycle] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState("");
  const [membersManagerOpen, setMembersManagerOpen] = useState(false);
  const [selectedCycleForMembers, setSelectedCycleForMembers] = useState(null);
 
  const openMembersManager = (cycle) => {
    setSelectedCycleForMembers(cycle);
    setMembersManagerOpen(true);
  };

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const data = await cycleService.getStats();

      setStats({
        total: data?.total || 0,
        active: data?.active || 0,
        paused: data?.paused || 0,
        completed: data?.completed || 0,
        activeCycle: data?.activeCycle || null,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCycles = useCallback(async () => {
    try {
      setLoading(true);

      const data = await cycleService.getCycles(filters);

      setCycles(data?.cycles || []);
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
    await Promise.all([fetchStats(), fetchCycles()]);
  }, [fetchStats, fetchCycles]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const statCards = useMemo(
    () => [
      {
        title: "Total cycles",
        value: stats.total,
        icon: Layers,
        tone: "navy",
        description: "Tous les cycles créés",
      },
      {
        title: "Cycle actif",
        value: stats.active,
        icon: Activity,
        tone: "green",
        description: "Cycle actuellement ouvert",
      },
      {
        title: "En pause",
        value: stats.paused,
        icon: PauseCircle,
        tone: "warning",
        description: "Cycles temporairement suspendus",
      },
      {
        title: "Cycles clôturés",
        value: stats.completed,
        icon: BadgeCheck,
        tone: "gold",
        description: "Historique terminé",
      },
    ],
    [stats]
  );

  const openCreateModal = () => {
    setEditingCycle(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (cycle) => {
    setEditingCycle(cycle);

    setForm({
      name: cycle.name || "",
      startDate: cycle.startDate
        ? new Date(cycle.startDate).toISOString().slice(0, 10)
        : "",
      expectedEndDate: cycle.expectedEndDate
        ? new Date(cycle.expectedEndDate).toISOString().slice(0, 10)
        : "",
      contributionAmount: cycle.contributionAmount || "",
      frequency: cycle.frequency || "monthly",
      paymentStartDay: cycle.paymentStartDay || 5,
      paymentDeadlineDay: cycle.paymentDeadlineDay || 15,
      notes: cycle.notes || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingCycle(null);
    setForm(emptyForm);
  };

  const openDrawer = (cycle) => {
    setSelectedCycle(cycle);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedCycle(null);
    setDrawerOpen(false);
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Le nom du cycle est obligatoire.");
      return false;
    }

    if (!form.startDate) {
      toast.error("La date de début est obligatoire.");
      return false;
    }

    if (Number(form.contributionAmount) < 0) {
      toast.error("Le montant de cotisation ne peut pas être négatif.");
      return false;
    }

    if (Number(form.paymentStartDay) < 1 || Number(form.paymentStartDay) > 31) {
      toast.error("Le jour d’ouverture doit être entre 1 et 31.");
      return false;
    }

    if (
      Number(form.paymentDeadlineDay) < 1 ||
      Number(form.paymentDeadlineDay) > 31
    ) {
      toast.error("Le jour limite doit être entre 1 et 31.");
      return false;
    }

    if (Number(form.paymentDeadlineDay) < Number(form.paymentStartDay)) {
      toast.error(
        "Le jour limite doit être supérieur ou égal au jour d’ouverture."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        startDate: form.startDate,
        expectedEndDate: form.expectedEndDate || "",
        contributionAmount: Number(form.contributionAmount || 0),
        frequency: form.frequency,
        paymentStartDay: Number(form.paymentStartDay || 5),
        paymentDeadlineDay: Number(form.paymentDeadlineDay || 15),
        notes: form.notes.trim(),
      };

      if (editingCycle) {
        await cycleService.updateCycle(editingCycle.id || editingCycle._id, payload);
        toast.success("Cycle modifié avec succès.");
      } else {
        await cycleService.createCycle(payload);
        toast.success("Cycle créé avec succès.");
      }

      closeModal();
      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCycleAction = async (type, cycle) => {
    const cycleId = cycle?.id || cycle?._id;

    if (!cycleId) return;

    const confirmMessages = {
      pause: "Voulez-vous mettre ce cycle en pause ?",
      resume: "Voulez-vous reprendre ce cycle ?",
      close: "Voulez-vous clôturer ce cycle ?",
      restart:
        "Voulez-vous relancer un nouveau cycle avec les mêmes membres ?",
    };

    if (!window.confirm(confirmMessages[type])) return;

    try {
      setActionLoading(`${type}-${cycleId}`);

      if (type === "pause") {
        await cycleService.pauseCycle(cycleId);
        toast.success("Cycle mis en pause.");
      }

      if (type === "resume") {
        await cycleService.resumeCycle(cycleId);
        toast.success("Cycle repris.");
      }

      if (type === "close") {
        await cycleService.closeCycle(cycleId);
        toast.success("Cycle clôturé.");
      }

      if (type === "restart") {
        await cycleService.restartCycle(cycleId, {
          name: `Nouveau cycle après ${cycle.name}`,
          startDate: new Date().toISOString().slice(0, 10),
        });
        toast.success("Nouveau cycle lancé avec succès.");
      }

      closeDrawer();
      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;

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

            <h1>Gestion des cycles</h1>

            <p>
              Créez, suivez et clôturez les cycles de tontine. Chaque cycle
              regroupe les membres actifs, définit la période de paiement et
              prépare les prochaines étapes : cotisations, bénéficiaires et
              rapports.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <Timer size={15} />
                Paiements à partir du 5
              </HeroMetaItem>

              <HeroMetaItem>
                <Users size={15} />
                Membres actifs intégrés
              </HeroMetaItem>

              <HeroMetaItem>
                <History size={15} />
                Historique conservé
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <PrimaryButton type="button" onClick={openCreateModal}>
              <Plus size={18} />
              Créer un cycle
            </PrimaryButton>

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
                $tone={card.tone}
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

      <ActiveCycleCard
        as={motion.section}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.42, delay: 0.08 }}
      >
        <ActiveHeader>
          <div>
            <SectionKicker>
              <Activity size={15} />
              Cycle actuel
            </SectionKicker>

            <h2>
              {stats.activeCycle
                ? stats.activeCycle.name
                : "Aucun cycle actif pour le moment"}
            </h2>
          </div>

          {!stats.activeCycle && (
            <PrimaryButton type="button" onClick={openCreateModal}>
              <Plus size={17} />
              Lancer un cycle
            </PrimaryButton>
          )}
        </ActiveHeader>

        {stats.activeCycle ? (
          <ActiveGrid>
            <ActiveInfo>
              <span>Statut</span>
              <StatusBadge $status={stats.activeCycle.status}>
                {getStatusIcon(stats.activeCycle.status)}
                {getStatusLabel(stats.activeCycle.status)}
              </StatusBadge>
            </ActiveInfo>

            <ActiveInfo>
              <span>Membres</span>
              <strong>{stats.activeCycle.membersCount || 0}</strong>
            </ActiveInfo>

            <ActiveInfo>
              <span>Cotisation</span>
              <strong>{formatCurrency(stats.activeCycle.contributionAmount)}</strong>
            </ActiveInfo>

            <ActiveInfo>
              <span>Total attendu</span>
              <strong>{formatCurrency(stats.activeCycle.totalExpectedAmount)}</strong>
            </ActiveInfo>

            <ActiveInfo>
              <span>Début</span>
              <strong>{formatDate(stats.activeCycle.startDate)}</strong>
            </ActiveInfo>

            <ActiveInfo>
              <span>Fin prévue</span>
              <strong>{formatDate(stats.activeCycle.expectedEndDate)}</strong>
            </ActiveInfo>
          </ActiveGrid>
        ) : (
          <EmptyInline>
            <AlertTriangle size={22} />
            <span>
              Crée un cycle pour commencer à gérer les cotisations et les
              bénéficiaires.
            </span>
          </EmptyInline>
        )}
      </ActiveCycleCard>

      <ContentGrid>
        <FiltersCard
          as={motion.section}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SectionHeader>
            <div>
              <SectionKicker>
                <Filter size={15} />
                Filtres
              </SectionKicker>

              <h2>Recherche et contrôle</h2>
            </div>
          </SectionHeader>

          <FilterGrid>
            <InputGroup>
              <label>Recherche</label>
              <InputIconBox>
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Nom du cycle..."
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
              <label>Tri</label>
              <select
                value={filters.sortBy}
                onChange={(event) =>
                  handleChangeFilter("sortBy", event.target.value)
                }
              >
                <option value="createdAt">Date de création</option>
                <option value="name">Nom</option>
                <option value="startDate">Date de début</option>
                <option value="expectedEndDate">Date de fin prévue</option>
                <option value="contributionAmount">Cotisation</option>
                <option value="status">Statut</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>Ordre</label>
              <select
                value={filters.sortOrder}
                onChange={(event) =>
                  handleChangeFilter("sortOrder", event.target.value)
                }
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </InputGroup>
          </FilterGrid>
        </FiltersCard>

        <TableCard
          as={motion.section}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <TableHeader>
            <div>
              <SectionKicker>
                <Layers size={15} />
                Registre des cycles
              </SectionKicker>

              <h2>Liste des cycles</h2>

              <p>
                {pagination.total} cycle
                {pagination.total > 1 ? "s" : ""} trouvé
                {pagination.total > 1 ? "s" : ""}.
              </p>
            </div>

            <HeaderActions>
              <SmallButton
                type="button"
                onClick={() => {
                  setFilters({
                    search: "",
                    status: "",
                    page: 1,
                    limit: 10,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  });
                }}
              >
                Réinitialiser
              </SmallButton>

              <PrimaryButton type="button" onClick={openCreateModal}>
                <Plus size={17} />
                Nouveau
              </PrimaryButton>
            </HeaderActions>
          </TableHeader>

          <TableScroll>
            <CyclesTable>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Période</th>
                  <th>Membres</th>
                  <th>Cotisation</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan="6">
                        <SkeletonLine />
                      </td>
                    </tr>
                  ))
                ) : cycles.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <EmptyState>
                        <Layers size={42} />
                        <strong>Aucun cycle trouvé</strong>
                        <span>
                          Crée un premier cycle pour commencer la gestion de la
                          tontine.
                        </span>
                        <PrimaryButton type="button" onClick={openCreateModal}>
                          <Plus size={17} />
                          Créer un cycle
                        </PrimaryButton>
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  cycles.map((cycle) => (
                    <tr key={cycle.id || cycle._id}>
                      <td>
                        <CycleIdentity>
                          <CycleIcon>
                            <Layers size={20} />
                          </CycleIcon>

                          <div>
                            <strong>{cycle.name}</strong>
                            <span>
                              {getFrequencyLabel(cycle.frequency)} · Paiement du{" "}
                              {cycle.paymentStartDay} au{" "}
                              {cycle.paymentDeadlineDay}
                            </span>
                          </div>
                        </CycleIdentity>
                      </td>

                      <td>
                        <DateStack>
                          <span>Début : {formatDate(cycle.startDate)}</span>
                          <span>Fin : {formatDate(cycle.expectedEndDate)}</span>
                        </DateStack>
                      </td>

                      <td>
                        <AmountText>
                          {cycle.membersCount || 0} membre
                          {(cycle.membersCount || 0) > 1 ? "s" : ""}
                        </AmountText>
                      </td>

                      <td>
                        <DateStack>
                          <strong>
                            {formatCurrency(cycle.contributionAmount)}
                          </strong>
                          <span>
                            Total : {formatCurrency(cycle.totalExpectedAmount)}
                          </span>
                        </DateStack>
                      </td>

                      <td>
                        <StatusBadge $status={cycle.status}>
                          {getStatusIcon(cycle.status)}
                          {getStatusLabel(cycle.status)}
                        </StatusBadge>
                      </td>

                      <td>
                      <ActionGroup>
  <IconButton
    type="button"
    title="Voir"
    onClick={() => openDrawer(cycle)}
  >
    <Eye size={17} />
  </IconButton>

  <IconButton
    type="button"
    title="Gérer les membres"
    onClick={() => openMembersManager(cycle)}
  >
    <UsersRound size={17} />
  </IconButton>

  {cycle.status !== "completed" && (
    <IconButton
      type="button"
      title="Modifier"
      onClick={() => openEditModal(cycle)}
    >
      <Pencil size={17} />
    </IconButton>
  )}

  {cycle.status === "active" && (
    <IconButton
      type="button"
      title="Mettre en pause"
      disabled={actionLoading === `pause-${cycle.id || cycle._id}`}
      onClick={() => handleCycleAction("pause", cycle)}
    >
      <PauseCircle size={17} />
    </IconButton>
  )}

  {cycle.status === "paused" && (
    <IconButton
      type="button"
      title="Reprendre"
      disabled={actionLoading === `resume-${cycle.id || cycle._id}`}
      onClick={() => handleCycleAction("resume", cycle)}
    >
      <PlayCircle size={17} />
    </IconButton>
  )}
</ActionGroup>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </CyclesTable>
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
        {modalOpen && (
          <ModalLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalBackdrop onClick={closeModal} />

            <ModalCard
              as={motion.form}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22 }}
            >
              <ModalHeader>
                <div>
                  <SectionKicker>
                    <Layers size={15} />
                    {editingCycle ? "Modification" : "Nouveau cycle"}
                  </SectionKicker>

                  <h2>
                    {editingCycle ? "Modifier le cycle" : "Créer un cycle"}
                  </h2>

                  <p>
                    Si aucun membre n’est sélectionné, le backend intégrera
                    automatiquement tous les membres actifs.
                  </p>
                </div>

                <CloseButton type="button" onClick={closeModal}>
                  <X size={19} />
                </CloseButton>
              </ModalHeader>

              <FormGrid>
                <InputGroup $full>
                  <label>Nom du cycle *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleFormChange("name", event.target.value)
                    }
                    placeholder="Ex : Cycle tontine Mai 2026"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Date de début *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      handleFormChange("startDate", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Date de fin prévue</label>
                  <input
                    type="date"
                    value={form.expectedEndDate}
                    onChange={(event) =>
                      handleFormChange("expectedEndDate", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Montant de cotisation</label>
                  <input
                    type="number"
                    min="0"
                    value={form.contributionAmount}
                    onChange={(event) =>
                      handleFormChange("contributionAmount", event.target.value)
                    }
                    placeholder="Ex : 500000"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Fréquence</label>
                  <select
                    value={form.frequency}
                    onChange={(event) =>
                      handleFormChange("frequency", event.target.value)
                    }
                  >
                    <option value="monthly">Mensuelle</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Ouverture paiement</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.paymentStartDay}
                    onChange={(event) =>
                      handleFormChange("paymentStartDay", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Limite paiement</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.paymentDeadlineDay}
                    onChange={(event) =>
                      handleFormChange("paymentDeadlineDay", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup $full>
                  <label>Observations</label>
                  <textarea
                    rows="4"
                    value={form.notes}
                    onChange={(event) =>
                      handleFormChange("notes", event.target.value)
                    }
                    placeholder="Notes administratives..."
                  />
                </InputGroup>
              </FormGrid>

              <ModalFooter>
                <GhostButton type="button" onClick={closeModal}>
                  Annuler
                </GhostButton>

                <PrimaryButton type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={17} />
                      {editingCycle ? "Modifier" : "Créer le cycle"}
                    </>
                  )}
                </PrimaryButton>
              </ModalFooter>
            </ModalCard>
          </ModalLayer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && selectedCycle && (
          <DrawerLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DrawerBackdrop onClick={closeDrawer} />

            <DrawerCard
              as={motion.aside}
              initial={{ x: 460 }}
              animate={{ x: 0 }}
              exit={{ x: 460 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
            >
              <DrawerHeader>
                <div>
                  <SectionKicker>
                    <Eye size={15} />
                    Détail cycle
                  </SectionKicker>
                  <h2>{selectedCycle.name}</h2>
                </div>

                <CloseButton type="button" onClick={closeDrawer}>
                  <X size={19} />
                </CloseButton>
              </DrawerHeader>

              <ProfileCard>
                <LargeCycleIcon>
                  <Layers size={30} />
                </LargeCycleIcon>

                <div>
                  <strong>{selectedCycle.name}</strong>

                  <StatusBadge $status={selectedCycle.status}>
                    {getStatusIcon(selectedCycle.status)}
                    {getStatusLabel(selectedCycle.status)}
                  </StatusBadge>
                </div>
              </ProfileCard>

              <DetailList>
                <DetailItem>
                  <span>Fréquence</span>
                  <strong>{getFrequencyLabel(selectedCycle.frequency)}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Date de début</span>
                  <strong>{formatDate(selectedCycle.startDate)}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Date de fin prévue</span>
                  <strong>{formatDate(selectedCycle.expectedEndDate)}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Jour d’ouverture paiement</span>
                  <strong>{selectedCycle.paymentStartDay}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Jour limite paiement</span>
                  <strong>{selectedCycle.paymentDeadlineDay}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Nombre de membres</span>
                  <strong>{selectedCycle.membersCount || 0}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Cotisation par membre</span>
                  <strong>
                    {formatCurrency(selectedCycle.contributionAmount)}
                  </strong>
                </DetailItem>

                <DetailItem>
                  <span>Total attendu</span>
                  <strong>
                    {formatCurrency(selectedCycle.totalExpectedAmount)}
                  </strong>
                </DetailItem>
              </DetailList>

              <NoteBox>
                <span>Observations</span>
                <p>{selectedCycle.notes || "Aucune observation renseignée."}</p>
              </NoteBox>

              <MembersPreview>
                <span>Membres du cycle</span>

                {Array.isArray(selectedCycle.members) &&
                selectedCycle.members.length > 0 ? (
                  <ul>
                    {selectedCycle.members.slice(0, 8).map((member) => (
                      <li key={member._id || member.id}>
                        <strong>{member.fullName}</strong>
                        <small>{member.telephone || member.email}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun membre rattaché.</p>
                )}

                {selectedCycle.members?.length > 8 && (
                  <p>+ {selectedCycle.members.length - 8} autres membres</p>
                )}
              </MembersPreview>

              <DrawerFooter>
                {selectedCycle.status !== "completed" && (
                  <GhostButton
                    type="button"
                    onClick={() => {
                      closeDrawer();
                      openEditModal(selectedCycle);
                    }}
                  >
                    <Pencil size={17} />
                    Modifier
                  </GhostButton>
                )}

                {selectedCycle.status === "active" && (
                  <GhostButton
                    type="button"
                    onClick={() => handleCycleAction("pause", selectedCycle)}
                  >
                    <PauseCircle size={17} />
                    Pause
                  </GhostButton>
                )}

                {selectedCycle.status === "paused" && (
                  <GhostButton
                    type="button"
                    onClick={() => handleCycleAction("resume", selectedCycle)}
                  >
                    <PlayCircle size={17} />
                    Reprendre
                  </GhostButton>
                )}

                {selectedCycle.status !== "completed" && (
                  <DangerButton
                    type="button"
                    onClick={() => handleCycleAction("close", selectedCycle)}
                  >
                    <BadgeCheck size={17} />
                    Clôturer
                  </DangerButton>
                )}

                {selectedCycle.status === "completed" && (
                  <PrimaryButton
                    type="button"
                    onClick={() => handleCycleAction("restart", selectedCycle)}
                  >
                    <RotateCcw size={17} />
                    Relancer
                  </PrimaryButton>
                )}
              </DrawerFooter>
            </DrawerCard>
          </DrawerLayer>
        )}
      </AnimatePresence>
      <CycleMembersManager
  open={membersManagerOpen}
  cycleId={selectedCycleForMembers?.id || selectedCycleForMembers?._id}
  onClose={() => {
    setMembersManagerOpen(false);
    setSelectedCycleForMembers(null);
  }}
  onUpdated={async () => {
    await refreshAll();
  }}
/>
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

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroText = styled.div`
  max-width: 850px;

  h1 {
    margin: 0.8rem 0 0.65rem;
    font-size: clamp(1.8rem, 4vw, 3.2rem);
    line-height: 1.05;
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    max-width: 780px;
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

  @media (max-width: 900px) {
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
    letter-spacing: 0.04em;
  }

  strong {
    display: block;
    color: ${colors.white};
    font-size: clamp(1.25rem, 2vw, 1.7rem);
    margin: 0.22rem 0;
    line-height: 1.1;
    word-break: break-word;
  }

  small {
    font-size: 0.78rem;
    line-height: 1.4;
  }
`;

const ActiveCycleCard = styled.section`
  margin-top: 1rem;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
`;

const ActiveHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0.28rem 0 0;
    color: ${colors.navy};
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.2rem, 2.4vw, 1.65rem);
  }

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const ActiveGrid = styled.div`
  margin-top: 1rem;
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

const ActiveInfo = styled.div`
  padding: 0.85rem;
  border-radius: 0 16px 0 16px;
  border: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.35rem;
  }

  strong {
    color: ${colors.navy};
    font-size: 0.95rem;
    word-break: break-word;
  }
`;

const EmptyInline = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0 16px 0 16px;
  border: 1px dashed rgba(214, 168, 65, 0.6);
  background: ${colors.goldSoft};
  color: ${colors.warning};
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 800;
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const FiltersCard = styled.section`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0.25rem 0 0;
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    font-family: Georgia, "Times New Roman", serif;
    color: ${colors.navy};
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

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1.6fr) repeat(3, minmax(160px, 1fr));
  gap: 0.85rem;

  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};

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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid ${colors.border};
  background:
    linear-gradient(135deg, rgba(14, 45, 79, 0.04), rgba(15, 107, 79, 0.05));

  h2 {
    margin: 0.25rem 0;
    color: ${colors.navy};
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    font-family: Georgia, "Times New Roman", serif;
  }

  p {
    margin: 0;
    color: ${colors.muted};
    font-size: 0.9rem;
  }

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 760px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const CyclesTable = styled.table`
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 0.9rem 1rem;
    color: ${colors.navy};
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: rgba(14, 45, 79, 0.035);
    border-bottom: 1px solid ${colors.border};
    white-space: nowrap;
  }

  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba(14, 45, 79, 0.08);
    color: ${colors.text};
    vertical-align: middle;
    font-size: 0.92rem;
  }

  tbody tr {
    transition: 0.18s ease;
  }

  tbody tr:hover {
    background: rgba(214, 168, 65, 0.07);
  }
`;

const CycleIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;

  strong {
    display: block;
    color: ${colors.navy};
    font-size: 0.95rem;
  }

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.82rem;
    margin-top: 0.15rem;
    max-width: 320px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CycleIcon = styled.div`
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 0 14px 0 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, ${colors.navy}, ${colors.greenDark});
  color: ${colors.goldSoft};
  box-shadow: 0 10px 24px rgba(14, 45, 79, 0.18);
`;

const DateStack = styled.div`
  display: grid;
  gap: 0.22rem;

  span {
    color: ${colors.muted};
    font-size: 0.84rem;
    white-space: nowrap;
  }

  strong {
    color: ${colors.navy};
    white-space: nowrap;
  }
`;

const AmountText = styled.strong`
  color: ${colors.navy};
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.42rem 0.62rem;
  font-weight: 900;
  font-size: 0.78rem;
  white-space: nowrap;
  color: ${({ $status }) => {
    if ($status === "active") return colors.success;
    if ($status === "paused") return colors.warning;
    if ($status === "completed") return colors.navy;
    return colors.muted;
  }};
  background: ${({ $status }) => {
    if ($status === "active") return colors.successSoft;
    if ($status === "paused") return colors.warningSoft;
    if ($status === "completed") return colors.goldSoft;
    return "rgba(102, 112, 133, 0.12)";
  }};
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const IconButton = styled.button`
  width: 35px;
  height: 35px;
  border: 1px solid ${colors.border};
  background: ${colors.white};
  color: ${colors.navy};
  border-radius: 0 10px 0 10px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(214, 168, 65, 0.7);
    color: ${colors.green};
    box-shadow: 0 10px 24px rgba(14, 45, 79, 0.12);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const PaginationBar = styled.div`
  padding: 0.95rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border-top: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);

  span {
    color: ${colors.muted};
    font-size: 0.9rem;
    font-weight: 700;
  }

  @media (max-width: 620px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PaginationActions = styled.div`
  display: flex;
  gap: 0.55rem;
  justify-content: flex-end;

  @media (max-width: 620px) {
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
  transition: 0.2s ease;
  box-shadow: 0 14px 32px rgba(214, 168, 65, 0.24);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(214, 168, 65, 0.32);
  }

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
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: rgba(214, 168, 65, 0.12);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
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
  transition: 0.18s ease;

  &:hover:not(:disabled) {
    border-color: rgba(214, 168, 65, 0.7);
    transform: translateY(-1px);
  }

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
  background: linear-gradient(135deg, ${colors.danger}, #d92d20);
  color: ${colors.white};
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(180, 35, 24, 0.2);
  }

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

const EmptyState = styled.div`
  min-height: 240px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.65rem;
  padding: 2rem;
  color: ${colors.muted};

  svg {
    color: ${colors.gold};
  }

  strong {
    color: ${colors.navy};
    font-size: 1.1rem;
  }

  span {
    max-width: 420px;
    line-height: 1.6;
  }
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

const ModalCard = styled.form`
  position: relative;
  z-index: 1;
  width: min(760px, 100%);
  max-height: min(90vh, 860px);
  overflow-y: auto;
  border-radius: 0 28px 0 28px;
  background: ${colors.white};
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  background:
    linear-gradient(135deg, rgba(14, 45, 79, 0.97), rgba(11, 61, 46, 0.95));
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
    font-size: 0.9rem;
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
  transition: 0.18s ease;

  &:hover {
    transform: rotate(3deg) scale(1.03);
    background: rgba(255, 255, 255, 0.16);
  }
`;

const FormGrid = styled.div`
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${colors.border};
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const DrawerLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  justify-content: flex-end;
`;

const DrawerBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(7, 17, 29, 0.48);
  backdrop-filter: blur(6px);
`;

const DrawerCard = styled.aside`
  position: relative;
  z-index: 1;
  width: min(460px, 100%);
  height: 100%;
  background: ${colors.white};
  box-shadow: -24px 0 70px rgba(0, 0, 0, 0.22);
  padding: 1.1rem;
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem;
  border-radius: 0 20px 0 20px;
  background:
    linear-gradient(135deg, rgba(14, 45, 79, 0.97), rgba(11, 61, 46, 0.95));
  color: ${colors.white};

  h2 {
    margin: 0.35rem 0 0;
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.2;
  }
`;

const ProfileCard = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid ${colors.border};
  border-radius: 0 20px 0 20px;
  display: flex;
  gap: 0.9rem;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(214, 168, 65, 0.12), rgba(15, 107, 79, 0.06));

  strong {
    display: block;
    color: ${colors.navy};
    font-size: 1.05rem;
    margin-bottom: 0.45rem;
  }
`;

const LargeCycleIcon = styled.div`
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0 18px 0 18px;
  background: linear-gradient(135deg, ${colors.navy}, ${colors.greenDark});
  color: ${colors.goldSoft};
`;

const DetailList = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
`;

const DetailItem = styled.div`
  padding: 0.85rem;
  border: 1px solid ${colors.border};
  border-radius: 0 16px 0 16px;
  background: rgba(14, 45, 79, 0.025);

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.3rem;
  }

  strong {
    color: ${colors.navy};
    word-break: break-word;
  }
`;

const NoteBox = styled.div`
  margin-top: 1rem;
  padding: 0.95rem;
  border-radius: 0 18px 0 18px;
  border: 1px solid rgba(214, 168, 65, 0.35);
  background: ${colors.goldSoft};

  span {
    display: block;
    color: ${colors.warning};
    font-weight: 900;
    margin-bottom: 0.45rem;
  }

  p {
    margin: 0;
    color: ${colors.text};
    line-height: 1.6;
  }
`;

const MembersPreview = styled.div`
  margin-top: 1rem;
  padding: 0.95rem;
  border: 1px solid ${colors.border};
  border-radius: 0 18px 0 18px;
  background: rgba(14, 45, 79, 0.025);

  > span {
    display: block;
    color: ${colors.navy};
    font-weight: 950;
    margin-bottom: 0.7rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.55rem;
  }

  li {
    display: grid;
    gap: 0.1rem;
    padding: 0.65rem;
    border-radius: 0 12px 0 12px;
    background: ${colors.white};
    border: 1px solid rgba(14, 45, 79, 0.08);
  }

  strong {
    color: ${colors.navy};
  }

  small,
  p {
    color: ${colors.muted};
    margin: 0;
  }
`;

const DrawerFooter = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;

  ${GhostButton} {
    color: ${colors.navy};
    background: ${colors.white};
    border-color: ${colors.border};
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
