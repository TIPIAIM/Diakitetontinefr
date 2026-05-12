import api from "./api";

export const registerRequest = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const verifyEmailRequest = async (payload) => {
  const { data } = await api.post("/auth/verify-email", payload);
  return data;
};

export const resendVerificationCodeRequest = async (payload) => {
  const { data } = await api.post("/auth/resend-verification-code", payload);
  return data;
};

export const loginRequest = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const meRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const refreshRequest = async () => {
  const { data } = await api.post("/auth/refresh");
  return data;
};

export const logoutRequest = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};