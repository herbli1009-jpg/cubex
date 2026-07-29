---
name: publish-article
description: Create, validate, commit, and push Markdown articles for the CUBEX Astro website. Use when adding, revising, scheduling, or publishing content in src/content/articles, including requests to prepare an article for GitHub and Vercel deployment.
---

# Publish CUBEX Article

Use the repository root as the working directory. Treat GitHub push as the production-release trigger: Vercel deploys from the pushed branch.

## Determine Scope

1. Inspect `git status --short`, the current branch, `src/content.config.ts`, and one or two existing files in `src/content/articles/`.
2. When the user supplies only a topic, draft the article and create the file, but do not commit or push until they explicitly request publication or approve the finished draft.
3. When the user asks to publish, complete validation before committing and pushing. Do not push unrelated existing changes.
4. When the request requires factual claims, statistics, regulations, or customer results, ask for approved sources or use only claims the user has provided. Do not invent citations or test results.

## Create or Update the Article

1. Create one lowercase kebab-case filename in `src/content/articles/`, such as `fitness-equipment-quality-control.md`. Reuse the file when revising an existing article.
2. Supply every required frontmatter field from the `articles` schema:

```yaml
---
title: Clear, specific article title
category: Quality
date: YYYY-MM-DD
readTime: 6 min read
image: https://example.com/article-image.jpg
excerpt: One-sentence summary for the article card.
keywords: [primary keyword, secondary keyword]
seoTitle: Clear, specific article title | CUBEX
seoDescription: A concise search description that accurately reflects the article.
---
```

3. Use a valid, direct image URL. Preserve the existing Markdown style and use clear headings, concise paragraphs, and practical advice for fitness-equipment buyers.
4. Keep the date as the intended publication date. Do not add a future date unless the user requests scheduling; this site has no separate scheduling workflow.

## Validate Before Publication

Run these checks after editing:

```bash
git diff --check
pnpm check
pnpm build
```

Fix any errors before moving on. If `pnpm build` requires unavailable credentials or a network-only service, report the exact limitation and still run every local check that is possible. Review the rendered frontmatter and confirm the diff contains only the intended content files.

## Commit and Push

Only do this when the user explicitly requested publishing, or approved the completed article for publication.

1. Check `git status --short` and `git diff -- src/content/articles/<slug>.md`.
2. Stage only the intended article and directly required assets. Never use `git add .`.
3. Commit with a focused message, for example `content: add fitness equipment quality control article`.
4. Push the current branch with `git push origin <branch>`.
5. Report the article path, commit SHA, branch, and that Vercel deployment is triggered by the push. Do not claim the deployment is live without checking its status.

## Example Prompts

- `Use $publish-article to draft an article about quality control for commercial gym equipment.`
- `Use $publish-article to add this approved copy and publish it to main.`
- `Use $publish-article to update the sourcing-cost article, validate it, and prepare a commit without pushing.`
