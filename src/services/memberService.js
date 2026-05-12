// src/services/memberService.js
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

export const memberService = {
  async getStats() {
    const response = await api.get("/members/stats");
    return response.data?.data;
  },

  async getMembers(params = {}) {
    const queryString = buildQueryString(params);
    const response = await api.get(`/members${queryString}`);
    return response.data?.data;
  },

  async getMemberById(id) {
    const response = await api.get(`/members/${id}`);
    return response.data?.data;
  },

  async createMember(payload) {
    const response = await api.post("/members", payload);
    return response.data?.data;
  },

  async updateMember(id, payload) {
    const response = await api.put(`/members/${id}`, payload);
    return response.data?.data;
  },

  async deleteMember(id) {
    const response = await api.delete(`/members/${id}`);
    return response.data?.data;
  },
};

export default memberService;
