import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import config from "../config/config.js";
import { ApiError } from "../utils/ApiError.js";

fs.mkdirSync(config.upload.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.upload.dir),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

function pdfOnly(_req, file, cb) {
  if (file.mimetype !== "application/pdf") {
    return cb(ApiError.badRequest("Only PDF files are accepted"));
  }
  cb(null, true);
}

export const uploadLessonPdf = multer({
  storage,
  fileFilter: pdfOnly,
  limits: { fileSize: config.upload.maxSizeBytes },
});
