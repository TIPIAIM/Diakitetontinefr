// src/services/reportService.js
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

export const reportService = {
  async getSummary(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/reports/summary${queryString}`);
    return response.data?.data;
  },

  async downloadCsv(type, params = {}) {
    const queryString = buildQueryString({
      ...params,
      type,
    });

    const response = await api.get(`/reports/export${queryString}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${type || "rapport"}-${params.month || ""}-${
      params.year || ""
    }.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },
};

export default reportService;