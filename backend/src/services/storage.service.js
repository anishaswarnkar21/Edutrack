import fs from "fs";
import path from "path";
import config from "../config/config.js";

// Thin storage interface so lesson PDFs can move to S3 (or any object store)
// later without touching lesson.service.js or controllers.
export const storageService = {
  absolutePath(relativePath) {
    return path.resolve(config.upload.dir, path.basename(relativePath));
  },

  read(relativePath) {
    return fs.createReadStream(this.absolutePath(relativePath));
  },

  delete(relativePath) {
    const target = this.absolutePath(relativePath);
    if (fs.existsSync(target)) fs.unlinkSync(target);
  },
};
