import { z } from "zod";

// [VALID] Update profile schema
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "user.validation.nameMin").optional(),
    phone: z
      .string()
      .regex(/^09\d{9}$/, "user.validation.phoneInvalid")
      .optional(),
  }),
});

// [VALID] Admin list users schema
export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().max(100).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isVerified: z.enum(["true", "false"]).optional(),
    isBanned: z.enum(["true", "false"]).optional(),
    sortBy: z.enum(["createdAt", "name", "email"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

// [VALID] Get user by ID schema
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("user.validation.idInvalid"),
  }),
});

// [VALID] Ban user schema
export const banUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("user.validation.idInvalid"),
  }),
});

// [VALID] List banned users schema
export const listBannedUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export type ListBannedUsersQuery = z.infer<
  typeof listBannedUsersSchema
>["query"];
export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
