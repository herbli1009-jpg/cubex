# CUBEX Fitness Website

Astro SSR site deployed to Vercel, with Git-backed TinaCMS content, Supabase inquiry storage, SMTP notifications, and Cloudflare R2 media.

## Local development

1. Copy `.env.example` to `.env` and configure the required values.
2. Run `pnpm install` and `pnpm dev`.
3. Visit `http://localhost:4321`; TinaCMS is built to `/admin` by `pnpm build`.

## Deployment setup

1. Apply every migration in `supabase/migrations` in the Supabase SQL editor, in filename order.
2. In Cloudflare, create an R2 bucket, connect `media.cubex-fitness.com` as its public custom domain, and create an S3 API token scoped to that bucket. Set `MEDIA_UPLOAD_ORIGINS` and run `pnpm r2:configure-cors` once to enable browser uploads through signed URLs.
3. Add all `.env.example` variables to Vercel. Use a Supabase **service role** key only as a server-side Vercel secret.
4. Configure Tina Cloud with the GitHub repository and set `TINA_CLIENT_ID` and `TINA_TOKEN` in Vercel. Limit its GitHub app access to internal editors.
5. Configure Vercel Deployment Protection for `/api/admin/*` or place it behind your SSO. The R2 presign endpoint must not be exposed publicly.
6. Configure the SMTP sender domain and set `INQUIRY_RECIPIENT` to the sales inbox. When enabling Cloudflare Turnstile, set both `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` from the same widget before production.
7. Create users in Supabase Authentication. Any Supabase Auth user can then sign in at `/admin/inquiries`.

## Content and media

- Products: `src/content/products`
- Articles: `src/content/articles`
- Service pages: `src/content/pages`
- Tina schema: `tina/config.ts`

Media Manager uses Cloudflare R2 through the protected `/api/admin/media/*` routes. Editors can browse, upload, delete, and select files in Tina; new folders become persistent after the first upload inside them. Keep Vercel Deployment Protection or SSO enabled for these API routes.

To migrate existing Tina Cloud assets, export their `assets.tina.io` URLs to `tina-media-assets.json` as a JSON array, then run `pnpm r2:migrate-tina-media -- --manifest tina-media-assets.json`. Review the generated mapping and run the same command with `--apply` to copy assets and replace matching URLs in `src/content`.
# cubex
