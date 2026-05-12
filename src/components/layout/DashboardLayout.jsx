// src/components/layout/DashboardLayout.jsx
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  CalendarDays,
  ChevronRight,
  LogOut,
  Menu,
  RefreshCcw,
  ShieldCheck,
  Activity,
  ArchiveRestore,
  BellRing,
  Crown,
  DatabaseBackup,
  FileText,
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  WalletCards,
  Repeat2,
  CreditCard,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import colors from "../../styles/colors";
import useAuthStore from "../../store/authStore";
import { logoutRequest } from "../../services/auth.service";
import {
  USER_ROLES,
  getRedirectByRole,
  roleLabels,
} from "../../utils/roleRedirect";

const legalHeadingFont = '"Merriweather", "Times New Roman", Georgia, serif';
const uiFont = '"Inter", "Segoe UI", Roboto, Arial, sans-serif';

const adminLinks = [
  {
    label: "Dashboard",
    description: "Vue générale",
    to: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Membres",
    description: "Gestion des membres",
    to: "/members",
    icon: Users,
  },
  {
    label: "Cycles",
    description: "Cycles de tontine",
    to: "/cycles",
    icon: Repeat2,
  },
  {
    label: "Cotisations",
    description: "Paiements mensuels",
    to: "/contributions",
    icon: CreditCard,
  },
  {
    label: "Bénéficiaires",
    description: "Tirages et paiements",
    to: "/payouts",
    icon: Crown,
  },
  {
    label: "Relances",
    description: "Notifications email",
    to: "/reminders",
    icon: BellRing,
  },
  {
    label: "Rapports",
    description: "PDF et exports",
    to: "/reports",
    icon: FileText,
  },
  {
    label: "Paramètres",
    description: "Configuration",
    to: "/settings",
    icon: SlidersHorizontal,
  },
  {
    label: "Audit",
    description: "Journal d’activité",
    to: "/audits",
    icon: Activity,
  },
  {
    label: "Sauvegarde",
    description: "Export et restauration",
    to: "/backups",
    icon: DatabaseBackup,
  },
];

const getInitials = (fullName = "") => {
  const clean = String(fullName || "").trim();

  if (!clean) return "DT";

  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, clearSession } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = useMemo(() => {
    if (user?.role === USER_ROLES.ADMIN) {
      return adminLinks;
    }

    return [];
  }, [user?.role]);

  const activeLink = useMemo(() => {
    return links.find((item) => location.pathname === item.to);
  }, [links, location.pathname]);

  const topbarTitle = activeLink?.label || "Tableau de bord";
  const topbarSubtitle =
    activeLink?.description ||
    "Plateforme de gestion simple et sécurisée de tontine";

  const currentRoleLabel = roleLabels[user?.role] || user?.role || "Compte";

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (_error) {
      // Même si le backend ne répond pas, on vide la session côté frontend.
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  const handleGoHome = () => {
    navigate(getRedirectByRole(user?.role), { replace: true });
    setSidebarOpen(false);
  };

  return (
    <Shell>
      <Sidebar $open={sidebarOpen}>
        <SidebarTop>
          <Brand type="button" onClick={handleGoHome}>
            <BrandLogo>
              <WalletCards size={34} />
            </BrandLogo>

            <BrandText>
              <strong>DIAKITE</strong>
              <span>Gestion de Tontine</span>
            </BrandText>
          </Brand>

          <MobileCloseButton
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </MobileCloseButton>
        </SidebarTop>

        <GoldLine />

        <AdminCard>
          <ShieldCheck size={20} />
          <div>
            <strong>Administration</strong>
            <span>Gestion centralisée de la tontine</span>
          </div>
        </AdminCard>

        <SidebarSectionTitle>
          <span>Navigation</span>
        </SidebarSectionTitle>

        <NavArea>
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavItem
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
              >
                <NavActiveGlow />

                <NavIcon>
                  <Icon size={18} />
                </NavIcon>

                <NavText>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </NavText>

                <NavArrow>
                  <ChevronRight size={16} />
                </NavArrow>
              </NavItem>
            );
          })}
        </NavArea>

        <SidebarFooter>
          <FooterMiniText>
            DIAKITE-TONTINE
            <span>Gestion · Traçabilité · Transparence</span>
          </FooterMiniText>

          <LogoutButton type="button" onClick={handleLogout}>
            <LogOut size={18} />
            Déconnexion
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {sidebarOpen && <MobileOverlay onClick={() => setSidebarOpen(false)} />}

      <Main>
        <Topbar>
          <MenuButton type="button" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </MenuButton>

          <TopbarTitle>
            <strong>{topbarTitle}</strong>
            <span>{topbarSubtitle}</span>
          </TopbarTitle>

          <TopbarUser>
            <TopbarAvatar>{getInitials(user?.fullName)}</TopbarAvatar>

            <TopbarUserText>
              <strong>{user?.fullName || "Administrateur"}</strong>
              <span>{currentRoleLabel}</span>
            </TopbarUserText>
          </TopbarUser>
        </Topbar>

        <Content>
          <Outlet />
        </Content>
      </Main>
    </Shell>
  );
}

