import type { APIRoute } from 'astro';
import { z } from 'zod';
import { deleteMedia, getR2MediaConfig } from '../../../../lib/r2-media';

const schema = z.object({ key: z.string().min(1).max(500) });

export const POST: APIRoute = async ({ request }) => {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: 'Invalid media key.' }, { status: 400 });
  try {
    await deleteMedia(getR2MediaConfig(import.meta.env), parsed.data.key);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : 'Unable to delete media.' }, { status: 400 });
  }
};
