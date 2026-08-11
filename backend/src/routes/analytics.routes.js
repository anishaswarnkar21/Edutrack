import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import {
  getClassAnalytics,
  getMyAnalytics,
  getTeacherOverview,
} from "../controllers/analytics.controller.js";

// Mounted at /api/v1/classes/:classId/analytics
const classAnalyticsRouter = Router({ mergeParams: true });
classAnalyticsRouter.use(requireAuth);
classAnalyticsRouter.get("/", requireRole(ROLES.TEACHER), getClassAnalytics);

// Mounted at /api/v1/analytics
const myAnalyticsRouter = Router();
myAnalyticsRouter.use(requireAuth);
myAnalyticsRouter.get("/me", requireRole(ROLES.STUDENT), getMyAnalytics);
myAnalyticsRouter.get("/teacher-overview", requireRole(ROLES.TEACHER), getTeacherOverview);

export { classAnalyticsRouter, myAnalyticsRouter };
