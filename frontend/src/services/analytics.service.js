import apiClient from "./apiClient.js";

export const analyticsService = {
  async forClass(classId) {
    const { data } = await apiClient.get(`/classes/${classId}/analytics`);
    return data.data;
  },

  async mine() {
    const { data } = await apiClient.get("/analytics/me");
    return data.data;
  },

  async teacherOverview() {
    const { data } = await apiClient.get("/analytics/teacher-overview");
    return data.data;
  },
};
