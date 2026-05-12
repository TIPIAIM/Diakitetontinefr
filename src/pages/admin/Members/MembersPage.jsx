// src/pages/admin/MembersPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import memberService from "../../../services/memberService";

/**
 * Charte graphique inspirée du tribunal :
 * - bleu marine institutionnel
 * - vert profond
 * - doré
 * - fonds doux
 * - cartes premium
 */
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
  { value: "inactive", label: "Inactifs" },
  { value: "suspended", label: "Suspendus" },
];

const emptyForm = {
  fullName: "",
  telephone: "",
  email: "",
  address: "",
  contributionAmount: "",
  status: "active",
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
    case "inactive":
      return "Inactif";
    case "suspended":
      return "Suspendu";
    default:
      return status || "—";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return <CheckCircle2 size={14} />;
    case "inactive":
      return <UserX size={14} />;
    case "suspended":
      return <AlertCircle size={14} />;
    default:
      return <Activity size={14} />;
  }
};

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    totalExpectedContribution: 0,
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
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await memberService.getStats();

      setStats({
        total: data?.total || 0,
        active: data?.active || 0,
        inactive: data?.inactive || 0,
        suspended: data?.suspended || 0,
        totalExpectedContribution: data?.totalExpectedContribution || 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await memberService.getMembers(filters);

      setMembers(data?.members || []);
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const statCards = useMemo(
    () => [
      {
        title: "Total membres",
        value: stats.total,
        icon: Users,
        tone: "navy",
        description: "Tous les membres enregistrés",
      },
      {
        title: "Membres actifs",
        value: stats.active,
        icon: UserCheck,
        tone: "green",
        description: "Participants disponibles",
      },
      {
        title: "Inactifs",
        value: stats.inactive,
        icon: UserX,
        tone: "warning",
        description: "Membres désactivés",
      },
      {
        title: "Cotisation attendue",
        value: formatCurrency(stats.totalExpectedContribution),
        icon: Banknote,
        tone: "gold",
        description: "Total théorique des actifs",
      },
    ],
    [stats]
  );

  const openCreateModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName || "",
      telephone: member.telephone || "",
      email: member.email || "",
      address: member.address || "",
      contributionAmount: member.contributionAmount || "",
      status: member.status || "active",
      notes: member.notes || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingMember(null);
    setForm(emptyForm);
  };

  const openDrawer = (member) => {
    setSelectedMember(member);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedMember(null);
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
    if (!form.fullName.trim()) {
      toast.error("Le nom complet est obligatoire.");
      return false;
    }

    if (!form.telephone.trim()) {
      toast.error("Le numéro de téléphone est obligatoire.");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("L'adresse email est obligatoire.");
      return false;
    }

    if (Number(form.contributionAmount) < 0) {
      toast.error("Le montant ne peut pas être négatif.");
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
        fullName: form.fullName.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        contributionAmount: Number(form.contributionAmount || 0),
        status: form.status,
        notes: form.notes.trim(),
      };

      if (editingMember) {
        await memberService.updateMember(
          editingMember.id || editingMember._id,
          payload
        );
        toast.success("Membre modifié avec succès.");
      } else {
        await memberService.createMember(payload);
        toast.success("Membre ajouté avec succès.");
      }

      closeModal();
      await Promise.all([fetchMembers(), fetchStats()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await memberService.deleteMember(deleteTarget.id || deleteTarget._id);

      toast.success("Membre désactivé avec succès.");

      setDeleteTarget(null);
      await Promise.all([fetchMembers(), fetchStats()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
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

            <h1>Gestion des membres</h1>

            <p>
              Espace centralisé pour enregistrer, suivre et contrôler les
              membres participant à la tontine. Chaque fiche membre reste
              structurée, traçable et prête pour les modules de cotisation,
              bénéficiaires et rapports.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <CalendarDays size={15} />
                Suivi administratif
              </HeroMetaItem>

              <HeroMetaItem>
                <BadgeCheck size={15} />
                Données sécurisées
              </HeroMetaItem>

              <HeroMetaItem>
                <Activity size={15} />
                Vue dynamique
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <PrimaryButton type="button" onClick={openCreateModal}>
              <Plus size={18} />
              Ajouter un membre
            </PrimaryButton>

            <GhostButton
              type="button"
              onClick={() => {
                fetchMembers();
                fetchStats();
              }}
            >
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
                  placeholder="Nom, téléphone, email, adresse..."
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
                <option value="fullName">Nom complet</option>
                <option value="joinedAt">Date d’inscription</option>
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
                <Users size={15} />
                Registre des membres
              </SectionKicker>
              <h2>Liste des participants</h2>
              <p>
                {pagination.total} membre
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
            <MembersTable>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Contact</th>
                  <th>Cotisation</th>
                  <th>Statut</th>
                  <th>Inscription</th>
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
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <EmptyState>
                        <Users size={42} />
                        <strong>Aucun membre trouvé</strong>
                        <span>
                          Ajoute un premier membre ou modifie les filtres de
                          recherche.
                        </span>
                        <PrimaryButton type="button" onClick={openCreateModal}>
                          <Plus size={17} />
                          Ajouter un membre
                        </PrimaryButton>
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id || member._id}>
                      <td>
                        <MemberIdentity>
                          <Avatar>
                            {member.fullName
                              ?.split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "M"}
                          </Avatar>

                          <div>
                            <strong>{member.fullName}</strong>
                            <span>
                              {member.address || "Adresse non renseignée"}
                            </span>
                          </div>
                        </MemberIdentity>
                      </td>

                      <td>
                        <ContactStack>
                          <span>
                            <Phone size={14} />
                            {member.telephone}
                          </span>
                          <span>
                            <Mail size={14} />
                            {member.email}
                          </span>
                        </ContactStack>
                      </td>

                      <td>
                        <AmountText>
                          {formatCurrency(member.contributionAmount)}
                        </AmountText>
                      </td>

                      <td>
                        <StatusBadge $status={member.status}>
                          {getStatusIcon(member.status)}
                          {getStatusLabel(member.status)}
                        </StatusBadge>
                      </td>

                      <td>{formatDate(member.joinedAt || member.createdAt)}</td>

                      <td>
                        <ActionGroup>
                          <IconButton
                            type="button"
                            title="Voir"
                            onClick={() => openDrawer(member)}
                          >
                            <Eye size={17} />
                          </IconButton>

                          <IconButton
                            type="button"
                            title="Modifier"
                            onClick={() => openEditModal(member)}
                          >
                            <Pencil size={17} />
                          </IconButton>

                          <DangerIconButton
                            type="button"
                            title="Désactiver"
                            onClick={() => setDeleteTarget(member)}
                          >
                            <Trash2 size={17} />
                          </DangerIconButton>
                        </ActionGroup>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </MembersTable>
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
                    <UserCheck size={15} />
                    {editingMember ? "Modification" : "Nouveau membre"}
                  </SectionKicker>
                  <h2>
                    {editingMember ? "Modifier le membre" : "Ajouter un membre"}
                  </h2>
                  <p>
                    Les informations saisies ici serviront pour les cotisations,
                    les bénéficiaires et les notifications email.
                  </p>
                </div>

                <CloseButton type="button" onClick={closeModal}>
                  <X size={19} />
                </CloseButton>
              </ModalHeader>

              <FormGrid>
                <InputGroup>
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) =>
                      handleFormChange("fullName", event.target.value)
                    }
                    placeholder="Ex : Mamadou Diakité"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Téléphone *</label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(event) =>
                      handleFormChange("telephone", event.target.value)
                    }
                    placeholder="Ex : +224620000000"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleFormChange("email", event.target.value)
                    }
                    placeholder="Ex : membre@email.com"
                  />
                </InputGroup>

                <InputGroup>
                  <label>Montant cotisation</label>
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
                  <label>Statut</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleFormChange("status", event.target.value)
                    }
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Adresse</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(event) =>
                      handleFormChange("address", event.target.value)
                    }
                    placeholder="Ex : Conakry, Kipé"
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
                      {editingMember ? "Modifier" : "Enregistrer"}
                    </>
                  )}
                </PrimaryButton>
              </ModalFooter>
            </ModalCard>
          </ModalLayer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && selectedMember && (
          <DrawerLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DrawerBackdrop onClick={closeDrawer} />

            <DrawerCard
              as={motion.aside}
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
            >
              <DrawerHeader>
                <div>
                  <SectionKicker>
                    <Eye size={15} />
                    Détail membre
                  </SectionKicker>
                  <h2>{selectedMember.fullName}</h2>
                </div>

                <CloseButton type="button" onClick={closeDrawer}>
                  <X size={19} />
                </CloseButton>
              </DrawerHeader>

              <ProfileCard>
                <LargeAvatar>
                  {selectedMember.fullName
                    ?.split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "M"}
                </LargeAvatar>

                <div>
                  <strong>{selectedMember.fullName}</strong>
                  <StatusBadge $status={selectedMember.status}>
                    {getStatusIcon(selectedMember.status)}
                    {getStatusLabel(selectedMember.status)}
                  </StatusBadge>
                </div>
              </ProfileCard>

              <DetailList>
                <DetailItem>
                  <span>Téléphone</span>
                  <strong>{selectedMember.telephone}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Email</span>
                  <strong>{selectedMember.email}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Adresse</span>
                  <strong>{selectedMember.address || "—"}</strong>
                </DetailItem>

                <DetailItem>
                  <span>Cotisation prévue</span>
                  <strong>
                    {formatCurrency(selectedMember.contributionAmount)}
                  </strong>
                </DetailItem>

                <DetailItem>
                  <span>Date d’inscription</span>
                  <strong>
                    {formatDate(
                      selectedMember.joinedAt || selectedMember.createdAt
                    )}
                  </strong>
                </DetailItem>

                <DetailItem>
                  <span>Dernière modification</span>
                  <strong>{formatDate(selectedMember.updatedAt)}</strong>
                </DetailItem>
              </DetailList>

              <NoteBox>
                <span>Observations</span>
                <p>
                  {selectedMember.notes || "Aucune observation renseignée."}
                </p>
              </NoteBox>

              <DrawerFooter>
                <GhostButton
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    openEditModal(selectedMember);
                  }}
                >
                  <Pencil size={17} />
                  Modifier
                </GhostButton>

                <DangerButton
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    setDeleteTarget(selectedMember);
                  }}
                >
                  <Trash2 size={17} />
                  Désactiver
                </DangerButton>
              </DrawerFooter>
            </DrawerCard>
          </DrawerLayer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ModalLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalBackdrop onClick={() => setDeleteTarget(null)} />

            <ConfirmCard
              as={motion.div}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
            >
              <AlertIcon>
                <AlertCircle size={26} />
              </AlertIcon>

              <h2>Désactiver ce membre ?</h2>

              <p>
                Le membre <strong>{deleteTarget.fullName}</strong> sera retiré
                de la liste active, mais son historique restera disponible pour
                les prochains modules de cotisation et de rapports.
              </p>

              <ConfirmActions>
                <GhostButton
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                >
                  Annuler
                </GhostButton>

                <DangerButton
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? (
                    <>
                      <Spinner />
                      Désactivation...
                    </>
                  ) : (
                    <>
                      <Trash2 size={17} />
                      Désactiver
                    </>
                  )}
                </DangerButton>
              </ConfirmActions>
            </ConfirmCard>
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
  background: radial-gradient(
      circle at top left,
      rgba(214, 168, 65, 0.18),
      transparent 32rem
    ),
    linear-gradient(135deg, ${colors.bg}, ${colors.bg2});
  padding: clamp(1rem, 2vw, 2rem);
  color: ${colors.text};
  overflow-x: clip;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 0 28px 0 28px;
  background: linear-gradient(
      135deg,
      rgba(14, 45, 79, 0.96),
      rgba(11, 61, 46, 0.96)
    ),
    radial-gradient(
      circle at top right,
      rgba(214, 168, 65, 0.35),
      transparent 28rem
    );
  box-shadow: ${colors.shadow};
  color: ${colors.white};
  padding: clamp(1.1rem, 2.5vw, 2rem);
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 1px,
      transparent 1px
    ),
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
  background: linear-gradient(
    135deg,
    rgba(14, 45, 79, 0.04),
    rgba(15, 107, 79, 0.05)
  );

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

