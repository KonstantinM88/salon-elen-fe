import { z } from "zod";

export const articleInput = z.object({
  type: z.enum(["ARTICLE","PROMO"]).default("ARTICLE"),
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  body: z.string().min(10),
  cover: z.string().url().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDesc: z.string().optional(),
});
export type ArticleInput = z.infer<typeof articleInput>;
