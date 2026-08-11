import apiClient from "./apiClient.js";
import { User } from "../models/User.js";

export const authService = {
  async register({ name, email, password, role }) {
    const { data } = await apiClient.post("/auth/register", { name, email, password, role });
    return { user: User.fromApi(data.data.user), token: data.data.token };
  },

  async login({ email, password }) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return { user: User.fromApi(data.data.user), token: data.data.token };
  },

  async me() {
    const { data } = await apiClient.get("/auth/me");
    return User.fromApi(data.data);
  },

  async changePassword({ currentPassword, newPassword }) {
    await apiClient.patch("/auth/password", { currentPassword, newPassword });
  },
};
