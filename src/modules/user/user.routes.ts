import { Router } from "express";
import { uploadAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  banUserController,
  deleteAvatarController,
  getBannedUsersController,
  getProfileController,
  getProfileOverviewController,
  getUserByIdController,
  getUsersController,
  unbanUserController,
  updateProfileController,
} from "./user.controller.js";
import {
  banUserSchema,
  getUserByIdSchema,
  listBannedUsersSchema,
  listUsersSchema,
  updateProfileSchema,
} from "./user.validator.js";

const router = Router();

// [MW] All user routes require auth
router.use(authentication);

// [GET] Profile overview
router.get("/profile/overview", asyncHandler(getProfileOverviewController));

// [GET] Get profile
router.get("/profile", asyncHandler(getProfileController));

// [PUT] Update profile with optional avatar upload
router.put(
  "/profile",
  uploadAvatar,
  validate(updateProfileSchema),
  asyncHandler(updateProfileController),
);

// [DELETE] Remove avatar
router.delete("/profile/avatar", asyncHandler(deleteAvatarController));

// [GET] Admin list users
router.get(
  "/",
  authorize("ADMIN"),
  validate(listUsersSchema),
  asyncHandler(getUsersController),
);

// [GET] Admin list banned users
router.get(
  "/blacklist",
  authorize("ADMIN"),
  validate(listBannedUsersSchema),
  asyncHandler(getBannedUsersController),
);

// [GET] Admin get user by ID
router.get(
  "/:id",
  authorize("ADMIN"),
  validate(getUserByIdSchema),
  asyncHandler(getUserByIdController),
);

// [POST] Admin ban user
router.post(
  "/:id/ban",
  authorize("ADMIN"),
  validate(banUserSchema),
  asyncHandler(banUserController),
);

// [DELETE] Admin unban user
router.delete(
  "/:id/ban",
  authorize("ADMIN"),
  validate(banUserSchema),
  asyncHandler(unbanUserController),
);

export default router;