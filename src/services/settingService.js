// src/services/settingService.js
import api from "./api";

export const settingService = {
  async getSettings() {
    const response = await api.get("/settings");
    return response.data?.data;
  },

  async updateSettings(payload = {}) {
    const response = await api.put("/settings", {
      appName: String(payload.appName || "").trim(),
      organizationName: String(payload.organizationName || "").trim(),
      currency: String(payload.currency || "GNF").trim().toUpperCase(),

      defaultContributionAmount: Number(
        payload.defaultContributionAmount || 0
      ),

      defaultFrequency: payload.defaultFrequency || "monthly",

      defaultPaymentStartDay: Number(payload.defaultPaymentStartDay || 5),
      defaultPaymentDeadlineDay: Number(
        payload.defaultPaymentDeadlineDay || 15
      ),

      emailNotificationsEnabled: Boolean(payload.emailNotificationsEnabled),

      contributionPaymentEmailEnabled: Boolean(
        payload.contributionPaymentEmailEnabled
      ),

      payoutPaymentEmailEnabled: Boolean(payload.payoutPaymentEmailEnabled),

      reminderEmailEnabled: Boolean(payload.reminderEmailEnabled),

      reminderCooldownHours: Number(payload.reminderCooldownHours || 12),

      autoMarkLateEnabled: Boolean(payload.autoMarkLateEnabled),

      contactEmail: String(payload.contactEmail || "").trim(),
      contactPhone: String(payload.contactPhone || "").trim(),
      address: String(payload.address || "").trim(),
      reportFooterNote: String(payload.reportFooterNote || "").trim(),
      notes: String(payload.notes || "").trim(),
    });

    return response.data?.data;
  },

  async resetSettings() {
    const response = await api.post("/settings/reset");
    return response.data?.data;
  },
};

export default settingService;