import axios from "axios";
import config from "../config/config.js";

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
});

apiClient.interceptors.request.use((request) => {
  const token = localStorage.getItem(config.authTokenStorageKey);
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Unexpected network error";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
