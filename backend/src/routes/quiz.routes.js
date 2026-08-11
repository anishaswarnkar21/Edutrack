import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import { submitQuiz } from "../controllers/quiz.controller.js";

// Mounted at /api/v1/quizzes/:quizId
const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post("/submit", requireRole(ROLES.STUDENT), submitQuiz);

export default router;
