import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  getMyReaction,
  getReactionCounts,
  getReactionCountsForList,
} from "../../utils/reactionHelper.js";
import { sanitizeRichText } from "../../utils/sanitizeHtml.js";
import { createSlug } from "../../utils/slug.js";
import {
  CreatePostInputWithImage,
  postInclude,
  PostWithRelations,
  PostWithStats,
  UpdatePostInputWithImage,
} from "./post.types.js";
import {
  ListPostsAdminQuery,
  ListPostsPublicQuery,
} from "./post.validator.js";

// [UTIL] Format post - replace _count with stats
const formatPost = (post: PostWithRelations): PostWithStats => {
  const { _count, categoryId, ...rest } = post;
  return { ...rest, stats: { comments: _count.comments } };
};

// [UTIL] Format post list
const formatPosts = (posts: PostWithRelations[]): PostWithStats[] =>
  posts.map(formatPost);

// [DB] Check if user favorited a single post
const addFavoriteInfo = async (post: PostWithStats, userId?: string) => {
  if (!userId) return { ...post, isFavorite: false };

  const favorite = await prisma.blogFavorite.findUnique({
    where: { userId_postId: { userId, postId: post.id } },
    select: { id: true },
  });

  return { ...post, isFavorite: !!favorite };
};

// [DB] Batch check favorites for a list of posts
const addFavoriteInfoToList = async (posts: any[], userId?: string) => {
  if (!userId || posts.length === 0) {
    return posts.map((p) => ({ ...p, isFavorite: false }));
  }

  const favorites = await prisma.blogFavorite.findMany({
    where: {
      userId,
      postId: { in: posts.map((p) => p.id) },
    },
    select: { postId: true },
  });

  const favoritePostIds = new Set(favorites.map((f) => f.postId));

  return posts.map((post) => ({
    ...post,
    isFavorite: favoritePostIds.has(post.id),
  }));
};

// [ERROR] Handle duplicate title/slug (P2002)
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("post.errors.titleExists", 400, {
      title: "post.errors.titleExists",
    });
  }
  throw error;
};

// [DB] Validate category exists
const validateCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("post.errors.categoryNotFound", 400, {
      categoryId: "post.errors.categoryNotFound",
    });
  }
};

export const postService = {
  // [DB] Create new post with sanitized content
  async createPost(data: CreatePostInputWithImage) {
    await validateCategoryExists(data.categoryId);

    try {
      const post = await prisma.post.create({
        data: {
          titleFa: data.titleFa,
          titleEn: data.titleEn,
          slugFa: createSlug(data.titleFa),
          slugEn: createSlug(data.titleEn),
          contentFa: sanitizeRichText(data.contentFa),
          contentEn: sanitizeRichText(data.contentEn),
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
          published: data.published,
        },
        include: postInclude,
      });

      return formatPost(post);
    } catch (error) {
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  // [DB] Update existing post
  async updatePost(id: string, data: UpdatePostInputWithImage) {
    const existing = await prisma.post.findUnique({ where: { id } });

    if (!existing) {
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      throw new AppError("post.errors.notFound", 404);
    }

    if (data.categoryId) {
      await validateCategoryExists(data.categoryId);
    }

    const updateData: Prisma.PostUpdateInput = {};

    // [LOGIC] Auto-generate slug on title change
    if (data.titleFa !== undefined) {
      updateData.titleFa = data.titleFa;
      updateData.slugFa = createSlug(data.titleFa);
    }
    if (data.titleEn !== undefined) {
      updateData.titleEn = data.titleEn;
      updateData.slugEn = createSlug(data.titleEn);
    }
    if (data.contentFa !== undefined) {
      updateData.contentFa = sanitizeRichText(data.contentFa);
    }
    if (data.contentEn !== undefined) {
      updateData.contentEn = sanitizeRichText(data.contentEn);
    }
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.published !== undefined) updateData.published = data.published;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;

    try {
      const post = await prisma.post.update({
        where: { id },
        data: updateData,
        include: postInclude,
      });

      if (data.imageUrl && existing.imageUrl) {
        await removeCloudinaryImage(existing.imageUrl);
      }

      return formatPost(post);
    } catch (error) {
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  // [DB] Toggle post publish status
  async togglePublish(id: string, published: boolean) {
    const existing = await prisma.post.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) {
      throw new AppError("post.errors.notFound", 404);
    }

    if (existing.published === published) {
      throw new AppError(
        published ? "post.errors.alreadyPublished" : "post.errors.alreadyHidden",
        400,
      );
    }

    if (published && !existing.category.show) {
      throw new AppError("post.errors.categoryHidden", 400);
    }

    const post = await prisma.post.update({
      where: { id },
      data: { published },
      include: postInclude,
    });

    return formatPost(post);
  },

  // [DB] Delete post and remove image
  async deletePost(id: string) {
    const existing = await prisma.post.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("post.errors.notFound", 404);
    }

    await prisma.post.delete({ where: { id } });

    if (existing.imageUrl) {
      await removeCloudinaryImage(existing.imageUrl);
    }
  },

  // [DB] Admin get all posts with filters
  async getAdminPosts(query: ListPostsAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.PostWhereInput = {};

    if (query.published !== undefined) {
      where.published = query.published === "true";
    }

    if (query.search) {
      where.OR = [
        { titleFa: { contains: query.search, mode: "insensitive" } },
        { titleEn: { contains: query.search, mode: "insensitive" } },
        { contentFa: { contains: query.search, mode: "insensitive" } },
        { contentEn: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      items: formatPosts(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Public list posts with reactions and favorites
  async getPublicPosts(query: ListPostsPublicQuery, userId?: string) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.PostWhereInput = {
      published: true,
      category: { show: true },
    };

    if (query.category) {
      where.category = {
        OR: [
          { slugFa: query.category },
          { slugEn: query.category },
        ],
        show: true,
      };
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { titleFa: { contains: query.search, mode: "insensitive" } },
            { titleEn: { contains: query.search, mode: "insensitive" } },
            { contentFa: { contains: query.search, mode: "insensitive" } },
            { contentEn: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    const formattedPosts = formatPosts(items);
    const postIds = formattedPosts.map((p) => p.id);

    const reactionMap = await getReactionCountsForList(
      "postId",
      postIds,
      userId,
    );

    const postsWithReactions = formattedPosts.map((post) => ({
      ...post,
      reactions: reactionMap.get(post.id) ?? {
        likes: 0,
        dislikes: 0,
        myReaction: null,
      },
    }));

    const finalItems = await addFavoriteInfoToList(postsWithReactions, userId);

    return {
      items: finalItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get single post by slug (Fa or En) with reactions and favorite
  async getPostBySlug(slug: string, userId?: string) {
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slugFa: slug }, { slugEn: slug }],
        published: true,
        category: { show: true },
      },
      include: postInclude,
    });

    if (!post) {
      throw new AppError("post.errors.notFound", 404);
    }

    const formattedPost = formatPost(post);

    const [counts, myReaction] = await Promise.all([
      getReactionCounts("postId", post.id),
      getMyReaction("postId", post.id, userId),
    ]);

    const postWithReactions = {
      ...formattedPost,
      reactions: { ...counts, myReaction },
    };

    return await addFavoriteInfo(postWithReactions, userId);
  },
};