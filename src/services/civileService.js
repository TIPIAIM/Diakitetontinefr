import api from "./api";

const getFilenameFromDisposition = (disposition, fallback = "document") => {
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return fallback;
};

const saveBlobFile = (blob, fileName = "document") => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

const openBlobPreview = (blob) => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60000);
};

export const civileService = {
  async createCivile(payload) {
    const { data } = await api.post("/civiles", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async getCiviles(params = {}) {
    const { data } = await api.get("/civiles", { params });
    return data;
  },

  async getCivilesAnalytics(params = {}) {
    const { data } = await api.get("/civiles/analytics/overview", {
      params,
    });
    return data;
  },

  async getCivileById(id) {
    const { data } = await api.get(`/civiles/${id}`);
    return data;
  },

  async updateCivile(id, payload) {
    const { data } = await api.put(`/civiles/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async deleteCivile(id) {
    const { data } = await api.delete(`/civiles/${id}`);
    return data;
  },

  async previewPiece(id, field) {
    const response = await api.get(`/civiles/${id}/files/${field}/view`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });

    openBlobPreview(blob);
    return true;
  },

  async downloadPiece(id, field, fallbackName = "document") {
    const response = await api.get(`/civiles/${id}/files/${field}/download`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });

    const fileName = getFilenameFromDisposition(
      response.headers["content-disposition"],
      fallbackName
    );

    saveBlobFile(blob, fileName);
    return true;
  },
};