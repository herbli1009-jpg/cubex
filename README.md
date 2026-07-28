# CUBEX Fitness Website

Astro SSR site deployed to Vercel, with Git-backed TinaCMS content, Supabase inquiry storage, SMTP notifications, and Cloudflare R2 media.

## Local development

1. Copy `.env.example` to `.env` and configure the required values.
2. Run `pnpm install` and `pnpm dev`.
3. Visit `http://localhost:4321`; TinaCMS is built to `/admin` by `pnpm build`.

## Deployment setup

1. Apply `supabase/migrations/001_inquiries.sql` in the Supabase SQL editor.
2. In Cloudflare, create an R2 bucket, connect `media.cubex-fitness.com` as its public custom domain, and create an S3 API token scoped to that bucket.
3. Add all `.env.example` variables to Vercel. Use a Supabase **service role** key only as a server-side Vercel secret.
4. Configure Tina Cloud with the GitHub repository and set `TINA_CLIENT_ID` and `TINA_TOKEN` in Vercel. Limit its GitHub app access to internal editors.
5. Configure Vercel Deployment Protection for `/api/admin/*` or place it behind your SSO. The R2 presign endpoint must not be exposed publicly.
6. Configure the SMTP sender domain and set `INQUIRY_RECIPIENT` to the sales inbox. Add Cloudflare Turnstile site/secret keys before production.

## Content and media

- Products: `src/content/products`
- Articles: `src/content/articles`
- Service pages: `src/content/pages`
- Tina schema: `tina/config.ts`

The initial migration keeps the original public Unsplash URLs so the site works before R2 credentials are provided. Upload production-owned product images and documents through the configured media workflow, then replace their URLs in Tina.
# cubex
