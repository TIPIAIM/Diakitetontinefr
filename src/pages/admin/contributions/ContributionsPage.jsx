// src/pages/admin/contributions/ContributionsPage.jsx
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
  Clock3,
  CreditCard,
  Filter,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Undo2,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import contributionService from "../../../services/contributionService";
import cycleService from "../../../services/cycleService";

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

const now = new Date();

const defaultFilters = {
  search: "",
  status: "",
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const defaultPayForm = {
  amountPaid: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  paymentReference: "",
  notes: "",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const statusOptions = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payées" },
  { value: "late", label: "En retard" },
];

const paymentMethods = [
  { value: "cash", label: "Espèces" },
  { value: "orange_money", label: "Orange Money" },
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "other", label: "Autre" },
];

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
      return "Payée";
    case "late":
      return "En retard";
    case "pending":
      return "En attente";
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
    case "late":
      return <AlertTriangle size={14} />;
    case "pending":
      return <Clock3 size={14} />;
    default:
      return <WalletCards size={14} />;
  }
};

export default function ContributionsPage() {
  const [activeCycle, setActiveCycle] = useState(null);
  const [contributions, setContributions] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    late: 0,
    totalExpected: 0,
    totalPaid: 0,
    remainingAmount: 0,
    paymentRate: 0,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [filters, setFilters] = useState(defaultFilters);

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lateLoading, setLateLoading] = useState(false);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [payForm, setPayForm] = useState(defaultPayForm);
  const [paySaving, setPaySaving] = useState(false);

  const [actionLoading, setActionLoading] = useState("");

  const currentPeriodLabel = useMemo(() => {
    const date = new Date(Number(filters.year), Number(filters.month) - 1, 1);

    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
  }, [filters.month, filters.year]);

  const fetchActiveCycle = useCallback(async () => {
    try {
      const data = await cycleService.getActiveCycle();
      setActiveCycle(data || null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const data = await contributionService.getStats({
        cycleId: activeCycle?.id || activeCycle?._id || "",
        month: filters.month,
        year: filters.year,
      });

      setStats({
        total: data?.total || 0,
        paid: data?.paid || 0,
        pending: data?.pending || 0,
        late: data?.late || 0,
        totalExpected: data?.totalExpected || 0,
        totalPaid: data?.totalPaid || 0,
        remainingAmount: data?.remainingAmount || 0,
        paymentRate: data?.paymentRate || 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, [activeCycle, filters.month, filters.year]);

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);

      const data = await contributionService.getContributions({
        search: filters.search,
        status: filters.status,
        cycleId: activeCycle?.id || activeCycle?._id || "",
        month: filters.month,
        year: filters.year,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      setContributions(data?.contributions || []);
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
  }, [activeCycle, filters]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchContributions()]);
  }, [fetchStats, fetchContributions]);

  useEffect(() => {
    fetchActiveCycle();
  }, [fetchActiveCycle]);

  useEffect(() => {
    if (activeCycle) {
      refreshAll();
    }
  }, [activeCycle, refreshAll]);

  const statCards = useMemo(
    () => [
      {
        title: "Total cotisations",
        value: stats.total,
        icon: WalletCards,
        tone: "navy",
        description: "Cotisations générées",
      },
      {
        title: "Payées",
        value: stats.paid,
        icon: CheckCircle2,
        tone: "green",
        description: `${stats.paymentRate || 0}% de paiement`,
      },
      {
        title: "En attente",
        value: stats.pending,
        icon: Clock3,
        tone: "warning",
        description: "Non encore payées",
      },
      {
        title: "En retard",
        value: stats.late,
        icon: AlertTriangle,
        tone: "danger",
        description: "À relancer",
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

  const handleGenerateMonth = async () => {
    if (!activeCycle) {
      toast.error("Aucun cycle actif trouvé.");
      return;
    }

    try {
      setGenerating(true);

      const result = await contributionService.generateMonth({
        cycleId: activeCycle.id || activeCycle._id,
        month: filters.month,
        year: filters.year,
      });

      toast.success(
        `${result?.createdCount || 0} cotisation(s) créée(s) pour ${currentPeriodLabel}.`
      );

      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkLate = async () => {
    if (!activeCycle) {
      toast.error("Aucun cycle actif trouvé.");
      return;
    }

    try {
      setLateLoading(true);

      const result = await contributionService.markLate({
        cycleId: activeCycle.id || activeCycle._id,
        month: filters.month,
        year: filters.year,
      });

      toast.success(
        `${result?.updatedCount || 0} cotisation(s) mise(s) en retard.`
      );

      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLateLoading(false);
    }
  };

  const openPayModal = (contribution) => {
    setSelectedContribution(contribution);
    setPayForm({
      amountPaid:
        contribution?.amountExpected ||
        contribution?.member?.contributionAmount ||
        "",
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "cash",
      paymentReference: "",
      notes: "",
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    if (paySaving) return;

    setPayModalOpen(false);
    setSelectedContribution(null);
    setPayForm(defaultPayForm);
  };

  const handlePayFormChange = (key, value) => {
    setPayForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMarkAsPaid = async (event) => {
    event.preventDefault();

    if (!selectedContribution) return;

    if (Number(payForm.amountPaid) <= 0) {
      toast.error("Le montant payé doit être supérieur à 0.");
      return;
    }

    try {
      setPaySaving(true);

      await contributionService.markAsPaid(
        selectedContribution.id || selectedContribution._id,
        payForm
      );

      toast.success("Cotisation marquée comme payée. Email envoyé si configuré.");

      closePayModal();
      await refreshAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPaySaving(false);
    }
  };

  const handleCancelPayment = async (contribution) => {
    const id = contribution?.id || contribution?._id;

    if (!id) return;

    if (!window.confirm("Voulez-vous annuler ce paiement ?")) return;

    try {
      setActionLoading(`cancel-${id}`);

      await contributionService.cancelPayment(id);

      toast.success("Paiement annulé avec succès.");
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

            <h1>Gestion des cotisations</h1>

            <p>
              Générez les cotisations mensuelles, suivez les paiements,
              identifiez les retards et envoyez automatiquement une confirmation
              email lorsqu’un membre paie sa cotisation.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <CalendarDays size={15} />
                Période : {currentPeriodLabel}
              </HeroMetaItem>

              <HeroMetaItem>
                <Users size={15} />
                Cycle : {activeCycle?.name || "Aucun cycle actif"}
              </HeroMetaItem>

              <HeroMetaItem>
                <Mail size={15} />
                Email automatique
              </HeroMetaItem>
            </HeroMeta>
          </HeroText>

          <HeroAction>
            <PrimaryButton
              type="button"
              onClick={handleGenerateMonth}
              disabled={generating || !activeCycle}
            >
              {generating ? <Spinner /> : <Plus size={18} />}
              Générer le mois
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

      <FinanceCard
        as={motion.section}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.42, delay: 0.08 }}
      >
        <FinanceHeader>
          <div>
            <SectionKicker>
              <Banknote size={15} />
              Situation financière
            </SectionKicker>
            <h2>État des encaissements</h2>
          </div>

          <DangerLightButton
            type="button"
            onClick={handleMarkLate}
            disabled={lateLoading || !activeCycle}
          >
            {lateLoading ? <Spinner /> : <AlertTriangle size={17} />}
            Marquer les retards
          </DangerLightButton>
        </FinanceHeader>

        <FinanceGrid>
          <FinanceItem>
            <span>Total attendu</span>
            <strong>{formatCurrency(stats.totalExpected)}</strong>
          </FinanceItem>

          <FinanceItem>
            <span>Total encaissé</span>
            <strong>{formatCurrency(stats.totalPaid)}</strong>
          </FinanceItem>

          <FinanceItem>
            <span>Reste à encaisser</span>
            <strong>{formatCurrency(stats.remainingAmount)}</strong>
          </FinanceItem>

          <FinanceItem>
            <span>Taux de paiement</span>
            <strong>{stats.paymentRate || 0}%</strong>
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
              <h2>Recherche et période</h2>
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
                  handleChangeFilter("month", event.target.value)
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
                  handleChangeFilter("year", event.target.value)
                }
              />
            </InputGroup>
          </FilterGrid>
        </FiltersCard>

        <TableCard>
          <TableHeader>
            <div>
              <SectionKicker>
                <WalletCards size={15} />
                Registre des cotisations
              </SectionKicker>

              <h2>Liste des cotisations</h2>

              <p>
                {pagination.total} cotisation
                {pagination.total > 1 ? "s" : ""} trouvée
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

              <PrimaryButton
                type="button"
                onClick={handleGenerateMonth}
                disabled={generating || !activeCycle}
              >
                {generating ? <Spinner /> : <Plus size={17} />}
                Générer
              </PrimaryButton>
            </HeaderActions>
          </TableHeader>

          <TableScroll>
            <ContributionsTable>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Période</th>
                  <th>Montants</th>
                  <th>Paiement</th>
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
                ) : contributions.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <EmptyState>
                        <WalletCards size={42} />
                        <strong>Aucune cotisation trouvée</strong>
                        <span>
                          Génère les cotisations du mois pour commencer le suivi
                          des paiements.
                        </span>
                        <PrimaryButton
                          type="button"
                          onClick={handleGenerateMonth}
                          disabled={generating || !activeCycle}
                        >
                          <Plus size={17} />
                          Générer les cotisations
                        </PrimaryButton>
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  contributions.map((contribution) => {
                    const id = contribution.id || contribution._id;

                    return (
                      <tr key={id}>
                        <td>
                          <MemberIdentity>
                            <Avatar>
                              {contribution.member?.fullName
                                ?.split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "M"}
                            </Avatar>

                            <div>
                              <strong>
                                {contribution.member?.fullName || "Membre"}
                              </strong>
                              <span>
                                {contribution.member?.telephone ||
                                  contribution.member?.email ||
                                  "Contact non renseigné"}
                              </span>
                            </div>
                          </MemberIdentity>
                        </td>

                        <td>
                          <DateStack>
                            <strong>{contribution.periodLabel}</strong>
                            <span>{contribution.cycle?.name || "Cycle"}</span>
                          </DateStack>
                        </td>

                        <td>
                          <DateStack>
                            <strong>
                              Attendu :{" "}
                              {formatCurrency(contribution.amountExpected)}
                            </strong>
                            <span>
                              Payé : {formatCurrency(contribution.amountPaid)}
                            </span>
                          </DateStack>
                        </td>

                        <td>
                          <DateStack>
                            <strong>
                              {contribution.paymentDate
                                ? formatDate(contribution.paymentDate)
                                : "—"}
                            </strong>
                            <span>
                              {contribution.status === "paid"
                                ? getPaymentMethodLabel(
                                    contribution.paymentMethod
                                  )
                                : "Non payé"}
                            </span>
                          </DateStack>
                        </td>

                        <td>
                          <StatusBadge $status={contribution.status}>
                            {getStatusIcon(contribution.status)}
                            {getStatusLabel(contribution.status)}
                          </StatusBadge>
                        </td>

                        <td>
                          <ActionGroup>
                            {contribution.status !== "paid" ? (
                              <PrimaryMiniButton
                                type="button"
                                onClick={() => openPayModal(contribution)}
                              >
                                <CreditCard size={16} />
                                Payer
                              </PrimaryMiniButton>
                            ) : (
                              <DangerMiniButton
                                type="button"
                                disabled={actionLoading === `cancel-${id}`}
                                onClick={() => handleCancelPayment(contribution)}
                              >
                                {actionLoading === `cancel-${id}` ? (
                                  <Spinner />
                                ) : (
                                  <Undo2 size={16} />
                                )}
                                Annuler
                              </DangerMiniButton>
                            )}
                          </ActionGroup>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </ContributionsTable>
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
        {payModalOpen && selectedContribution && (
          <ModalLayer
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalBackdrop onClick={closePayModal} />

            <ModalCard
              as={motion.form}
              onSubmit={handleMarkAsPaid}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22 }}
            >
              <ModalHeader>
                <div>
                  <SectionKicker>
                    <CreditCard size={15} />
                    Paiement cotisation
                  </SectionKicker>

                  <h2>Marquer comme payé</h2>

                  <p>
                    Une confirmation email sera envoyée automatiquement au
                    membre si le service SMTP est configuré.
                  </p>
                </div>

                <CloseButton type="button" onClick={closePayModal}>
                  <X size={19} />
                </CloseButton>
              </ModalHeader>

              <PaymentSummary>
                <strong>
                  {selectedContribution.member?.fullName || "Membre"}
                </strong>
                <span>
                  {selectedContribution.periodLabel} · Montant attendu :{" "}
                  {formatCurrency(selectedContribution.amountExpected)}
                </span>
              </PaymentSummary>

              <FormGrid>
                <InputGroup>
                  <label>Montant payé *</label>
                  <input
                    type="number"
                    min="0"
                    value={payForm.amountPaid}
                    onChange={(event) =>
                      handlePayFormChange("amountPaid", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Date de paiement</label>
                  <input
                    type="date"
                    value={payForm.paymentDate}
                    onChange={(event) =>
                      handlePayFormChange("paymentDate", event.target.value)
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <label>Mode de paiement</label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(event) =>
                      handlePayFormChange("paymentMethod", event.target.value)
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
                    value={payForm.paymentReference}
                    onChange={(event) =>
                      handlePayFormChange(
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
                    value={payForm.notes}
                    onChange={(event) =>
                      handlePayFormChange("notes", event.target.value)
                    }
                    placeholder="Notes administratives..."
                  />
                </InputGroup>
              </FormGrid>

              <ModalFooter>
                <GhostButton type="button" onClick={closePayModal}>
                  Annuler
                </GhostButton>

                <PrimaryButton type="submit" disabled={paySaving}>
                  {paySaving ? (
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

  @media (max-width: 700px) {
    flex-direction: column;
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

const ContributionsTable = styled.table`
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
  color: ${({ $status }) => {
    if ($status === "paid") return colors.success;
    if ($status === "late") return colors.danger;
    return colors.warning;
  }};
  background: ${({ $status }) => {
    if ($status === "paid") return colors.successSoft;
    if ($status === "late") return colors.dangerSoft;
    return colors.warningSoft;
  }};
`;

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
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

const DangerLightButton = styled(SmallButton)`
  color: ${colors.danger};
  background: ${colors.dangerSoft};
  border-color: rgba(180, 35, 24, 0.22);
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