// src/Styles/colors.js

/**
 * Palette institutionnelle - ERP Tribunal DIXINN
 * Inspiration : identité institutionnelle sobre, professionnelle et gouvernementale
 * Dominantes : vert institutionnel, rouge républicain, jaune d'accent, blanc, gris
 */
//primary
const colors = {
  // =========================
  // COULEURS PRINCIPALES
  // =========================
  primary: "#072C23", // vert institutionnel principal
  primaryDark: "#084C31",
  primaryLight: "#167A51",

  secondary: "#C62828", // rouge institutionnel
  secondaryDark: "#9E1F1F",
  secondaryLight: "#E14B4B",

  accent: "F7D774",// "#D4A017", // jaune doré sobre
  accentDark: "#B38712",
  accentLight: "#F0C64B",

  // =========================
  // COULEURS NEUTRES
  // =========================
  white: "#FFFFFF",
  offWhite: "#F9FBFA",
  snow: "#F4F7F6",

  black: "#111111",
  text: "#1E1E1E",
  textSecondary: "#5F6B66",
  textMuted: "#7E8A85",

  // =========================
  // GRIS PROFESSIONNELS
  // =========================
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // =========================
  // BACKGROUNDS
  // =========================
  background: "#F4F7F6",
  backgroundAlt: "#EEF3F1",
  card: "#FFFFFF",
  surface: "#FAFCFB",
  overlay: "rgba(8, 16, 14, 0.45)",

  // =========================
  // BORDURES
  // =========================
  border: "#DCE5E1",
  borderStrong: "#B8C7C1",
  borderDark: "#8FA39C",

  // =========================
  // ETATS
  // =========================
  success: "#1F8B4C",
  successBg: "#EAF7EF",

  warning: "#C7920A",
  warningBg: "#FFF8E1",

  danger: "#C62828",
  dangerBg: "#FDECEC",

  info: "#1565C0",
  infoBg: "#EAF3FF",

  // =========================
  // COULEURS SPÉCIFIQUES UI
  // =========================
  sidebarBg: "#0A4A30",
  sidebarBgHover: "#0D5A3A",
  sidebarActive: "#0F6A45",

  navbarBg: "#FFFFFF",
  navbarText: "#1E1E1E",

  headerBg: "#FFFFFF",
  footerBg: "#0B5E3C",

  buttonPrimary: "#0B5E3C",
  buttonPrimaryHover: "#084C31",
  buttonSecondary: "#C62828",
  buttonSecondaryHover: "#9E1F1F",

  inputBg: "#FFFFFF",
  inputBorder: "#CCD8D3",
  inputFocus: "#0B5E3C",
  placeholder: "#8A9490",

  // =========================
  // BADGES
  // =========================
  badgePendingBg: "#FFF4D6",
  badgePendingText: "#8A6400",

  badgeApprovedBg: "#E8F7ED",
  badgeApprovedText: "#146C3B",

  badgeRejectedBg: "#FDEAEA",
  badgeRejectedText: "#A61B1B",

  badgeDraftBg: "#EEF2F7",
  badgeDraftText: "#475467",

  // =========================
  // OMBRES
  // =========================
  shadowXs: "0 1px 2px rgba(0, 0, 0, 0.05)",
  shadowSm: "0 4px 10px rgba(11, 94, 60, 0.08)",
  shadowMd: "0 10px 24px rgba(11, 94, 60, 0.12)",
  shadowLg: "0 18px 40px rgba(11, 94, 60, 0.16)",
  shadowXl: "0 28px 60px rgba(11, 94, 60, 0.20)",

  // =========================
  // GRADIENTS
  // =========================
  gradientPrimary: "linear-gradient(135deg, #0B5E3C 0%, #167A51 100%)",
  gradientSecondary: "linear-gradient(135deg, #C62828 0%, #E14B4B 100%)",
  gradientAccent: "linear-gradient(135deg, #D4A017 0%, #F0C64B 100%)",
  gradientPage: "linear-gradient(180deg, #F9FBFA 0%, #EEF3F1 100%)",
  gradientHero: "linear-gradient(135deg, #084C31 80%, #0B5E3C 20%,)",
  gradientRepublic:
    "linear-gradient(90deg, #C62828 0%, #D4A017 50%, #0B5E3C 100%)",

  // =========================
  // TRANSPARENTS
  // =========================
  white05: "rgba(255,255,255,0.05)",
  white10: "rgba(255,255,255,0.10)",
  white15: "rgba(255,255,255,0.15)",
  white20: "rgba(255,255,255,0.20)",

  black05: "rgba(0,0,0,0.05)",
  black10: "rgba(0,0,0,0.10)",
  black15: "rgba(0,0,0,0.15)",
  black20: "rgba(0,0,0,0.20)",

  primary05: "rgba(11, 94, 60, 0.05)",
  primary10: "rgba(11, 94, 60, 0.10)",
  primary15: "rgba(11, 94, 60, 0.15)",
  primary20: "rgba(11, 94, 60, 0.20)",

  secondary05: "rgba(198, 40, 40, 0.05)",
  secondary10: "rgba(198, 40, 40, 0.10)",
  secondary15: "rgba(198, 40, 40, 0.15)",

  accent10: "rgba(212, 160, 23, 0.10)",
  accent15: "rgba(212, 160, 23, 0.15)",
  accent20: "rgba(212, 160, 23, 0.20)",

  // =========================
  // ALIAS RAPIDES
  // =========================
  green: "#0B5E3C",
  red: "#C62828",
  yellow: "#D4A017",
  bg: "#F4F7F6",
  bgCard: "#FFFFFF",
  line: "#DCE5E1",
};

export const theme = {
  colors,
  radius: {
    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
    pill: "999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    section: "32px",
  },
  transition: {
    fast: "0.2s ease",
    normal: "0.3s ease",
    slow: "0.45s ease",
  },
};

export default colors;
