import type { APIRoute } from 'astro';
import { clearAdminSession, setAdminSession } from '../../../lib/admin-auth';
import { getAdminClient } from '../../../lib/admin-users';

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || !import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_SERVICE_ROLE_KEY || !import.meta.env.ADMIN_SESSION_SECRET) return Response.json({ message: 'Incomplete admin configuration.' }, { status: 500 });
  const supabase = getAdminClient(import.meta.env);
  const { data, error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
  if (error || !data.user) return Response.json({ message: 'Invalid administrator credentials.' }, { status: 401 });
  setAdminSession(cookies, data.user.id, import.meta.env);
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = ({ cookies }) => {
  clearAdminSession(cookies);
  return Response.json({ ok: true });
};