const floatSoft = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-2px) scale(1.015);
  }
`;

const activePulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(214, 168, 65, 0.32);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(214, 168, 65, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(214, 168, 65, 0);
  }
`;

const shine = keyframes`
  0% {
    transform: translateX(-130%) skewX(-18deg);
  }

  100% {
    transform: translateX(170%) skewX(-18deg);
  }
`;

const Shell = styled.div`
  height: 100dvh;
  width: 100%;
  background: radial-gradient(
      circle at top right,
      rgba(214, 168, 65, 0.12),
      transparent 34%
    ),
    ${colors.gradientPage || "#f4f7f6"};
  display: grid;
  grid-template-columns: 318px minmax(0, 1fr);
  overflow: hidden;
  font-family: ${uiFont};

  @media (max-width: 1080px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Sidebar = styled.aside`
  height: 100dvh;
  background: linear-gradient(
    180deg,
    ${colors.primary || "#0B5E3C"} 50%,
    ${colors.primaryDark || "#063D2A"} 100%
  );
  color: ${colors.white || "#ffffff"};
  display: grid;
  grid-template-rows: auto auto auto auto minmax(0, 1fr) auto;
  gap: 15px;
  padding: 18px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 60;
  border-right: 1px solid ${colors.white10 || "rgba(255,255,255,0.10)"};
  box-shadow: 18px 0 50px rgba(0, 0, 0, 0.18);

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.white15 || "rgba(255,255,255,0.15)"};
    border-radius: 0 9px 0 9px;
  }

  @media (max-width: 1080px) {
    position: fixed;
    left: 0;
    top: 0;
    width: min(342px, 90vw);
    transform: translateX(${({ $open }) => ($open ? "0" : "-110%")});
    transition: transform 0.25s ease;
    box-shadow: ${colors.shadowXl || "0 24px 80px rgba(0,0,0,0.35)"};
  }

  @media (max-width: 420px) {
    width: 92vw;
    padding: 14px;
  }
`;

const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Brand = styled.button`
  border: 0;
  background: transparent;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  padding: 0;
`;

const BrandLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 0 8px 0 8px;
  background: rgba(255, 255, 255, 0.94);
  display: grid;
  place-items: center;
  color: ${colors.primaryDark || "#063D2A"};
  box-shadow: 0 16px 34px rgba(214, 168, 65, 0.24),
    inset 0 0 0 3px rgba(214, 168, 65, 0.1);
  flex-shrink: 0;
  overflow: hidden;
  animation: ${floatSoft} 4.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const BrandText = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;

  strong {
    font-family: ${legalHeadingFont};
    font-size: 1.18rem;
    letter-spacing: 0.08em;
    color: ${colors.white || "#ffffff"};
    line-height: 1.1;
  }

  span {
    font-size: 0.78rem;
    color: ${colors.offWhite || "#f8fafc"};
    line-height: 1.35;
    opacity: 0.86;
  }
`;

const MobileCloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 0 12px 0 12px;
  border: 1px solid ${colors.white15 || "rgba(255,255,255,0.15)"};
  background: ${colors.white10 || "rgba(255,255,255,0.10)"};
  color: ${colors.white || "#ffffff"};
  display: none;
  place-items: center;
  cursor: pointer;

  @media (max-width: 1080px) {
    display: grid;
  }
