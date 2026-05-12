// src/services/reminderService.js
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

export const reminderService = {
  async getStats(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/reminders/stats${queryString}`);
    return response.data?.data;
  },

  async getTargets(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/reminders/targets${queryString}`);
    return response.data?.data;
  },

  async getReminders(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/reminders${queryString}`);
    return response.data?.data;
  },

  async sendOne(payload = {}) {
    const response = await api.post("/reminders/send", {
      contributionId: payload.contributionId || "",
      type: payload.type || "manual",
      customMessage: String(payload.customMessage || "").trim(),
      force: Boolean(payload.force),
    });

    return response.data?.data;
  },

  async sendBulk(payload = {}) {
    const response = await api.post("/reminders/send-bulk", {
      cycleId: payload.cycleId || "",
      status: payload.status || "pending",
      month: Number(payload.month),
      year: Number(payload.year),
      type: payload.type || payload.status || "pending",
      customMessage: String(payload.customMessage || "").trim(),
      force: Boolean(payload.force),
    });

    return response.data?.data;
  },
};

export default reminderService;