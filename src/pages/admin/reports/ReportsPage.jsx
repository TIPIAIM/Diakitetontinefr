// src/pages/admin/reports/ReportsPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  Banknote,
  CalendarDays,
  Crown,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCcw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";

import reportService from "../../../services/reportService";

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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
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

const safeText = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState("");

  const [period, setPeriod] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);

      const data = await reportService.getSummary({
        month: period.month,
        year: period.year,
      });

      setReport(data || null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const cards = useMemo(
    () => [
      {
        title: "Membres actifs",
        value: report?.members?.active || 0,
        icon: Users,
        tone: "navy",
        description: `${report?.members?.total || 0} membre(s) au total`,
      },
      {
        title: "Cotisations payées",
        value: report?.contributions?.paid || 0,
        icon: WalletCards,
        tone: "green",
        description: `${report?.contributions?.paymentRate || 0}% de paiement`,
      },
      {
        title: "Total encaissé",
        value: formatCurrency(report?.contributions?.totalCollected || 0),
        icon: Banknote,
        tone: "gold",
        description: "Cotisations reçues",
      },
      {
        title: "Total distribué",
        value: formatCurrency(report?.payouts?.totalDistributed || 0),
        icon: Crown,
        tone: "warning",
        description: "Bénéficiaires payés",
      },
    ],
    [report]
  );

  const handleExport = async (type) => {
    try {
      setExporting(type);

      await reportService.downloadCsv(type, {
        month: period.month,
        year: period.year,
      });

      toast.success("Export généré avec succès.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting("");
    }
  };

  const buildPrintHtml = () => {
    const recentContributions = report?.recent?.contributions || [];
    const recentPayouts = report?.recent?.payouts || [];

    const contributionRows = recentContributions
      .map(
        (item) => `
          <tr>
            <td>${safeText(item.member?.fullName || "—")}</td>
            <td>${safeText(formatCurrency(item.amountPaid))}</td>
            <td>${safeText(formatDate(item.paymentDate))}</td>
            <td>${safeText(item.paymentMethod || "—")}</td>
          </tr>
        `
      )
      .join("");

    const payoutRows = recentPayouts
      .map(
        (item) => `
          <tr>
            <td>${safeText(item.member?.fullName || "—")}</td>
            <td>${safeText(`Tour ${item.roundNumber}`)}</td>
            <td>${safeText(formatCurrency(item.amountPaid))}</td>
            <td>${safeText(formatDate(item.payoutDate))}</td>
          </tr>
        `
      )
      .join("");

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rapport Tontine</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              color: #132238;
              margin: 0;
              padding: 28px;
              background: #ffffff;
            }
            .header {
              border-bottom: 4px solid #D6A841;
              padding-bottom: 18px;
              margin-bottom: 22px;
            }
            .brand {
              color: #0E2D4F;
              font-size: 26px;
              font-weight: 900;
              margin: 0;
            }
            .subtitle {
              color: #667085;
              margin-top: 6px;
              font-size: 14px;
            }
            .section {
              margin-top: 22px;
              page-break-inside: avoid;
            }
            h2 {
              color: #0E2D4F;
              font-size: 18px;
              margin-bottom: 10px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .card {
              border: 1px solid #d9e2df;
              padding: 12px;
              border-radius: 10px;
              background: #f8faf9;
            }
            .card span {
              display: block;
              color: #667085;
              font-size: 12px;
              text-transform: uppercase;
              font-weight: 700;
            }
            .card strong {
              display: block;
              margin-top: 5px;
              color: #0E2D4F;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 13px;
            }
            th {
              background: #0E2D4F;
              color: white;
              text-align: left;
              padding: 9px;
            }
            td {
              border: 1px solid #e5e7eb;
              padding: 8px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 12px;
              border-top: 1px solid #e5e7eb;
              color: #667085;
              font-size: 12px;
              text-align: center;
            }
            @media print {
              body { padding: 18px; }
              button { display: none; }
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1 class="brand">DIAKITE-TONTINE</h1>
            <div class="subtitle">
              Rapport mensuel de gestion — ${safeText(report?.period?.label || "")}
              <br />
              Généré le ${safeText(formatDate(report?.generatedAt || new Date()))}
            </div>
          </div>

          <div class="section">
            <h2>1. Synthèse générale</h2>
            <div class="grid">
              <div class="card"><span>Cycle actif</span><strong>${safeText(
                report?.cycle?.name || "Aucun"
              )}</strong></div>
              <div class="card"><span>Membres actifs</span><strong>${
                report?.members?.active || 0
              }</strong></div>
              <div class="card"><span>Cotisations payées</span><strong>${
                report?.contributions?.paid || 0
              }</strong></div>
              <div class="card"><span>Total attendu</span><strong>${safeText(
                formatCurrency(report?.contributions?.totalExpected || 0)
              )}</strong></div>
              <div class="card"><span>Total encaissé</span><strong>${safeText(
                formatCurrency(report?.contributions?.totalCollected || 0)
              )}</strong></div>
              <div class="card"><span>Reste à encaisser</span><strong>${safeText(
                formatCurrency(report?.contributions?.remainingToCollect || 0)
              )}</strong></div>
              <div class="card"><span>Total distribué</span><strong>${safeText(
                formatCurrency(report?.payouts?.totalDistributed || 0)
              )}</strong></div>
              <div class="card"><span>Solde théorique</span><strong>${safeText(
                formatCurrency(report?.treasury?.theoreticalBalance || 0)
              )}</strong></div>
              <div class="card"><span>Relances envoyées</span><strong>${
                report?.reminders?.sent || 0
              }</strong></div>
            </div>
          </div>

          <div class="section">
            <h2>2. Dernières cotisations encaissées</h2>
            <table>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                ${
                  contributionRows ||
                  `<tr><td colspan="4">Aucune cotisation récente.</td></tr>`
                }
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>3. Derniers bénéficiaires payés</h2>
            <table>
              <thead>
                <tr>
                  <th>Bénéficiaire</th>
                  <th>Tour</th>
                  <th>Montant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${payoutRows || `<tr><td colspan="4">Aucun bénéficiaire récent.</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="footer">
            Rapport généré automatiquement par DIAKITE-TONTINE.
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintPdf = () => {
    if (!report) {
      toast.error("Aucun rapport à imprimer.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      toast.error("Le navigateur a bloqué l’ouverture de la fenêtre PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPrintHtml());
    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
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

            <h1>Rapports PDF / Excel</h1>

            <p>
              Générez une synthèse mensuelle complète de la tontine, imprimez le
              rapport en PDF et exportez les données en fichiers compatibles
              Excel.
            </p>

            <HeroMeta>
              <HeroMetaItem>
                <CalendarDays size={15} />
                Période : {report?.period?.label || "—"}
              </HeroMetaItem>

              <HeroMetaItem>
                <FileText size={15} />
                PDF imprimable
              </HeroMetaItem>

              <HeroMetaItem>
                <FileSpreadsheet size={15} />
                Export CSV Excel
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

            <PrimaryButton type="button" onClick={fetchReport}>
              {loading ? <Spinner /> : <RefreshCcw size={17} />}
              Actualiser
            </PrimaryButton>

            <GhostButton type="button" onClick={handlePrintPdf}>
              <Printer size={17} />
              PDF
            </GhostButton>
          </HeroAction>
        </HeroContent>

        <StatsGrid>
          {cards.map((card, index) => {
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
                <FileText size={15} />
                Rapport mensuel
              </SectionKicker>
              <h2>Synthèse de la période</h2>
            </div>
          </PanelHeader>

          <FinanceGrid>
            <FinanceItem>
              <span>Cycle actif</span>
              <strong>{report?.cycle?.name || "Aucun"}</strong>
            </FinanceItem>

            <FinanceItem>
              <span>Membres total</span>
              <strong>{report?.members?.total || 0}</strong>
            </FinanceItem>

            <FinanceItem>
              <span>Membres actifs</span>
              <strong>{report?.members?.active || 0}</strong>
            </FinanceItem>

            <FinanceItem>
              <span>Cotisations total</span>
              <strong>{report?.contributions?.total || 0}</strong>
            </FinanceItem>

            <FinanceItem>
              <span>Payées</span>
              <strong>{report?.contributions?.paid || 0}</strong>
            </FinanceItem>

            <FinanceItem>
              <span>En retard</span>
              <strong>{report?.contributions?.late || 0}</strong>
            </FinanceItem>

            <FinanceItem>
              <span>Total attendu</span>
              <strong>
                {formatCurrency(report?.contributions?.totalExpected || 0)}
              </strong>
            </FinanceItem>

            <FinanceItem>
              <span>Total encaissé</span>
              <strong>
                {formatCurrency(report?.contributions?.totalCollected || 0)}
              </strong>
            </FinanceItem>

            <FinanceItem>
              <span>Reste à encaisser</span>
              <strong>
                {formatCurrency(report?.contributions?.remainingToCollect || 0)}
              </strong>
            </FinanceItem>

            <FinanceItem>
              <span>Total distribué</span>
              <strong>
                {formatCurrency(report?.payouts?.totalDistributed || 0)}
              </strong>
            </FinanceItem>

            <FinanceItem>
              <span>Solde théorique</span>
              <strong>
                {formatCurrency(report?.treasury?.theoreticalBalance || 0)}
              </strong>
            </FinanceItem>

            <FinanceItem>
              <span>Relances envoyées</span>
              <strong>{report?.reminders?.sent || 0}</strong>
            </FinanceItem>
          </FinanceGrid>
        </PanelCard>

        <ExportGrid>
          <ExportCard>
            <ExportIcon>
              <FileText size={28} />
            </ExportIcon>

            <div>
              <strong>Rapport PDF</strong>
              <span>
                Génère une version imprimable du rapport mensuel pour sauvegarde
                PDF.
              </span>
            </div>

            <PrimaryButton type="button" onClick={handlePrintPdf}>
              <Printer size={17} />
              Imprimer PDF
            </PrimaryButton>
          </ExportCard>

          <ExportCard>
            <ExportIcon>
              <FileSpreadsheet size={28} />
            </ExportIcon>

            <div>
              <strong>Exports Excel</strong>
              <span>
                Télécharge des fichiers CSV ouvrables directement dans Excel.
              </span>
            </div>

            <ExportButtons>
              {[
                ["summary", "Synthèse"],
                ["members", "Membres"],
                ["contributions", "Cotisations"],
                ["payouts", "Bénéficiaires"],
                ["reminders", "Relances"],
              ].map(([type, label]) => (
                <SmallButton
                  key={type}
                  type="button"
                  onClick={() => handleExport(type)}
                  disabled={exporting === type}
                >
                  {exporting === type ? <Spinner /> : <Download size={15} />}
                  {label}
                </SmallButton>
              ))}
            </ExportButtons>
          </ExportCard>
        </ExportGrid>

        <SplitGrid>
          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <WalletCards size={15} />
                  Dernières cotisations
                </SectionKicker>
                <h2>Paiements encaissés</h2>
              </div>
            </PanelHeader>

            <SimpleList>
              {(report?.recent?.contributions || []).length > 0 ? (
                report.recent.contributions.map((item) => (
                  <SimpleItem key={item.id}>
                    <div>
                      <strong>{item.member?.fullName || "Membre"}</strong>
                      <span>{formatDate(item.paymentDate)}</span>
                    </div>

                    <strong>{formatCurrency(item.amountPaid)}</strong>
                  </SimpleItem>
                ))
              ) : (
                <EmptyBox>Aucune cotisation récente.</EmptyBox>
              )}
            </SimpleList>
          </PanelCard>

          <PanelCard>
            <PanelHeader>
              <div>
                <SectionKicker>
                  <Crown size={15} />
                  Derniers bénéficiaires
                </SectionKicker>
                <h2>Distributions</h2>
              </div>
            </PanelHeader>

            <SimpleList>
              {(report?.recent?.payouts || []).length > 0 ? (
                report.recent.payouts.map((item) => (
                  <SimpleItem key={item.id}>
                    <div>
                      <strong>{item.member?.fullName || "Bénéficiaire"}</strong>
                      <span>
                        Tour {item.roundNumber} · {formatDate(item.payoutDate)}
                      </span>
                    </div>

                    <strong>{formatCurrency(item.amountPaid)}</strong>
                  </SimpleItem>
                ))
              ) : (
                <EmptyBox>Aucun bénéficiaire récent.</EmptyBox>
              )}
            </SimpleList>
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
  box-shadow: 0 14px 32px rgba(214, 168, 65, 0.24);

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
    font-size: clamp(1rem, 1.7vw, 1.45rem);
    margin: 0.22rem 0;
    line-height: 1.15;
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
`;

const FinanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 1100px) {
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

const ExportGrid = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 1rem;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const ExportCard = styled.section`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 0 24px 0 24px;
  box-shadow: 0 18px 50px rgba(14, 45, 79, 0.08);
  padding: 1.1rem;
  display: grid;
  gap: 0.8rem;

  strong {
    color: ${colors.navy};
    font-size: 1.05rem;
  }

  span {
    color: ${colors.muted};
    line-height: 1.55;
  }
`;

const ExportIcon = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 0 18px 0 18px;
  display: grid;
  place-items: center;
  color: ${colors.navy};
  background: ${colors.goldSoft};
`;

const ExportButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
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

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const SimpleList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const SimpleItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0 16px 0 16px;
  border: 1px solid ${colors.border};
  background: rgba(14, 45, 79, 0.025);

  strong {
    color: ${colors.navy};
  }

  span {
    display: block;
    color: ${colors.muted};
    font-size: 0.84rem;
    margin-top: 0.15rem;
  }

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

const EmptyBox = styled.div`
  padding: 1rem;
  border-radius: 0 16px 0 16px;
  background: ${colors.goldSoft};
  color: ${colors.warning};
  font-weight: 800;
  line-height: 1.55;
`;