`;

const GoldLine = styled.div`
  height: 5px;
  border-radius: 0 9px 0 9px;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    ${colors.accent || "#D6A841"} 0%,
    ${colors.accentLight || "#F7D774"} 50%,
    rgba(255, 255, 255, 0.55) 100%
  );
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
`;

const AdminCard = styled.div`
  padding: 13px;
  border-radius: 0 16px 0 16px;
  background: rgba(255, 255, 255, 0.105);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: flex-start;
  gap: 10px;

  svg {
    color: ${colors.accentLight || "#F7D774"};
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    display: block;
    color: ${colors.white || "#ffffff"};
    font-size: 0.9rem;
    margin-bottom: 2px;
  }

  span {
    display: block;
    color: ${colors.offWhite || "#f8fafc"};
    opacity: 0.82;
    font-size: 0.76rem;
    line-height: 1.4;
  }
`;

const SidebarSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${colors.accentLight || "#F7D774"};
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &::before,
  &::after {
    content: "";
    height: 1px;
    background: ${colors.white15 || "rgba(255,255,255,0.15)"};
    flex: 1;
  }
`;

const NavArea = styled.nav`
  min-height: 0;
  display: grid;
  gap: 10px;
  align-content: start;
  overflow-y: auto;
  padding-right: 3px;

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 0 9px 0 9px;
  }
`;

const NavActiveGlow = styled.span`
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(255, 255, 255, 0.28),
      transparent 24%
    ),
    linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.25) 48%,
      transparent 72%
    );
  transform: translateX(-120%);
`;

const NavIcon = styled.span`
  position: relative;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 0 13px 0 13px;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease;
`;

const NavText = styled.span`
  position: relative;
  z-index: 2;
  display: grid;
  gap: 2px;
  min-width: 0;
  flex: 1;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 0.93rem;
    font-weight: 950;
    line-height: 1.2;
    transition: letter-spacing 0.22s ease;
  }

  span {
    font-size: 0.76rem;
    opacity: 0.82;
    line-height: 1.3;
  }
`;

const NavArrow = styled.span`
  position: relative;
  z-index: 2;
  opacity: 0.58;
  display: grid;
  place-items: center;
  transition: transform 0.22s ease, opacity 0.22s ease;
`;

const NavItem = styled(NavLink)`
  position: relative;
  min-height: 62px;
  padding: 8px 8px;
  border-radius: 0 10px 0 10px;
  color: ${colors.white || "#ffffff"};
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.22s ease, background 0.22s ease,
    border-color 0.22s ease, box-shadow 0.22s ease, color 0.22s ease;
  border: 1px solid ${colors.white10 || "rgba(255,255,255,0.10)"};
  background: rgba(255, 255, 255, 0.055);
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: transparent;
    transition: background 0.22s ease, width 0.22s ease;
    z-index: 1;
  }

  &:hover {
    background: ${colors.white || "#ffffff"};
      color: ${colors.primary || "#ffffff"};

    transform: translateX(5px) translateY(-1px);
     box-shadow: 0 14px 26px rgba(0, 0, 0, 0.13);
  }

  &:hover ${NavActiveGlow} {
    opacity: 1;
    animation: ${shine} 0.78s ease forwards;
  }

  &:hover ${NavIcon} {
    transform: scale(1.08) rotate(-3deg);
    background:${colors.primary10 || "#ffffff"};
  }

  &:hover ${NavArrow} {
    opacity: 1;
    transform: translateX(2px);
  }

  &.active {
    background:${colors.white || "#ffffff"};
    color: ${colors.primaryDark || "#063D2A"};
     box-shadow: 0 16px 34px rgba(214, 168, 65, 0.3);
    transform: translateX(5px);
    animation: ${activePulse} 2.8s ease infinite;
  }

  &.active::before {
    background: ${colors.primary || "#063D2A"};
    width: 6px;
  }

  &.active ${NavIcon} {
    background:${colors.white || "#ffffff"};
    color: ${colors.primaryDark || "#063D2A"};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &:hover {
      transform: none;
    }

    &.active {
      animation: none;
      transform: none;
    }

    &:hover ${NavActiveGlow} {
      animation: none;
    }
  }
`;

