import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { classService } from "../services/class.service.js";
import { attendanceService } from "../services/attendance.service.js";

export const recordAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date, records } = req.body;

  await classService.assertMembership(classId, req.user);

  if (!date || !Array.isArray(records) || records.length === 0) {
    throw ApiError.badRequest("date and a non-empty records array are required");
  }

  const saved = await attendanceService.recordSession({ classId, date, records });
  res.status(201).json(new ApiResponse(201, saved, "Attendance recorded"));
});

export const listAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  await classService.assertMembership(classId, req.user);

  const records =
    req.user.role === "teacher"
      ? await attendanceService.listForClass(classId)
      : await attendanceService.listForStudentInClass(classId, req.user._id);

  res.json(new ApiResponse(200, records));
});
