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
import { ListPostsAdminQuery, ListPostsPublicQuery } from "./post.validator.js";

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

// [ERROR] Handle duplicate title (P2002)
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("پستی با این عنوان قبلاً ثبت شده است", 400, {
      title: "این عنوان قبلاً استفاده شده است",
    });
  }
  throw error;
};

// [DB] Validate category exists
const validateCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    throw new AppError("دسته‌بندی مورد نظر یافت نشد", 400, {
      categoryId: "این دسته‌بندی وجود ندارد",
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
          title: data.title,
          slug: createSlug(data.title),
          content: sanitizeRichText(data.content),
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
          published: data.published,
        },
        include: postInclude,
      });

      return formatPost(post);
    } catch (error) {
      // [CLEANUP] Remove uploaded image on failure
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
      // [CLEANUP] Remove uploaded image if post not found
      if (data.imageUrl) {
        await removeCloudinaryImage(data.imageUrl);
      }
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    if (data.categoryId) {
      await validateCategoryExists(data.categoryId);
    }

    const updateData: Prisma.PostUpdateInput = {};

    // [LOGIC] Auto-generate slug on title change
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = createSlug(data.title);
    }
    if (data.content !== undefined) {
      updateData.content = sanitizeRichText(data.content);
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

      // [CLEANUP] Remove old image after successful update
      if (data.imageUrl && existing.imageUrl) {
        await removeCloudinaryImage(existing.imageUrl);
      }

      return formatPost(post);
    } catch (error) {
      // [CLEANUP] Remove uploaded image on failure
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
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    // [LOGIC] Prevent redundant toggle
    if (existing.published === published) {
      throw new AppError(
        published ? "پست از قبل منتشر شده است" : "پست از قبل پنهان است",
        400,
      );
    }

    // [LOGIC] Block publish if category is hidden
    if (published && !existing.category.show) {
      throw new AppError(
        "نمی‌توان پست را منتشر کرد چون دسته‌بندی آن غیرفعال است",
        400,
      );
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
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    await prisma.post.delete({ where: { id } });

    // [CLEANUP] Remove image from Cloudinary
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
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.post.findMany({ where, skip, take, orderBy, include: postInclude }),
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
      where.category = { slug: query.category, show: true };
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { content: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.post.findMany({ where, skip, take, orderBy, include: postInclude }),
      prisma.post.count({ where }),
    ]);

    const formattedPosts = formatPosts(items);
    const postIds = formattedPosts.map((p) => p.id);

    // [DB] Attach reactions per post
    const reactionMap = await getReactionCountsForList("postId", postIds, userId);

    const postsWithReactions = formattedPosts.map((post) => ({
      ...post,
      reactions: reactionMap.get(post.id) ?? {
        likes: 0,
        dislikes: 0,
        myReaction: null,
      },
    }));

    // [DB] Attach favorite status per post
    const finalItems = await addFavoriteInfoToList(postsWithReactions, userId);

    return {
      items: finalItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  // [DB] Get single post by slug with reactions and favorite
  async getPostBySlug(slug: string, userId?: string) {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
        category: { show: true },
      },
      include: postInclude,
    });

    if (!post) {
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    const formattedPost = formatPost(post);

    // [DB] Load reactions in parallel
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