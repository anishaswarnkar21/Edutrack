import apiClient from "./apiClient.js";
import { ClassRoom } from "../models/ClassRoom.js";

export const classService = {
  async create(className) {
    const { data } = await apiClient.post("/classes", { className });
    return ClassRoom.fromApi(data.data);
  },

  async join(joinCode) {
    const { data } = await apiClient.post("/classes/join", { joinCode });
    return ClassRoom.fromApi(data.data);
  },

  async listMine() {
    const { data } = await apiClient.get("/classes");
    return data.data.map(ClassRoom.fromApi);
  },

  async getById(classId) {
    const { data } = await apiClient.get(`/classes/${classId}`);
    return ClassRoom.fromApi(data.data);
  },

  async getRoster(classId) {
    const { data } = await apiClient.get(`/classes/${classId}/students`);
    return data.data;
  },
};
