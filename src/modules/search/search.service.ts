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
  // [DB] Search courses and posts by query string across both languages
  async search(query: SearchQuery) {
    const { q, type } = query;

    // [LOGIC] Cap limit at 20
    const limit = Math.min(Number(query.limit) || 5, 20);

    const searchFilter = {
      contains: q,
      mode: "insensitive" as const,
    };

    const [courses, posts] = await Promise.all([
      // [DB] Search courses across bilingual columns
      !type || type === "course"
        ? prisma.course.findMany({
            where: {
              ...getVisibleCourseWhere(),
              AND: [
                {
                  OR: [
                    { titleFa: searchFilter },
                    { titleEn: searchFilter },
                    { descriptionFa: searchFilter },
                    { descriptionEn: searchFilter },
                  ],
                },
              ],
            },
            select: {
              id: true,
              titleFa: true,
              titleEn: true,
              slugFa: true,
              slugEn: true,
              descriptionFa: true,
              descriptionEn: true,
              imageUrl: true,
              price: true,
              level: true,
              category: {
                select: { 
                  id: true, 
                  nameFa: true, 
                  nameEn: true, 
                  slugFa: true, 
                  slugEn: true 
                },
              },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      // [DB] Search posts across bilingual columns
      !type || type === "post"
        ? prisma.post.findMany({
            where: {
              ...getVisiblePostWhere(),
              AND: [
                {
                  OR: [
                    { titleFa: searchFilter },
                    { titleEn: searchFilter },
                    { contentFa: searchFilter },
                    { contentEn: searchFilter },
                  ],
                },
              ],
            },
            select: {
              id: true,
              titleFa: true,
              titleEn: true,
              slugFa: true,
              slugEn: true,
              imageUrl: true,
              category: {
                select: { 
                  id: true, 
                  nameFa: true, 
                  nameEn: true, 
                  slugFa: true, 
                  slugEn: true 
                },
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