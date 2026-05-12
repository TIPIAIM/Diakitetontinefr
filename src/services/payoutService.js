// src/services/payoutService.js
import api from "./api";

/**
 * Ton api.js contient déjà :
 * baseURL: http://localhost:2026/api
 *
 * Donc ici on utilise :
 * /payouts
 *
 * Et NON :
 * /api/payouts
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

export const payoutService = {
  async getOverview(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/payouts/overview${queryString}`);
    return response.data?.data;
  },

  async getStats(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/payouts/stats${queryString}`);
    return response.data?.data;
  },

  async getPayouts(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/payouts${queryString}`);
    return response.data?.data;
  },

  async createPayout(payload = {}) {
    const response = await api.post("/payouts", {
      cycleId: payload.cycleId || "",
      memberId: payload.memberId || "",
      amountPaid: Number(payload.amountPaid || 0),
      payoutDate: payload.payoutDate || new Date().toISOString(),
      paymentMethod: payload.paymentMethod || "cash",
      paymentReference: String(payload.paymentReference || "").trim(),
      notes: String(payload.notes || "").trim(),
    });

    return response.data?.data;
  },

  async cancelPayout(id) {
    if (!id) {
      throw new Error("Identifiant du paiement bénéficiaire manquant.");
    }

    const response = await api.post(`/payouts/${id}/cancel`);
    return response.data?.data;
  },
};

export default payoutService;