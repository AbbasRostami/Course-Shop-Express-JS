import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import { AppError } from "../utils/AppError.js";
import { cloudinary } from "./cloudinary.js";

// [UPLOAD] Cloudinary storage factory
const createCloudinaryStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
      folder: `${process.env.CLOUDINARY_BASE_FOLDER || "course-shop"}/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
      public_id: `${folder}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }),
  });

// [UPLOAD] Image file filter
const imageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  // [ERROR] Reject invalid image type
  cb(
    new AppError(
      "تنها فایل‌های تصویری با فرمت JPG, JPEG, PNG و WEBP مجاز هستند",
      400,
    ),
  );
};

// [UPLOAD] Avatar uploader
export const uploadAvatar = multer({
  storage: createCloudinaryStorage("avatars"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("avatar");

// [UPLOAD] Course image uploader
export const uploadCourseImage = multer({
  storage: createCloudinaryStorage("courses"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("image");

// [UPLOAD] Post image uploader
export const uploadPostImage = multer({
  storage: createCloudinaryStorage("posts"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("image");

// [UPLOAD] Editor image uploader
export const uploadEditorImage = multer({
  storage: createCloudinaryStorage("editor"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("image");

// [UPLOAD] Teacher avatar uploader
export const uploadTeacherAvatar = multer({
  storage: createCloudinaryStorage("teachers"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single("avatar");
