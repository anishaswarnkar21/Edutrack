import mongoose from "mongoose";

// Not in the proposal's ER diagram directly, but required to satisfy scope item 4
// ("students mark a lesson as completed, timestamped") and to feed the analytics
// module's "lessons completed" count per student.
const lessonCompletionSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

lessonCompletionSchema.index({ lesson: 1, student: 1 }, { unique: true });

export default mongoose.model("LessonCompletion", lessonCompletionSchema);
