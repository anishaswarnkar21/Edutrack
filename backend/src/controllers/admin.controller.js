import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { adminService } from "../services/admin.service.js";
import { authService } from "../services/auth.service.js";

export const getOverview = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await adminService.platformOverview()));
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  res.json(new ApiResponse(200, users.map(authService.toPublicUser)));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const user = await adminService.updateUser(req.params.userId, { name, email, role });
  res.json(new ApiResponse(200, authService.toPublicUser(user), "User updated"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.userId, req.user._id);
  res.json(new ApiResponse(200, null, "User deleted"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest("newPassword must be at least 8 characters");
  }
  await adminService.resetPassword(req.params.userId, newPassword);
  res.json(new ApiResponse(200, null, "Password reset"));
});

export const listClasses = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await adminService.listClasses()));
});

export const getClass = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await adminService.getClass(req.params.classId)));
});

export const deleteClass = asyncHandler(async (req, res) => {
  await adminService.deleteClass(req.params.classId);
  res.json(new ApiResponse(200, null, "Class deleted"));
});
