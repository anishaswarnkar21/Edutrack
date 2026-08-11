const config = Object.freeze({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  appName: import.meta.env.VITE_APP_NAME || "EduTrack",
  authTokenStorageKey: "edutrack_token",
  authUserStorageKey: "edutrack_user",
  maxUploadSizeMb: 15,
  quizQuestionCount: 20,
});

export default config;
