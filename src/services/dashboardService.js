// src/services/dashboardService.js
import api from "./api";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

export const dashboardService = {
  async getOverview(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/dashboard/overview${queryString}`);
    return response.data?.data;
  },
};

export default dashboardService;