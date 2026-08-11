import Attendance from "../models/Attendance.model.js";
import { ATTENDANCE_STATUS } from "../constants.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const attendanceService = {
  async recordSession({ classId, date, records }) {
    const sessionDate = startOfDay(date);

    const ops = records.map(({ studentId, status }) => ({
      updateOne: {
        filter: { class: classId, student: studentId, date: sessionDate },
        update: { $set: { status } },
        upsert: true,
      },
    }));

    if (ops.length) await Attendance.bulkWrite(ops);

    return Attendance.find({ class: classId, date: sessionDate }).populate(
      "student",
      "name email"
    );
  },

  async listForClass(classId) {
    return Attendance.find({ class: classId }).sort({ date: -1 }).populate("student", "name email");
  },

  async listForStudentInClass(classId, studentId) {
    return Attendance.find({ class: classId, student: studentId }).sort({ date: -1 });
  },

  async summaryForStudent(classId, studentId) {
    const records = await this.listForStudentInClass(classId, studentId);
    const total = records.length;
    const present = records.filter(
      (r) => r.status === ATTENDANCE_STATUS.PRESENT || r.status === ATTENDANCE_STATUS.LATE
    ).length;

    return {
      totalSessions: total,
      presentCount: present,
      attendancePercentage: total === 0 ? 0 : Math.round((present / total) * 1000) / 10,
    };
  },
};
