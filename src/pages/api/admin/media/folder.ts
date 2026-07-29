import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createFolder, getR2MediaConfig } from '../../../../lib/r2-media';

const schema = z.object({ directory: z.string().max(400).optional(), name: z.string().min(1).max(180) });

export const POST: APIRoute = async ({ request }) => {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: 'Invalid folder.' }, { status: 400 });
  try {
    return Response.json(await createFolder(getR2MediaConfig(import.meta.env), parsed.data.directory ?? '', parsed.data.name));
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : 'Unable to create folder.' }, { status: 400 });
  }
};
