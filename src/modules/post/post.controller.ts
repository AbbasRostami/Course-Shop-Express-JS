import { RequestHandler } from "express";
import { getUserIdFromRequest } from "../../utils/getUserIdFromRequest.js";
import { localizePayload } from "../../utils/localize.js";
import { postService } from "./post.service.js";
import {
  ListPostsAdminQuery,
  ListPostsPublicQuery,
} from "./post.validator.js";

// [POST] Create post
export const createPostController: RequestHandler = async (req, res) => {
  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const post = await postService.createPost({ ...req.body, imageUrl });

  return res.status(201).json({
    status: "success",
    data: {
      message: req.t("post.success.created"),
      post: localizePayload(post, req.locale),
    },
  });
};

// [PUT] Update post
export const updatePostController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;

  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const post = await postService.updatePost(id, { ...req.body, imageUrl });

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t("post.success.updated"),
      post: localizePayload(post, req.locale),
    },
  });
};

// [PATCH] Toggle publish status
export const togglePublishPostController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { published } = req.body;

  const post = await postService.togglePublish(id, published);

  return res.status(200).json({
    status: "success",
    data: {
      message: req.t(
        published ? "post.success.published" : "post.success.hidden",
      ),
      post: localizePayload(post, req.locale),
    },
  });
};

// [DELETE] Delete post
export const deletePostController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await postService.deletePost(id);

  return res.status(200).json({
    status: "success",
    data: { message: req.t("post.success.deleted") },
  });
};

// [GET] Admin list posts
export const getAdminPostsController: RequestHandler = async (req, res) => {
  const result = await postService.getAdminPosts(
    req.query as ListPostsAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Public list posts
export const getPublicPostsController: RequestHandler = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  const result = await postService.getPublicPosts(
    req.query as ListPostsPublicQuery,
    userId,
  );

  return res.status(200).json({
    status: "success",
    data: {
      items: localizePayload(result.items, req.locale),
      pagination: result.pagination,
    },
  });
};

// [GET] Get post by slug
export const getPostBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const post = await postService.getPostBySlug(slug, userId);

  return res.status(200).json({
    status: "success",
    data: {
      post: localizePayload(post, req.locale),
    },
  });
};