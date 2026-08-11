import { ApiError } from "../utils/ApiError.js";

export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Requires role: ${allowedRoles.join(" or ")}`));
  }
  next();
};