const SidebarFooter = styled.div`
  display: grid;
  gap: 12px;
  align-self: end;
  margin-top: auto;
`;

const FooterMiniText = styled.div`
  padding: 12px 13px;
  border-radius: 0 14px 0 14px;
  background: rgba(0, 0, 0, 0.11);
  border: 1px solid ${colors.white10 || "rgba(255,255,255,0.10)"};
  color: ${colors.white || "#ffffff"};
  font-size: 0.78rem;
  font-weight: 900;
  display: grid;
  gap: 3px;

  span {
    color: ${colors.accentLight || "#F7D774"};
    font-size: 0.72rem;
    font-weight: 850;
  }
`;

const LogoutButton = styled.button`
  min-height: 30px;
  border: 0;
  border-radius: 0 14px 0 14px;
  background: linear-gradient(135deg, #b91c1c 50%, #ef4444 50%);
  color: ${colors.white || "#ffffff"};
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(185, 28, 28, 0.2);
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
    box-shadow: 0 18px 36px rgba(185, 28, 28, 0.3);
  }
`;

const Main = styled.main`
  min-width: 0;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
`;

const Topbar = styled.header`
  z-index: 20;
  min-height: 76px;
  padding: 12px clamp(14px, 2vw, 24px);
  background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.96),
      rgba(255, 255, 255, 0.92)
    ),
    radial-gradient(
      circle at top right,
      rgba(214, 168, 65, 0.14),
      transparent 32%
    );
  border-bottom: 1px solid ${colors.border || "#DCE5E1"};
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: ${colors.shadowXs || "0 1px 3px rgba(0,0,0,0.06)"};
  backdrop-filter: blur(14px);
`;

const MenuButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 0 12px 0 12px;
  border: 1px solid ${colors.border || "#DCE5E1"};
  background: ${colors.surface || "#F7FAF8"};
  color: ${colors.primary || "#0B5E3C"};
  display: none;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;

  @media (max-width: 1080px) {
    display: grid;
  }
`;

const TopbarTitle = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
  flex: 1;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-family: ${legalHeadingFont};
    color: ${colors.text || "#17211D"};
    font-size: clamp(1rem, 1.3vw, 1.22rem);
    font-weight: 950;
    line-height: 1.2;
  }

  span {
    color: ${colors.textSecondary || "#5E6B66"};
    font-size: 0.84rem;
  }

  @media (max-width: 520px) {
    span {
      display: none;
    }
  }
`;

const TopbarBadge = styled.div`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 9px;
  border-radius: 0 12px 0 12px;
  background: ${colors.primary05 || "rgba(11, 94, 60, 0.06)"};
  color: ${colors.primary || "#0B5E3C"};
  border: 1px solid ${colors.primary15 || "rgba(11, 94, 60, 0.15)"};
  font-size: 0.68rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  @media (max-width: 520px) {
    display: none;
  }
`;

const TopbarUser = styled.div`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 0 12px 0 12px;
  background: ${colors.surface || "#F7FAF8"};
  border: 1px solid ${colors.border || "#DCE5E1"};
  color: ${colors.text || "#17211D"};
  font-weight: 900;

  @media (max-width: 720px) {
    display: none;
  }
`;

const TopbarAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 0 12px 0 12px;
  background: ${colors.gradientAccent ||
  "linear-gradient(135deg, #D6A841 0%, #F7D774 100%)"};
  color: ${colors.primaryDark || "#063D2A"};
  display: grid;
  place-items: center;
  font-weight: 950;
  flex-shrink: 0;
`;

const TopbarUserText = styled.div`
  display: grid;
  gap: 1px;
  min-width: 0;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 0.86rem;
  }

  span {
    color: ${colors.textSecondary || "#5E6B66"};
    font-size: 0.74rem;
  }
`;

const Content = styled.div`
  min-width: 0;
  min-height: 0;
  width: 100%;
  padding: clamp(14px, 2vw, 24px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;

  @media (max-width: 520px) {
    padding: 12px;
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(3, 18, 13, 0.58);
  backdrop-filter: blur(3px);

  @media (min-width: 1081px) {
    display: none;
  }
`;
