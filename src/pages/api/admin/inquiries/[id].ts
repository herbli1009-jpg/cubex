import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getAdminSessionUserId } from '../../../../lib/admin-auth';
import { getAdminClient } from '../../../../lib/admin-users';

const schema = z.object({ status: z.enum(['new', 'in_progress', 'closed', 'spam']) });

export const PATCH: APIRoute = async ({ request, params, cookies }) => {
  if (!getAdminSessionUserId(cookies, import.meta.env)) return Response.json({ message: 'Unauthorized.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !params.id) return Response.json({ message: 'Invalid inquiry status.' }, { status: 400 });
  if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ message: 'Supabase is not configured.' }, { status: 500 });
  const supabase = getAdminClient(import.meta.env);
  const status = parsed.data.status;
  const { error } = await supabase.from('inquiries').update({ status, handled_at: status === 'new' ? null : new Date().toISOString() }).eq('id', params.id);
  if (error) return Response.json({ message: 'Unable to update inquiry status.' }, { status: 500 });
  return Response.json({ ok: true, status });
};
