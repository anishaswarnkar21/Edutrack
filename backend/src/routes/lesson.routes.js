import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import { uploadLessonPdf } from "../middleware/upload.middleware.js";
import { uploadLesson, listLessons } from "../controllers/lesson.controller.js";

// Mounted at /api/v1/classes/:classId/lessons
const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", requireRole(ROLES.TEACHER), uploadLessonPdf.single("file"), uploadLesson);
router.get("/", listLessons);

export default router;
