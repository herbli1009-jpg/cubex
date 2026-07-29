import type { CollectionEntry } from 'astro:content';

type ContentCollection = 'products' | 'articles';
type ContentEntry = CollectionEntry<ContentCollection>;

export type Category = {
  path: string;
  label: string;
  url: string;
  depth: number;
  children: Category[];
};

const titleize = (segment: string) => segment
  .split('-')
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

export const contentSlug = (entry: ContentEntry) => entry.id.split('/').at(-1)!;

export const categorySegments = (entry: ContentEntry) => entry.id.split('/').slice(0, -1);

export const categoryPath = (entry: ContentEntry) => categorySegments(entry).join('/');

export const categoryLabel = (path: string) => path.split('/').filter(Boolean).map(titleize).join(' / ');

export const categoryUrl = (collection: ContentCollection, path: string) => `/${collection === 'articles' ? 'knowledge' : 'products'}/${path}/`;

export const categoryAncestors = (entry: ContentEntry) => categorySegments(entry)
  .map((_, index, segments) => segments.slice(0, index + 1).join('/'));

export const buildCategoryTree = (collection: ContentCollection, entries: ContentEntry[]): Category[] => {
  const roots: Category[] = [];
  const byPath = new Map<string, Category>();

  for (const entry of entries) {
    for (const path of categoryAncestors(entry)) {
      if (byPath.has(path)) continue;
      const category: Category = {
        path,
        label: categoryLabel(path.split('/').at(-1)!),
        url: categoryUrl(collection, path),
        depth: path.split('/').length,
        children: [],
      };
      byPath.set(path, category);
      const parentPath = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
      const parent = byPath.get(parentPath);
      if (parent) parent.children.push(category); else roots.push(category);
    }
  }

  const sort = (categories: Category[]) => {
    categories.sort((a, b) => a.label.localeCompare(b.label));
    categories.forEach((category) => sort(category.children));
  };
  sort(roots);
  return roots;
};

export const flattenCategories = (categories: Category[]): Category[] => categories.flatMap((category) => [category, ...flattenCategories(category.children)]);

export const entriesInCategory = <T extends ContentEntry>(entries: T[], path: string) => entries.filter((entry) => {
  const entryPath = categoryPath(entry);
  return entryPath === path || entryPath.startsWith(`${path}/`);
});

export const relatedEntries = <T extends ContentEntry>(entries: T[], entry: T, limit = 3) => {
  const sourcePath = categoryPath(entry);
  return entries
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => {
      const candidatePath = categoryPath(candidate);
      const sharedDepth = categorySegments(entry).filter((segment, index) => categorySegments(candidate)[index] === segment).length;
      return { candidate, score: candidatePath === sourcePath ? 1000 : sharedDepth };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
};
