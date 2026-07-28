import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(), category: z.string(), status: z.string(), launchDate: z.coerce.date(), updatedDate: z.coerce.date(),
    featured: z.boolean().default(false), image: z.string(), description: z.string(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })), customization: z.string(),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(), category: z.string(), date: z.coerce.date(), readTime: z.string(), image: z.string(),
    excerpt: z.string(), keywords: z.array(z.string()), seoTitle: z.string().optional(), seoDescription: z.string().optional(),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ eyebrow: z.string(), title: z.string(), description: z.string(), features: z.array(z.object({ title: z.string(), description: z.string() })).default([]) }),
});
export const collections = { products, articles, pages };
