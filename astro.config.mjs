import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: process.env.PUBLIC_SITE_URL || 'https://cubex-fitness.com',
  image: {
    domains: ['media.cubex-fitness.com', 'images.unsplash.com'],
  },
});
