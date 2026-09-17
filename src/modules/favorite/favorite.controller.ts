import { RequestHandler } from "express";
import { localizePayload } from "../../utils/localize.js";
import { favoriteService } from "./favorite.service.js";
import { ListFavoritesQuery } from "./favorite.validator.js";

// [POST] Toggle course favorite
export const toggleCourseFavoriteController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const courseId = req.params.courseId as string;

  const result = await favoriteService.toggleCourseFavorite(userId, courseId);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      isFavorite: result.isFavorite,
    },
  });
};

// [GET] Get my course favorites
export const getMyCourseFavoritesController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;

  const result = await favoriteService.getMyCourseFavorites(
    userId,
    req.query as ListFavoritesQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [POST] Toggle post favorite
export const togglePostFavoriteController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const postId = req.params.postId as string;

  const result = await favoriteService.togglePostFavorite(userId, postId);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(result.message as any),
      isFavorite: result.isFavorite,
    },
  });
};

// [GET] Get my post favorites
export const getMyPostFavoritesController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;

  const result = await favoriteService.getMyPostFavorites(
    userId,
    req.query as ListFavoritesQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};
