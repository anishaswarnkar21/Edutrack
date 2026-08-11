import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src/config -> backend/
const backendRoot = path.resolve(__dirname, "..", "..");

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = Object.freeze({
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,

  mongo: Object.freeze({
    uri: required("MONGO_URI", "mongodb://127.0.0.1:27017/edutrack"),
  }),

  jwt: Object.freeze({
    secret: required("JWT_SECRET", "dev-only-insecure-secret"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  }),

  cors: Object.freeze({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),

  upload: Object.freeze({
    // Local-disk storage for lesson PDFs. Kept behind this single config block
    // (and storage.service.js) so swapping to S3 later doesn't touch business logic.
    dir: path.resolve(backendRoot, process.env.UPLOAD_DIR || "uploads"),
    maxSizeBytes: (Number(process.env.MAX_UPLOAD_MB) || 15) * 1024 * 1024,
  }),

  mlService: Object.freeze({
    // AI-Powered Quiz Generation module talks to the ML/ FastAPI microservice
    // over HTTP rather than in-process, so the Hugging Face model can be
    // fine-tuned/redeployed independently of the Node backend.
    baseUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
    timeoutMs: Number(process.env.ML_REQUEST_TIMEOUT_MS) || 20000,
  }),

  quiz: Object.freeze({
    questionCount: Number(process.env.QUIZ_QUESTION_COUNT) || 20,
  }),
});

export default config;
