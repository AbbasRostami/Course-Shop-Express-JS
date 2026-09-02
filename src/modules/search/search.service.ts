import { prisma } from "../../lib/prisma.js";
import { SearchQuery } from "./search.validator.js";

// [UTIL] Base filter for published courses
const getVisibleCourseWhere = () => ({
  published: true,
  category: { show: true },
});

// [UTIL] Base filter for published posts
const getVisiblePostWhere = () => ({
  published: true,
  category: { show: true },
});

export const searchService = {
  // [DB] Search courses and posts by query string
  async search(query: SearchQuery) {
    const { q, type } = query;

    // [LOGIC] Cap limit at 20
    const limit = Math.min(Number(query.limit) || 5, 20);

    const searchFilter = {
      contains: q,
      mode: "insensitive" as const,
    };

    const [courses, posts] = await Promise.all([
      // [DB] Search courses if type is unset or "course"
      !type || type === "course"
        ? prisma.course.findMany({
            where: {
              ...getVisibleCourseWhere(),
              AND: [
                {
                  OR: [{ title: searchFilter }, { description: searchFilter }],
                },
              ],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              imageUrl: true,
              price: true,
              level: true,
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      // [DB] Search posts if type is unset or "post"
      !type || type === "post"
        ? prisma.post.findMany({
            where: {
              ...getVisiblePostWhere(),
              AND: [
                {
                  OR: [{ title: searchFilter }, { content: searchFilter }],
                },
              ],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    return { query: q, courses, posts };
  },
};
