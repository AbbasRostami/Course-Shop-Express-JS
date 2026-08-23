import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { searchController } from "./search.controller.js";
import { searchSchema } from "./search.validator.js";

const router = Router();

// [GET] Search courses and posts
router.get("/", validate(searchSchema), asyncHandler(searchController));

export default router;