import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const defaultProductImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(), status: z.string(),
    launchDate: z.coerce.date().catch(() => new Date()),
    updatedDate: z.coerce.date().catch(() => new Date()),
    featured: z.boolean().default(false),
    image: z.string().trim().min(1).catch(defaultProductImage),
    description: z.string(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).catch([]),
    customization: z.string(),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(), date: z.coerce.date(), readTime: z.string(), image: z.string(),
    excerpt: z.string(), keywords: z.array(z.string()), seoTitle: z.string().optional(), seoDescription: z.string().optional(),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ eyebrow: z.string(), title: z.string(), description: z.string(), features: z.array(z.object({ title: z.string(), description: z.string() })).default([]) }),
});
export const collections = { products, articles, pages };
