---
name: publish-content
description: Create, update, validate, commit, and push CUBEX website articles and products. Use when adding, revising, scheduling, or publishing Markdown content in src/content/articles or src/content/products, including requests to prepare website content for GitHub and Vercel deployment.
---

# Publish CUBEX Content

Use the repository root as the working directory. Treat a GitHub push as the production-release trigger: Vercel deploys from the pushed branch.

## Determine Scope

1. Inspect `git status --short`, the current branch, `src/content.config.ts`, and an existing Markdown file from the requested collection.
2. Choose exactly one collection unless the user explicitly asks to publish both:
   - Articles: `src/content/articles/`
   - Products: `src/content/products/`
3. When the user supplies only a topic or product brief, do not guess the missing publishing details. Ask concise clarifying questions before drafting, covering the intended collection, content subject, approved facts/specifications, image source, and whether the finished content should be published now or prepared as a draft.
4. Ask whether a new or revised product should appear on the homepage. Set its `featured` value only after the user answers; use `true` for homepage placement and `false` otherwise.
5. Ask whether a new or revised article should appear on the homepage. The current article collection has no `featured` field and the homepage automatically shows the three newest articles. Explain this behavior and ask whether the user authorizes a separate website change to add article-level homepage selection. Do not add an unsupported `featured` field to an article.
6. When the user asks to publish, validate before committing and pushing. Do not push unrelated existing changes.
7. When the request needs factual claims, certifications, specifications, pricing, or test results, use approved sources or information the user supplied. Do not invent them.

## Create or Update Content

1. Create one lowercase kebab-case filename. Reuse the existing file when revising content.
2. Follow the selected collection's schema in `src/content.config.ts`. Use the local style of existing files. Never add fields merely because they are present in another collection.

### Article Template

Store at `src/content/articles/<category-path>/<slug>.md`. The folder path is the article category and must use stable lowercase kebab-case segments:

```yaml
---
title: Clear, specific article title
date: YYYY-MM-DD
readTime: 6 min read
image: https://example.com/article-image.jpg
excerpt: One-sentence summary for the article card.
keywords: [primary keyword, secondary keyword]
seoTitle: Clear, specific article title | CUBEX
seoDescription: A concise search description that accurately reflects the article.
---
```

Use clear headings, concise paragraphs, and practical advice for fitness-equipment buyers. Keep the date as the intended publication date; the site has no separate scheduling workflow.

### Product Template

Store at `src/content/products/<category-path>/<slug>.md`. The folder path is the product category and must use stable lowercase kebab-case segments:

```yaml
---
name: Product name
status: New
launchDate: YYYY-MM-DD
updatedDate: YYYY-MM-DD
featured: false # Confirm homepage placement with the user first.
image: https://example.com/product-image.jpg
description: A concise product-card description.
specs:
  - { label: Specification, value: Value }
customization: Describe the available customization scope.
---
```

Use a valid, direct image URL. Provide concrete specifications only when supplied or verified. Set `updatedDate` to the actual revision date.

## Validate Before Publication

Run these checks after editing:

```bash
git diff --check
pnpm check
pnpm build
```

Fix errors before moving on. If the build requires unavailable credentials or a network-only service, report the exact limitation and run every local check that is possible. Review the rendered frontmatter and confirm the diff contains only intended content files.

## Commit and Push

Only do this when the user explicitly requested publishing, or approved the completed content for publication.

1. Check `git status --short` and the diff for the intended content file.
2. Stage only the requested Markdown file and directly required assets. Never use `git add .`.
3. Commit with a focused message, such as `content: add modular power rack` or `content: update quality control article`.
4. Push the current branch with `git push origin <branch>`.
5. Report the content path, commit SHA, branch, and that Vercel deployment is triggered by the push. Do not claim deployment is live without checking its status.

## Example Prompts

- `Use $publish-content to draft an article about quality control for commercial gym equipment.`
- `Use $publish-content to add a functional trainer product, validate it, and prepare a commit without pushing.`
- `Use $publish-content to publish these approved product and article updates to main.`
