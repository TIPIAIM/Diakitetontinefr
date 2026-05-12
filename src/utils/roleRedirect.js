// src/utils/roleRedirect.js

export const USER_ROLES = {
  ADMIN: "admin",
};

export const roleLabels = {
  [USER_ROLES.ADMIN]: "Administrateur",
};

export const roleDescriptions = {
  [USER_ROLES.ADMIN]: "Gestion complète de la tontine",
};

export const getRedirectByRole = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return "/admin";
  }

  return "/login";
};

export default getRedirectByRole;