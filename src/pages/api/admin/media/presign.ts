import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createUpload, getR2MediaConfig } from '../../../../lib/r2-media';

const mediaSchema = z.object({
  directory: z.string().max(400).optional(),
  filename: z.string().min(1).max(240),
  contentType: z.string().min(1).max(100),
});

export const POST: APIRoute = async ({ request }) => {
  const parsed = mediaSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: 'Invalid file.' }, { status: 400 });
  try {
    return Response.json(await createUpload(getR2MediaConfig(import.meta.env), parsed.data));
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : 'Unable to create upload.' }, { status: 400 });
  }
};
