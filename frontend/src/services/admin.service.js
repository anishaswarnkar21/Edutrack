import apiClient from "./apiClient.js";

export const adminService = {
  async overview() {
    const { data } = await apiClient.get("/admin/overview");
    return data.data;
  },

  async listUsers() {
    const { data } = await apiClient.get("/admin/users");
    return data.data;
  },

  async updateUser(userId, { name, email, role }) {
    const { data } = await apiClient.patch(`/admin/users/${userId}`, { name, email, role });
    return data.data;
  },

  async deleteUser(userId) {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  async resetPassword(userId, newPassword) {
    await apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword });
  },

  async listClasses() {
    const { data } = await apiClient.get("/admin/classes");
    return data.data;
  },

  async getClass(classId) {
    const { data } = await apiClient.get(`/admin/classes/${classId}`);
    return data.data;
  },

  async deleteClass(classId) {
    await apiClient.delete(`/admin/classes/${classId}`);
  },
};
