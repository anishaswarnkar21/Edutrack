import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import { recordAttendance, listAttendance } from "../controllers/attendance.controller.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", requireRole(ROLES.TEACHER), recordAttendance);
router.get("/", listAttendance);

export default router;
