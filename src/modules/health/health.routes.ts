import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { healthCheckController, pingController } from "./health.controller.js";

const router = Router();

// [GET] Full health check
router.get("/", asyncHandler(healthCheckController));

// [HEAD] Lightweight health check
router.head("/", asyncHandler(healthCheckController));

// [GET] Simple ping
router.get("/ping", pingController);

export default router;