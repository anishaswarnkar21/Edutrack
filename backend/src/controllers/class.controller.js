import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { classService } from "../services/class.service.js";

export const createClass = asyncHandler(async (req, res) => {
  const { className } = req.body;
  if (!className) throw ApiError.badRequest("className is required");

  const classDoc = await classService.createClass({ className, teacherId: req.user._id });
  res.status(201).json(new ApiResponse(201, classDoc, "Class created"));
});

export const joinClass = asyncHandler(async (req, res) => {
  const { joinCode } = req.body;
  if (!joinCode) throw ApiError.badRequest("joinCode is required");

  const classDoc = await classService.joinClass({ joinCode, studentId: req.user._id });
  res.json(new ApiResponse(200, classDoc, "Joined class"));
});

export const listMyClasses = asyncHandler(async (req, res) => {
  const classes = await classService.listForUser(req.user);
  res.json(new ApiResponse(200, classes));
});

export const getClass = asyncHandler(async (req, res) => {
  const classDoc = await classService.assertMembership(req.params.classId, req.user);
  res.json(new ApiResponse(200, classDoc));
});

export const getRoster = asyncHandler(async (req, res) => {
  await classService.assertMembership(req.params.classId, req.user);
  const roster = await classService.getRoster(req.params.classId);
  res.json(new ApiResponse(200, roster));
});
