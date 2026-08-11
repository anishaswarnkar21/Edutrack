import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import { uploadLessonPdf } from "../middleware/upload.middleware.js";
import {
  getLesson,
  completeLesson,
  downloadLessonFile,
  updateLesson,
  deleteLesson,
  regenerateQuiz,
} from "../controllers/lesson.controller.js";
import { getQuizForLesson, updateQuizForLesson } from "../controllers/quiz.controller.js";

// Mounted at /api/v1/lessons/:lessonId
const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", getLesson);
router.get("/file", downloadLessonFile);
router.patch("/", requireRole(ROLES.TEACHER), uploadLessonPdf.single("file"), updateLesson);
router.delete("/", requireRole(ROLES.TEACHER), deleteLesson);
router.post("/regenerate-quiz", requireRole(ROLES.TEACHER), regenerateQuiz);
router.post("/complete", requireRole(ROLES.STUDENT), completeLesson);
router.get("/quiz", getQuizForLesson);
router.put("/quiz", requireRole(ROLES.TEACHER), updateQuizForLesson);

export default router;
