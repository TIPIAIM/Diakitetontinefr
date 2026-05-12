export const getRedirectByRole = (role) => {
    if (role === "admin") return "/admin";
    if (role === "company") return "/company";
    return "/member";
  };