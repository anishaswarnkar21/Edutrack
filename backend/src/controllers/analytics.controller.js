import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { classService } from "../services/class.service.js";
import { analyticsService } from "../services/analytics.service.js";

export const getClassAnalytics = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  await classService.assertMembership(classId, req.user);

  const breakdown = await analyticsService.forClass(classId);
  res.json(new ApiResponse(200, breakdown));
});

export const getMyAnalytics = asyncHandler(async (req, res) => {
  const breakdown = await analyticsService.forStudentAcrossClasses(req.user._id);
  res.json(new ApiResponse(200, breakdown));
});

export const getTeacherOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.forTeacherOverview(req.user._id);
  res.json(new ApiResponse(200, overview));
});
