import mongoose from "mongoose";

export const QUIZ_STATUS = Object.freeze({
  PENDING: "pending",
  GENERATING: "generating",
  READY: "ready",
  FAILED: "failed",
});

const lessonSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true, trim: true },
    pdfPath: { type: String, required: true },
    originalFileName: { type: String, required: true },
    // Quiz generation now kicks off automatically right after upload (see
    // lesson.controller.js) instead of waiting for a student to request it, so the
    // quiz is ready by the time anyone completes the lesson. This tracks that
    // background job's state for the lessons list UI.
    quizStatus: {
      type: String,
      enum: Object.values(QUIZ_STATUS),
      default: QUIZ_STATUS.PENDING,
    },
    quizError: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
