import { Router } from "express";
import authRoutes from "./auth.routes.js";
import classRoutes from "./class.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import lessonRoutes from "./lesson.routes.js";
import lessonDetailRoutes from "./lessonDetail.routes.js";
import quizRoutes from "./quiz.routes.js";
import resultsRoutes from "./results.routes.js";
import adminRoutes from "./admin.routes.js";
import { classAnalyticsRouter, myAnalyticsRouter } from "./analytics.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

router.use("/classes/:classId/attendance", attendanceRoutes);
router.use("/classes/:classId/lessons", lessonRoutes);
router.use("/classes/:classId/analytics", classAnalyticsRouter);
router.use("/classes/:classId/results", resultsRoutes);
router.use("/classes", classRoutes);

router.use("/lessons/:lessonId", lessonDetailRoutes);
router.use("/quizzes/:quizId", quizRoutes);

router.use("/analytics", myAnalyticsRouter);

export default router;
