import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";

// [POST] Upload editor image and return URL
export const uploadEditorImageController: RequestHandler = async (req, res) => {
  if (!req.file) {
    throw new AppError("فایل تصویر ارسال نشده است", 400);
  }

  return res.status(200).json({
    status: "success",
    data: { url: req.file.path },
  });
};
