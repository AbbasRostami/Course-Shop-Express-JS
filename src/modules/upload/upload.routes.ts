import { Router } from "express";
import { uploadEditorImage } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadEditorImageController } from "./upload.controller.js";

const router = Router();

// [POST] Upload editor image (admin only)
router.post(
  "/editor-image",
  authentication,
  authorize("ADMIN"),
  uploadEditorImage,
  asyncHandler(uploadEditorImageController),
);

export default router;