const MembersTable = styled.table`
  width: 100%;
  min-width: 920px;
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

const MemberIdentity = styled.div`
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
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
  box-shadow: 0 10px 24px rgba(14, 45, 79, 0.18);
`;

const ContactStack = styled.div`
  display: grid;
  gap: 0.32rem;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    color: ${colors.muted};
    font-size: 0.86rem;
  }

  svg {
    color: ${colors.green};
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
    if ($status === "suspended") return colors.warning;
    return colors.muted;
  }};
  background: ${({ $status }) => {
    if ($status === "active") return colors.successSoft;
    if ($status === "suspended") return colors.warningSoft;
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

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(214, 168, 65, 0.7);
    color: ${colors.green};
    box-shadow: 0 10px 24px rgba(14, 45, 79, 0.12);
  }
`;

const DangerIconButton = styled(IconButton)`
  color: ${colors.danger};

  &:hover {
    color: ${colors.danger};
    border-color: rgba(180, 35, 24, 0.35);
    background: ${colors.dangerSoft};
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
  background: linear-gradient(
    135deg,
    rgba(14, 45, 79, 0.97),
    rgba(11, 61, 46, 0.95)
  );
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
  width: min(430px, 100%);
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
  background: linear-gradient(
    135deg,
    rgba(14, 45, 79, 0.97),
    rgba(11, 61, 46, 0.95)
  );
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
  background: linear-gradient(
    135deg,
    rgba(214, 168, 65, 0.12),
    rgba(15, 107, 79, 0.06)
  );

  strong {
    display: block;
    color: ${colors.navy};
    font-size: 1.05rem;
    margin-bottom: 0.45rem;
  }
`;

const LargeAvatar = styled.div`
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0 18px 0 18px;
  background: linear-gradient(135deg, ${colors.navy}, ${colors.greenDark});
  color: ${colors.goldSoft};
  font-weight: 950;
  font-size: 1.2rem;
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

const DrawerFooter = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;

  ${GhostButton} {
    color: ${colors.navy};
    background: ${colors.white};
    border-color: ${colors.border};
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const ConfirmCard = styled.div`
  position: relative;
  z-index: 1;
  width: min(460px, 100%);
  background: ${colors.white};
  border-radius: 0 24px 0 24px;
  padding: 1.35rem;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.25);
  text-align: center;

  h2 {
    color: ${colors.navy};
    font-family: Georgia, "Times New Roman", serif;
    margin: 0.8rem 0 0.45rem;
  }

  p {
    margin: 0;
    color: ${colors.muted};
    line-height: 1.65;
  }
`;

const AlertIcon = styled.div`
  width: 58px;
  height: 58px;
  margin: 0 auto;
  display: grid;
  place-items: center;
  border-radius: 0 18px 0 18px;
  color: ${colors.danger};
  background: ${colors.dangerSoft};
`;

const ConfirmActions = styled.div`
  margin-top: 1.1rem;
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  flex-wrap: wrap;

  ${GhostButton} {
    color: ${colors.navy};
    border-color: ${colors.border};
    background: ${colors.white};
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
