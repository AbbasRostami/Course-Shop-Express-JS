import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { maskFields, maskItem } from "../../utils/mask.js";
import { userService } from "./user.service.js";
import { ListBannedUsersQuery, ListUsersQuery } from "./user.validator.js";

export const getProfileController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const profile = await userService.getProfile(userId);

  return res.status(200).json({
    status: "success",
    data: {
      profile,
    },
  });
};

export const updateProfileController: RequestHandler = async (
  req,
  res,
  next,
) => {
  const userId = req.user!.id;

  const updateData: { name?: string; phone?: string; avatar?: string } = {};

  if (req.body.name !== undefined) {
    updateData.name = req.body.name;
  }

  if (req.body.phone !== undefined) {
    updateData.phone = req.body.phone;
  }

  if (req.file?.path) {
    updateData.avatar = req.file.path;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("حداقل یک فیلد برای ویرایش ارسال کنید", 400));
  }

  const updatedProfile = await userService.updateProfile(userId, updateData);

  return res.status(200).json({
    status: "success",
    data: {
      message: "پروفایل شما با موفقیت به‌روزرسانی شد",
      profile: updatedProfile,
    },
  });
};

export const deleteAvatarController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  await userService.deleteAvatar(userId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "تصویر پروفایل شما با موفقیت حذف شد",
    },
  });
};

export const getProfileOverviewController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const overview = await userService.getProfileOverview(userId);

  return res.status(200).json({
    status: "success",
    data: { overview },
  });
};

export const getUsersController: RequestHandler = async (req, res) => {
  const result = await userService.getUsers(req.query as ListUsersQuery);

  const maskedItems = maskFields(result.items, ["email", "phone"]);

  return res.status(200).json({
    status: "success",
    data: {
      ...result,
      items: maskedItems,
    },
  });
};

export const getUserByIdController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const user = await userService.getUserById(id);

  const maskedUser = maskItem(user, ["email", "phone"]);

  return res.status(200).json({
    status: "success",
    data: { user: maskedUser },
  });
};

export const getBannedUsersController: RequestHandler = async (req, res) => {
  const result = await userService.getBannedUsers(
    req.query as ListBannedUsersQuery,
  );

  const maskedItems = maskFields(result.items, ["email"]);

  return res.status(200).json({
    status: "success",
    data: {
      ...result,
      items: maskedItems,
    },
  });
};

export const banUserController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const currentUserId = req.user!.id;

  await userService.banUser(id, currentUserId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "کاربر با موفقیت مسدود شد",
    },
  });
};

export const unbanUserController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;

  await userService.unbanUser(id);

  return res.status(200).json({
    status: "success",
    data: {
      message: "کاربر با موفقیت رفع مسدودیت شد",
    },
  });
};
