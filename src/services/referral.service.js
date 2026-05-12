import api from "./api";

export const getReferralOverviewRequest = async () => {
  const { data } = await api.get("/referrals/member/overview");
  return data;
};

export const getReferralListRequest = async () => {
  const { data } = await api.get("/referrals/member/list");
  return data;
};

export const getAdminReferralListRequest = async () => {
  const { data } = await api.get("/referrals/admin/list");
  return data;
};