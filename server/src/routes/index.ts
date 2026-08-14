import { Router } from "express";

import authRoutes from "./auth.routes.js";
import patientsRoutes from "./patients.routes.js";
import visitsRoutes from "./visits.routes.js";
import triageRoutes from "./triage.routes.js";
import queueRoutes from "./queue.routes.js";
import departmentsRoutes from "./departments.routes.js";
import alertsRoutes from "./alerts.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/patients", patientsRoutes);
router.use("/visits", visitsRoutes);
router.use("/triage", triageRoutes);
router.use("/queue", queueRoutes);
router.use("/departments", departmentsRoutes);
router.use("/alerts", alertsRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
