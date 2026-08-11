import mongoose from "mongoose";
import { ATTENDANCE_STATUS } from "../constants.js";

const attendanceSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: true,
    },
  },
  { timestamps: true }
);

// One attendance record per student per class per session date.
attendanceSchema.index({ class: 1, student: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
