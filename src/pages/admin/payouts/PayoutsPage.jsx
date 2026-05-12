// src/pages/admin/payouts/PayoutsPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Filter,
  History,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trophy,
  Undo2,
  UserCheck,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import payoutService from "../../../services/payoutService";

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

const defaultFilters = {
  search: "",
  status: "",
  roundNumber: "",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const defaultPayoutForm = {
  amountPaid: "",
  payoutDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  paymentReference: "",
  notes: "",
};

const paymentMethods = [
  { value: "cash", label: "Espèces" },
  { value: "orange_money", label: "Orange Money" },
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "other", label: "Autre" },
];

const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "paid", label: "Payés" },
  { value: "cancelled", label: "Annulés" },
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
    case "paid":
      return "Payé";
    case "cancelled":
      return "Annulé";
    default:
      return status || "—";
  }
};

const getPaymentMethodLabel = (method) => {
  return paymentMethods.find((item) => item.value === method)?.label || method || "—";
};

const getStatusIcon = (status) => {
  switch (status) {
    case "paid":
      return <CheckCircle2 size={14} />;
    case "cancelled":
      return <XCircle size={14} />;
    default:
      return <WalletCards size={14} />;
  }
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

export default function PayoutsPage() {
  const [overview, setOverview] = useState(null);
  const [payouts, setPayouts] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    cancelled: 0,
    totalPaidAmount: 0,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [filters, setFilters] = useState(defaultFilters);

  const [overviewLoading, setOverviewLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [payoutForm, setPayoutForm] = useState(defaultPayoutForm);
  const [payoutSaving, setPayoutSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState("");

  const cycleId = overview?.cycle?.id || overview?.cycle?._id || "";

  const fetchOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);

      const data = await payoutService.getOverview();

      setOverview(data || null);
    } catch (error) {
      setOverview(null);
      toast.error(getErrorMessage(error));
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const data = await payoutService.getStats({
        cycleId,
      });

      setStats({
        total: data?.total || 0,
        paid: data?.paid || 0,
        cancelled: data?.cancelled || 0,
        totalPaidAmount: data?.totalPaidAmount || 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, [cycleId]);

  const fetchPayouts = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const data = await payoutService.getPayouts({
        search: filters.search,
        cycleId,
        status: filters.status,
        roundNumber: filters.roundNumber,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      setPayouts(data?.payouts || []);
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
  }, [cycleId, filters]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchOverview(), fetchStats(), fetchPayouts()]);
  }, [fetchOverview, fetchStats, fetchPayouts]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchStats();
    fetchPayouts();
  }, [fetchStats, fetchPayouts]);

  const statCards = useMemo(
    () => [
      {
        title: "Membres du cycle",
        value: overview?.membersCount || 0,
        icon: Users,
        tone: "navy",
        description: "Participants du cycle actif",
      },
      {
        title: "Déjà pris",
        value: overview?.paidCount || 0,
        icon: UserCheck,
        tone: "green",
        description: `Tour ${overview?.currentRound || 1}`,
      },
      {
        title: "Restent à prendre",
        value: overview?.pendingCount || 0,
        icon: Crown,
        tone: "warning",
        description: "Bénéficiaires restants",
      },
      {
        title: "Montant du pot",
        value: formatCurrency(overview?.totalPot || 0),
        icon: Banknote,
        tone: "gold",
        description: "Montant estimé à payer",
      },
    ],
    [overview]
  );

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const openPayoutModal = (member) => {
    setSelectedMember(member);

    setPayoutForm({
      amountPaid: overview?.totalPot || "",
      payoutDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "cash",
      paymentReference: "",
      notes: "",
    });

    setPayoutModalOpen(true);
  };

  const closePayoutModal = () => {
    if (payoutSaving) return;

    setPayoutModalOpen(false);
    setSelectedMember(null);
    setPayoutForm(defaultPayoutForm);
  };

  const handlePayoutFormChange = (key, value) => {
    setPayoutForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreatePayout = async (event) => {
    event.preventDefault();

    if (!selectedMember) return;

    if (!cycleId) {
      toast.error("Aucun cycle actif trouvé.");
      return;
    }

    if (Number(payoutForm.amountPaid) <= 0) {
      toast.error("Le montant payé doit être supérieur à 0.");
      return;
    }

    try {
      setPayoutSaving(true);

      await payoutService.createPayout({
        cycleId,
        memberId: selectedMember.id || selectedMember._id,
        amountPaid: Number(payoutForm.amountPaid || 0),
        payoutDate: payoutForm.payoutDate,
        paymentMethod: payoutForm.paymentMethod,
        paymentReference: payoutForm.paymentReference,
        notes: payoutForm.notes,
      });

      toast.success(
        "Bénéficiaire payé avec succès. Email envoyé si SMTP est configuré."
      );

      closePayoutModal();
      await fetchOverview();
      await fetchStats();
      await fetchPayouts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPayoutSaving(false);
    }
  };

  const handleCancelPayout = async (payout) => {
    const id = payout?.id || payout?._id;

    if (!id) return;

    if (!window.confirm("Voulez-vous annuler ce paiement bénéficiaire ?")) {
      return;
    }

    try {
      setActionLoading(`cancel-${id}`);

      await payoutService.cancelPayout(id);

      toast.success("Paiement bénéficiaire annulé avec succès.");

      await fetchOverview();
      await fetchStats();
      await fetchPayouts();
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

            <h1>Gestion des bénéficiaires</h1>

            <p>
              Suivez les membres qui ont déjà pris la tontine, ceux qui restent
              à payer, le montant du pot et l’historique complet des tirages.
              Quand tous les membres ont reçu, le système prépare le tour
              suivant automatiquement.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <Trophy size={15} />
                Tour actuel : {overview?.currentRound || 1}
              </HeroMetaItem>

              <HeroMetaItem>
                <CalendarDays size={15} />
                Cycle : {overview?.cycle?.name || "Aucun cycle actif"}
              </HeroMetaItem>

              <HeroMetaItem>
                <Mail size={15} />
                Email au bénéficiaire
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
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
                  <strong>{overviewLoading ? "..." : card.value}</strong>
                  <small>{card.description}</small>
                </StatBody>
              </StatCard>
            );
          })}
        </StatsGrid>
      </Hero>

      <OverviewCard
        as={motion.section}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.42, delay: 0.08 }}
      >
        <OverviewHeader>
          <div>
            <SectionKicker>
              <Crown size={15} />
              Rotation des bénéficiaires
            </SectionKicker>

            <h2>
              {overview?.cycle?.name
                ? `Tour ${overview.currentRound} — ${overview.cycle.name}`
                : "Aucun cycle actif disponible"}
            </h2>
          </div>

          <OverviewBadge $success={overview?.pendingCount === 0 && overview?.membersCount > 0}>
            {overview?.pendingCount === 0 && overview?.membersCount > 0 ? (
              <>
                <BadgeCheck size={16} />
                Tour terminé
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                {overview?.pendingCount || 0} restant(s)
              </>
            )}
          </OverviewBadge>
        </OverviewHeader>

        {!overview ? (
          <EmptyInline>
            <AlertTriangle size={22} />
            <span>
              Aucun cycle actif trouvé. Crée d’abord un cycle avant de gérer les
              bénéficiaires.
            </span>
          </EmptyInline>
        ) : (
          <RotationGrid>
            <RotationColumn>
              <ColumnTitle>
                <CheckCircle2 size={17} />
                Ont déjà pris
              </ColumnTitle>

              {overview.paidMembers?.length > 0 ? (
                <MemberList>
                  {overview.paidMembers.map((item) => (
                    <MemberCard key={item.payout?.id || item.member?.id}>
                      <Avatar>{getInitials(item.member?.fullName)}</Avatar>

                      <div>
                        <strong>{item.member?.fullName || "Membre"}</strong>
                        <span>
                          {formatCurrency(item.payout?.amountPaid)} ·{" "}
                          {formatDate(item.payout?.payoutDate)}
                        </span>
                      </div>
                    </MemberCard>
                  ))}
                </MemberList>
              ) : (
                <SmallEmpty>Aucun bénéficiaire payé pour ce tour.</SmallEmpty>
              )}
            </RotationColumn>

            <RotationColumn>
              <ColumnTitle>
                <Crown size={17} />
                Restent à prendre
              </ColumnTitle>

              {overview.pendingMembers?.length > 0 ? (
                <MemberList>
                  {overview.pendingMembers.map((member) => (
                    <MemberCard key={member.id || member._id}>
                      <Avatar>{getInitials(member.fullName)}</Avatar>

                      <div>
                        <strong>{member.fullName}</strong>
                        <span>{member.telephone || member.email || "—"}</span>
                      </div>

                      <PrimaryMiniButton
                        type="button"
                        onClick={() => openPayoutModal(member)}
                      >
                        <CreditCard size={16} />
                        Payer
                      </PrimaryMiniButton>
                    </MemberCard>
                  ))}
                </MemberList>
              ) : (
                <SmallEmpty>
                  Tous les membres ont pris pour ce tour. Le prochain paiement
                  ouvrira un nouveau tour.
                </SmallEmpty>
              )}
            </RotationColumn>
          </RotationGrid>
        )}
      </OverviewCard>

      <FinanceCard>
        <FinanceHeader>
          <div>
            <SectionKicker>
              <Banknote size={15} />
              Synthèse des paiements bénéficiaires
            </SectionKicker>

            <h2>Historique financier</h2>
          </div>
        </FinanceHeader>

        <FinanceGrid>
          <FinanceItem>
            <span>Total opérations</span>
            <strong>{statsLoading ? "..." : stats.total}</strong>
          </FinanceItem>

          <FinanceItem>
            <span>Paiements validés</span>
            <strong>{statsLoading ? "..." : stats.paid}</strong>
          </FinanceItem>

          <FinanceItem>
            <span>Paiements annulés</span>
            <strong>{statsLoading ? "..." : stats.cancelled}</strong>
          </FinanceItem>

          <FinanceItem>
            <span>Total payé</span>
            <strong>
              {statsLoading ? "..." : formatCurrency(stats.totalPaidAmount)}
            </strong>
          </FinanceItem>
        </FinanceGrid>
      </FinanceCard>

      <ContentGrid>
        <FiltersCard>
          <SectionHeader>
            <div>
              <SectionKicker>
                <Filter size={15} />
                Filtres
              </SectionKicker>

              <h2>Recherche dans l’historique</h2>
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
              <label>Tour</label>
              <input
                type="number"
                min="1"
                placeholder="Tous"
                value={filters.roundNumber}
                onChange={(event) =>
                  handleChangeFilter("roundNumber", event.target.value)
                }
              />
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

        <TableCard>
          <TableHeader>
            <div>
              <SectionKicker>
                <History size={15} />
                Registre des bénéficiaires
              </SectionKicker>

              <h2>Historique des paiements</h2>

              <p>
                {pagination.total} paiement
                {pagination.total > 1 ? "s" : ""} trouvé
                {pagination.total > 1 ? "s" : ""}.
              </p>
            </div>

            <HeaderActions>
              <SmallButton
                type="button"
                onClick={() => setFilters(defaultFilters)}
              >
                Réinitialiser
              </SmallButton>

              <GhostDarkButton type="button" onClick={refreshAll}>
                <RefreshCcw size={16} />
                Actualiser
              </GhostDarkButton>
            </HeaderActions>
          </TableHeader>

          <TableScroll>
            <PayoutTable>
              <thead>
                <tr>
                  <th>Bénéficiaire</th>
                  <th>Cycle / Tour</th>
                  <th>Montant</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {historyLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan="6">
                        <SkeletonLine />
                      </td>
                    </tr>
                  ))
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <EmptyState>
                        <Crown size={42} />
                        <strong>Aucun bénéficiaire payé</strong>
                        <span>
                          Sélectionne un membre dans la colonne “Restent à
                          prendre” pour enregistrer son paiement.
                        </span>
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => {
                    const id = payout.id || payout._id;

                    return (
                      <tr key={id}>
                        <td>
                          <MemberIdentity>
                            <Avatar>{getInitials(payout.member?.fullName)}</Avatar>

                            <div>
                              <strong>
                                {payout.member?.fullName || "Bénéficiaire"}
                              </strong>
                              <span>
                                {payout.member?.telephone ||
                                  payout.member?.email ||
                                  "Contact non renseigné"}
                              </span>
                            </div>
                          </MemberIdentity>
                        </td>

                        <td>
                          <DateStack>
                            <strong>{payout.cycle?.name || "Cycle"}</strong>
                            <span>Tour n°{payout.roundNumber}</span>
                          </DateStack>
                        </td>

                        <td>
                          <DateStack>
                            <strong>{formatCurrency(payout.amountPaid)}</strong>
                            <span>{payout.paymentReference || "Sans référence"}</span>
                          </DateStack>
                        </td>

                        <td>
                          <DateStack>
                            <strong>{formatDate(payout.payoutDate)}</strong>
                            <span>{getPaymentMethodLabel(payout.paymentMethod)}</span>
                          </DateStack>
                        </td>

                        <td>
                          <StatusBadge $status={payout.status}>
                            {getStatusIcon(payout.status)}
                            {getStatusLabel(payout.status)}
                          </StatusBadge>
                        </td>

                        <td>
                          {payout.status === "paid" ? (
                            <DangerMiniButton
                              type="button"
                              disabled={actionLoading === `cancel-${id}`}
                              onClick={() => handleCancelPayout(payout)}
                            >
                              {actionLoading === `cancel-${id}` ? (
                                <Spinner />
                              ) : (
                                <Undo2 size={16} />
                              )}
                              Annuler
                            </DangerMiniButton>
                          ) : (
                            <CancelledText>Annulé</CancelledText>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </PayoutTable>
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
        {payoutModalOpen && selectedMember && (
          <ModalLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalBackdrop onClick={closePayoutModal} />

            <ModalCard
              as={motion.form}
              onSubmit={handleCreatePayout}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22 }}
            >
              <ModalHeader>
                <div>
                  <SectionKicker>
                    <Crown size={15} />
                    Paiement bénéficiaire
                  </SectionKicker>

                  <h2>Enregistrer le bénéficiaire</h2>

                  <p>
                    Le membre recevra un email de confirmation si le service
                    SMTP est configuré.
                  </p>
                </div>

                <CloseButton type="button" onClick={closePayoutModal}>
                  <X size={19} />
                </CloseButton>
              </ModalHeader>

              <PaymentSummary>
                <strong>{selectedMember.fullName}</strong>
                <span>
                  Tour {overview?.currentRound || 1} · Pot estimé :{" "}
                  {formatCurrency(overview?.totalPot || 0)}
                </span>
              </PaymentSummary>

              <FormGrid>
                <InputGroup>
                  <label>Montant payé *</label>
                  <input
                    type="number"
                    min="0"
                    value={payoutForm.amountPaid}
                    onChange={(event) =>
                      handlePayoutFormChange("amountPaid", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Date de paiement</label>
                  <input
                    type="date"
                    value={payoutForm.payoutDate}
                    onChange={(event) =>
                      handlePayoutFormChange("payoutDate", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Mode de paiement</label>
                  <select
                    value={payoutForm.paymentMethod}
                    onChange={(event) =>
                      handlePayoutFormChange("paymentMethod", event.target.value)
                    }
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Référence</label>
                  <input
                    type="text"
                    value={payoutForm.paymentReference}
                    onChange={(event) =>
                      handlePayoutFormChange(
                        "paymentReference",
                        event.target.value
                      )
                    }
                    placeholder="Référence paiement"
                  />
                </InputGroup>

                <InputGroup $full>
                  <label>Observation</label>
                  <textarea
                    rows="4"
                    value={payoutForm.notes}
                    onChange={(event) =>
                      handlePayoutFormChange("notes", event.target.value)
                    }
                    placeholder="Notes administratives..."
                  />
                </InputGroup>
              </FormGrid>

              <ModalFooter>
                <GhostDarkButton type="button" onClick={closePayoutModal}>
                  Annuler
                </GhostDarkButton>

                <PrimaryButton type="submit" disabled={payoutSaving}>
                  {payoutSaving ? (
                    <>
                      <Spinner />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={17} />
                      Confirmer le paiement
                    </>
                  )}
                </PrimaryButton>
              </ModalFooter>
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

  @media (max-width: 900px) {
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
    font-size: clamp(1.05rem, 1.8vw, 1.45rem);
    margin: 0.22rem 0;
    line-height: 1.15;
    word-break: break-word;
  }

  small {
    font-size: 0.78rem;
    line-height: 1.4;
  }
`;

const OverviewCard = styled.section`
  margin-top: 1rem;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
`;

const OverviewHeader = styled.div`
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

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

const OverviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.52rem 0.78rem;
  font-weight: 900;
  color: ${({ $success }) => ($success ? colors.success : colors.warning)};
  background: ${({ $success }) =>
    $success ? colors.successSoft : colors.warningSoft};
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

const RotationGrid = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const RotationColumn = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 0 20px 0 20px;
  background: rgba(14, 45, 79, 0.025);
  padding: 1rem;
  min-width: 0;
`;

const ColumnTitle = styled.h3`
  margin: 0 0 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: ${colors.navy};
  font-size: 1rem;
`;

const MemberList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const MemberCard = styled.div`
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid rgba(14, 45, 79, 0.09);
  border-radius: 0 14px 0 14px;
  background: ${colors.white};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;

  strong,
  span {
    display: block;
    min-width: 0;
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

    button {
      grid-column: 1 / -1;
      justify-content: center;
    }
  }
`;

const SmallEmpty = styled.div`
  padding: 1rem;
  border-radius: 0 14px 0 14px;
  background: ${colors.goldSoft};
  color: ${colors.warning};
  font-weight: 800;
  line-height: 1.55;
`;

const FinanceCard = styled.section`
  margin-top: 1rem;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: clamp(1rem, 2vw, 1.3rem);
`;

const FinanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;

  h2 {
    margin: 0.25rem 0 0;
    color: ${colors.navy};
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.2rem, 2.4vw, 1.65rem);
  }
`;

const FinanceGrid = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
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
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 0.35rem;
  }

  strong {
    color: ${colors.navy};
    font-size: 1rem;
    word-break: break-word;
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
  grid-template-columns: minmax(220px, 1.6fr) repeat(3, minmax(150px, 1fr));
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

const PayoutTable = styled.table`
  width: 100%;
  min-width: 980px;
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.42rem 0.62rem;
  font-weight: 900;
  font-size: 0.78rem;
  white-space: nowrap;
  color: ${({ $status }) =>
    $status === "paid" ? colors.success : colors.danger};
  background: ${({ $status }) =>
    $status === "paid" ? colors.successSoft : colors.dangerSoft};
`;

const CancelledText = styled.span`
  color: ${colors.danger};
  font-weight: 900;
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
`;

const GhostDarkButton = styled.button`
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
`;

const DangerMiniButton = styled.button`
  border: 0;
  min-height: 34px;
  padding: 0.48rem 0.7rem;
  border-radius: 0 10px 0 10px;
  background: ${colors.dangerSoft};
  color: ${colors.danger};
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
`;

const PaymentSummary = styled.div`
  margin: 1.25rem;
  padding: 1rem;
  border: 1px solid rgba(214, 168, 65, 0.35);
  border-radius: 0 18px 0 18px;
  background: ${colors.goldSoft};

  strong {
    display: block;
    color: ${colors.navy};
    margin-bottom: 0.35rem;
  }

  span {
    color: ${colors.warning};
    font-weight: 800;
  }
`;

const FormGrid = styled.div`
  padding: 0 1.25rem 1.25rem;
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

const Spinner = styled.span`
  width: 17px;
  height: 17px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 0.75s linear infinite;
`;