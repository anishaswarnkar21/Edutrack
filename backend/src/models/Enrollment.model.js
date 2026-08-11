import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, class: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
