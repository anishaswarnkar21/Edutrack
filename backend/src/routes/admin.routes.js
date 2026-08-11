import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants.js";
import {
  getOverview,
  listUsers,
  updateUser,
  deleteUser,
  resetPassword,
  listClasses,
  getClass,
  deleteClass,
} from "../controllers/admin.controller.js";

// Mounted at /api/v1/admin - every route here is admin-only.
const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/overview", getOverview);

router.get("/users", listUsers);
router.patch("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.post("/users/:userId/reset-password", resetPassword);

router.get("/classes", listClasses);
router.get("/classes/:classId", getClass);
router.delete("/classes/:classId", deleteClass);

export default router;
