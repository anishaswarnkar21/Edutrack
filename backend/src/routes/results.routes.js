import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import { listMyResultsForClass } from "../controllers/quiz.controller.js";

// Mounted at /api/v1/classes/:classId/results
const router = Router({ mergeParams: true });

router.use(requireAuth);
router.get("/", requireRole(ROLES.STUDENT), listMyResultsForClass);

export default router;
