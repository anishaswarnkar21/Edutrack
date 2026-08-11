import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { ApiError } from "../utils/ApiError.js";

export const pdfService = {
  async extractText(absolutePath) {
    const buffer = await fs.readFile(absolutePath);
    const { text } = await pdfParse(buffer);

    // Collapse horizontal whitespace only and keep newlines - the ML service's
    // junk-filtering (table-of-contents lines, page numbers, section headings)
    // works line-by-line and needs those line breaks. Flattening everything to
    // a single space (the old behavior) glued TOC/heading junk directly onto
    // real sentences with no boundary to detect, which produced bad questions.
    const cleaned = text
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!cleaned) {
      throw ApiError.badRequest(
        "Could not extract any text from this PDF (it may be scanned/image-only)"
      );
    }
    return cleaned;
  },
};
