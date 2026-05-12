// src/services/cycleService.js
import api from "./api";

/**
 * Ton fichier api.js contient déjà :
 * baseURL: http://localhost:2026/api
 *
 * Donc ici on utilise :
 * /cycles
 *
 * Et NON :
 * /api/cycles
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

const cleanCyclePayload = (payload = {}, options = {}) => {
  const { includeMemberIds = false } = options;

  const cleanPayload = {
    name: String(payload.name || "").trim(),
    startDate: payload.startDate || "",
    expectedEndDate: payload.expectedEndDate || "",
    contributionAmount: Number(payload.contributionAmount || 0),
    frequency: payload.frequency || "monthly",
    paymentStartDay: Number(payload.paymentStartDay || 5),
    paymentDeadlineDay: Number(payload.paymentDeadlineDay || 15),
    notes: String(payload.notes || "").trim(),
  };

  /**
   * IMPORTANT :
   * Pour la création, on peut envoyer memberIds.
   * Si memberIds est vide, le backend prend tous les membres actifs.
   *
   * Pour la modification, on évite d’envoyer memberIds vide
   * sauf si tu veux vraiment modifier les membres du cycle.
   */
  if (includeMemberIds) {
    cleanPayload.memberIds = Array.isArray(payload.memberIds)
      ? payload.memberIds
      : [];
  }

  return cleanPayload;
};

export const cycleService = {
  async getStats() {
    const response = await api.get("/cycles/stats");
    return response.data?.data;
  },

  async getActiveCycle() {
    const response = await api.get("/cycles/active");
    return response.data?.data;
  },

  async getCycles(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/cycles${queryString}`);
    return response.data?.data;
  },

  async getCycleById(id) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }

    const response = await api.get(`/cycles/${id}`);
    return response.data?.data;
  },
  async getCycleMembersState(id) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }
  
    const response = await api.get(`/cycles/${id}/members-state`);
    return response.data?.data;
  },
  
  async addMemberToCycle(cycleId, memberId) {
    if (!cycleId || !memberId) {
      throw new Error("Cycle ou membre manquant.");
    }
  
    const response = await api.post(`/cycles/${cycleId}/members/${memberId}`);
    return response.data?.data;
  },
  
  async removeMemberFromCycle(cycleId, memberId) {
    if (!cycleId || !memberId) {
      throw new Error("Cycle ou membre manquant.");
    }
  
    const response = await api.delete(`/cycles/${cycleId}/members/${memberId}`);
    return response.data?.data;
  },
  
  async createCycle(payload) {
    const cleanPayload = cleanCyclePayload(payload, {
      includeMemberIds: true,
    });

    const response = await api.post("/cycles", cleanPayload);
    return response.data?.data;
  },

  async updateCycle(id, payload) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }

    const cleanPayload = cleanCyclePayload(payload, {
      includeMemberIds: Array.isArray(payload.memberIds),
    });

    const response = await api.put(`/cycles/${id}`, cleanPayload);
    return response.data?.data;
  },

  async pauseCycle(id) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }

    const response = await api.post(`/cycles/${id}/pause`);
    return response.data?.data;
  },

  async resumeCycle(id) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }

    const response = await api.post(`/cycles/${id}/resume`);
    return response.data?.data;
  },

  async closeCycle(id) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }

    const response = await api.post(`/cycles/${id}/close`);
    return response.data?.data;
  },

  async restartCycle(id, payload = {}) {
    if (!id) {
      throw new Error("Identifiant du cycle manquant.");
    }

    const response = await api.post(`/cycles/${id}/restart`, payload);
    return response.data?.data;
  },
};

export default cycleService;