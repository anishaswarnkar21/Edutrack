import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, unique: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
