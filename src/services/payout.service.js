import api from "./api";

export const requestPayoutRequest = async (payload) => {
  const { data } = await api.post("/payouts/member/request", payload);
  return data;
};

export const getPayoutHistoryRequest = async () => {
  const { data } = await api.get("/payouts/member/history");
  return data;
};

export const getAdminPendingPayoutsRequest = async () => {
  const { data } = await api.get("/payouts/admin/pending");
  return data;
};

export const getAdminPayoutDashboardRequest = async () => {
  const { data } = await api.get("/payouts/admin/dashboard");
  return data;
};

export const reviewPayoutRequest = async (id, payload) => {
  const { data } = await api.patch(`/payouts/admin/${id}/review`, payload);
  return data;
};