import apiClient from "./apiClient.js";
import { Lesson } from "../models/Lesson.js";

export const lessonService = {
  async upload(classId, { title, file }) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const { data } = await apiClient.post(`/classes/${classId}/lessons`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return Lesson.fromApi(data.data);
  },

  async listForClass(classId) {
    const { data } = await apiClient.get(`/classes/${classId}/lessons`);
    return data.data.map(Lesson.fromApi);
  },

  async getById(lessonId) {
    const { data } = await apiClient.get(`/lessons/${lessonId}`);
    return Lesson.fromApi(data.data);
  },

  async markComplete(lessonId) {
    const { data } = await apiClient.post(`/lessons/${lessonId}/complete`);
    return data.data;
  },

  async update(lessonId, { title, file }) {
    const formData = new FormData();
    if (title) formData.append("title", title);
    if (file) formData.append("file", file);

    const { data } = await apiClient.patch(`/lessons/${lessonId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return Lesson.fromApi(data.data);
  },

  async remove(lessonId) {
    await apiClient.delete(`/lessons/${lessonId}`);
  },

  async regenerateQuiz(lessonId) {
    await apiClient.post(`/lessons/${lessonId}/regenerate-quiz`);
  },

  // The PDF endpoint is behind the same JWT auth as everything else, so it can't
  // be linked to directly (no way to attach the Authorization header to an <a>
  // click) - fetch it as a blob and hand back an object URL instead.
  async fetchFileObjectUrl(lessonId) {
    const { data } = await apiClient.get(`/lessons/${lessonId}/file`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  },
};
