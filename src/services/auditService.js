// src/services/auditService.js
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

export const auditService = {
  async getStats(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/audits/stats${queryString}`);
    return response.data?.data;
  },

  async getModules() {
    const response = await api.get("/audits/modules");
    return response.data?.data || [];
  },

  async getAudits(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/audits${queryString}`);
    return response.data?.data;
  },

  async getAuditById(id) {
    if (!id) {
      throw new Error("Identifiant du journal manquant.");
    }

    const response = await api.get(`/audits/${id}`);
    return response.data?.data;
  },

  async cleanupOldAudits(payload = {}) {
    const response = await api.post("/audits/cleanup", {
      olderThanDays: Number(payload.olderThanDays || 180),
    });

    return response.data?.data;
  },
};

export default auditService;