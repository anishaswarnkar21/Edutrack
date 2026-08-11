import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import {
  createClass,
  joinClass,
  listMyClasses,
  getClass,
  getRoster,
} from "../controllers/class.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole(ROLES.TEACHER), createClass);
router.post("/join", requireRole(ROLES.STUDENT), joinClass);
router.get("/", listMyClasses);
router.get("/:classId", getClass);
router.get("/:classId/students", requireRole(ROLES.TEACHER), getRoster);

export default router;
