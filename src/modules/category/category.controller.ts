import { RequestHandler } from "express";
import { categoryService } from "./category.service.js";
import { ListCategoriesAdminQuery } from "./category.validator.js";

// [POST] Create category
export const createCategoryController: RequestHandler = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      message: "دسته بندی با موفقیت ایجاد شد",
      category,
    },
  });
};

// [GET] Public list categories
export const getPublicCategoriesController: RequestHandler = async (req, res) => {
  const categories = await categoryService.getPublicCategories();

  return res.status(200).json({
    status: "success",
    data: {
      categories,
      total: categories.length,
    },
  });
};

// [GET] Admin list categories with pagination
export const getAdminCategoriesController: RequestHandler = async (req, res) => {
  const result = await categoryService.getAdminCategories(
    req.query as ListCategoriesAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

// [GET] Get category by slug
export const getCategoryBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const category = await categoryService.getCategoryBySlug(slug);

  return res.status(200).json({
    status: "success",
    data: { category },
  });
};

// [PUT] Update category
export const updateCategoryController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const category = await categoryService.updateCategory(id, req.body);

  return res.status(200).json({
    status: "success",
    data: {
      message: "دسته بندی با موفقیت ویرایش شد",
      category,
    },
  });
};

// [PATCH] Toggle category visibility
export const toggleVisibilityController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { show } = req.body;

  await categoryService.toggleVisibility(id, show);

  return res.status(200).json({
    status: "success",
    data: {
      message: show
        ? "دسته بندی با موفقیت فعال شد. برای انتشار دوره‌ها، آن‌ها را به صورت جداگانه فعالسازی کنید."
        : "دسته بندی با موفقیت غیرفعال شد. دوره‌ها و پست‌های وابسته نیز غیرفعال شدند.",
    },
  });
};

// [DELETE] Delete category
export const deleteCategoryController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await categoryService.deleteCategory(id);

  return res.status(200).json({
    status: "success",
    data: { message: "دسته بندی با موفقیت حذف شد" },
  });
};