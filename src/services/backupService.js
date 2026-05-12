// src/services/backupService.js
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

const getFilenameFromHeaders = (headers = {}, fallback = "backup.json") => {
  const disposition = headers["content-disposition"] || "";

  const match = disposition.match(/filename="(.+)"/);

  return match?.[1] || fallback;
};

export const backupService = {
  async getSnapshot() {
    const response = await api.get("/backups/snapshot");
    return response.data?.data;
  },

  async getHistory(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/backups/history${queryString}`);
    return response.data?.data;
  },

  async exportBackup(params = {}) {
    const queryString = buildQueryString({
      includeAudits: Boolean(params.includeAudits),
    });

    const response = await api.get(`/backups/export${queryString}`, {
      responseType: "blob",
    });

    const filename = getFilenameFromHeaders(
      response.headers,
      "diakite-tontine-backup.json"
    );

    const blob = new Blob([response.data], {
      type: "application/json;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },

  async restoreBackup(payload = {}) {
    const response = await api.post("/backups/restore", {
      confirmation: payload.confirmation || "",
      restoreAudits: Boolean(payload.restoreAudits),
      backup: payload.backup,
      notes: String(payload.notes || "").trim(),
    });

    return response.data?.data;
  },
};

export default backupService;