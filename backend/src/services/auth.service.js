import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export const authService = {
  async register({ name, email, password, role }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hashed, role });

    return {
      user: this.toPublicUser(user),
      token: signAccessToken(user),
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return {
      user: this.toPublicUser(user),
      token: signAccessToken(user),
    };
  },

  async changePassword({ userId, currentPassword, newPassword }) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw ApiError.notFound("User not found");

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) throw ApiError.unauthorized("Current password is incorrect");

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
  },

  toPublicUser(user) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
