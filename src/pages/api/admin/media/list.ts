import type { APIRoute } from 'astro';
import { getR2MediaConfig, listMedia } from '../../../../lib/r2-media';

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const result = await listMedia(getR2MediaConfig(import.meta.env), {
      directory: url.searchParams.get('directory') ?? '',
      offset: url.searchParams.get('offset') ?? undefined,
      limit: Number.isFinite(limit) ? limit : 20,
    });
    const filesOnly = url.searchParams.get('filesOnly') === 'true';
    return Response.json({ ...result, items: filesOnly ? result.items.filter((item) => item.type === 'file') : result.items });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : 'Unable to list media.' }, { status: 400 });
  }
};
