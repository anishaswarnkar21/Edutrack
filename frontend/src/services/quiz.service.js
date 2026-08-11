import apiClient from "./apiClient.js";
import { Quiz } from "../models/Quiz.js";

export const quizService = {
  async getForLesson(lessonId) {
    const { data } = await apiClient.get(`/lessons/${lessonId}/quiz`);
    return Quiz.fromApi(data.data);
  },

  async update(lessonId, questions) {
    const payload = questions.map(({ questionText, options, correctAnswerIndex }) => ({
      questionText,
      options,
      correctAnswerIndex,
    }));
    const { data } = await apiClient.put(`/lessons/${lessonId}/quiz`, { questions: payload });
    return data.data;
  },

  async submit(quizId, answers) {
    const { data } = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
    return data.data;
  },

  async myResultsForClass(classId) {
    const { data } = await apiClient.get(`/classes/${classId}/results`);
    return data.data;
  },
};
