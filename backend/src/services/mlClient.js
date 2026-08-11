import axios from "axios";
import config from "../config/config.js";
import { ApiError } from "../utils/ApiError.js";

const client = axios.create({
  baseURL: config.mlService.baseUrl,
  timeout: config.mlService.timeoutMs,
});

export const mlClient = {
  // Contract with ML/app/main.py: POST /generate-quiz
  // body    { lessonText: string, numQuestions: number }
  // returns { questions: [{ questionText, options: string[4], correctAnswerIndex }] }
  async generateQuiz({ lessonText, numQuestions }) {
    try {
      const { data } = await client.post("/generate-quiz", { lessonText, numQuestions });
      return data.questions;
    } catch (err) {
      if (err.response) {
        const detail = err.response.data?.detail || err.response.status;
        throw new ApiError(
          502,
          `ML service returned an error: ${detail}`
        );
      }
      throw new ApiError(504, "ML service is unreachable or timed out");
    }
  },
};
