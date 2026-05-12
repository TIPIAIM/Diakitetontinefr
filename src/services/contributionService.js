// src/services/contributionService.js
import api from "./api";

/**
 * Ton api.js contient déjà :
 * baseURL: http://localhost:2026/api
 *
 * Donc ici on utilise :
 * /contributions
 *
 * Et NON :
 * /api/contributions
 */

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

export const contributionService = {
  async getStats(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/contributions/stats${queryString}`);
    return response.data?.data;
  },

  async getContributions(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/contributions${queryString}`);
    return response.data?.data;
  },

  async generateMonth(payload = {}) {
    const response = await api.post("/contributions/generate-month", {
      cycleId: payload.cycleId || "",
      month: Number(payload.month),
      year: Number(payload.year),
    });

    return response.data?.data;
  },

  async markLate(payload = {}) {
    const response = await api.post("/contributions/mark-late", {
      cycleId: payload.cycleId || "",
      month: Number(payload.month),
      year: Number(payload.year),
    });

    return response.data?.data;
  },

  async markAsPaid(id, payload = {}) {
    if (!id) {
      throw new Error("Identifiant de la cotisation manquant.");
    }

    const response = await api.post(`/contributions/${id}/mark-paid`, {
      amountPaid: Number(payload.amountPaid || 0),
      paymentDate: payload.paymentDate || new Date().toISOString(),
      paymentMethod: payload.paymentMethod || "cash",
      paymentReference: String(payload.paymentReference || "").trim(),
      notes: String(payload.notes || "").trim(),
    });

    return response.data?.data;
  },

  async cancelPayment(id) {
    if (!id) {
      throw new Error("Identifiant de la cotisation manquant.");
    }

    const response = await api.post(`/contributions/${id}/cancel-payment`);
    return response.data?.data;
  },
};

export default contributionService;