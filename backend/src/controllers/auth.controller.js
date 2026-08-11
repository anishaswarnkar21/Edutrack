import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { authService } from "../services/auth.service.js";
import { ROLES } from "../constants.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw ApiError.badRequest("name, email, password and role are all required");
  }
  if (!Object.values(ROLES).includes(role)) {
    throw ApiError.badRequest(`role must be one of: ${Object.values(ROLES).join(", ")}`);
  }
  if (password.length < 8) {
    throw ApiError.badRequest("password must be at least 8 characters");
  }

  const result = await authService.register({ name, email, password, role });
  res.status(201).json(new ApiResponse(201, result, "Account created"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw ApiError.badRequest("email and password are required");
  }

  const result = await authService.login({ email, password });
  res.json(new ApiResponse(200, result, "Logged in"));
});

export const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, authService.toPublicUser(req.user)));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest("currentPassword and newPassword are required");
  }
  if (newPassword.length < 8) {
    throw ApiError.badRequest("newPassword must be at least 8 characters");
  }

  await authService.changePassword({ userId: req.user._id, currentPassword, newPassword });
  res.json(new ApiResponse(200, null, "Password updated"));
});
