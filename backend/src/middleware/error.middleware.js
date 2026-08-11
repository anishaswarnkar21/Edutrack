import { ApiError } from "../utils/ApiError.js";
import config from "../config/config.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : err.name === "ValidationError" ? 400 : 500;

  if (!isApiError && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    details: err.details,
    ...(config.env === "development" && statusCode === 500 ? { stack: err.stack } : {}),
  });
}
