import type { AstroCookies } from 'astro';
import { getAdminClient } from './admin-users';

const SESSION_NAME = 'cubex_inquiry_admin';

export const canUseAdmin = (env: ImportMetaEnv) => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

export const getAdminSessionUserId = async (cookies: AstroCookies, env: ImportMetaEnv) => {
  if (!canUseAdmin(env)) return null;
  const accessToken = cookies.get(SESSION_NAME)?.value;
  if (!accessToken) return null;
  const { data, error } = await getAdminClient(env).auth.getUser(accessToken);
  return error || !data.user ? null : data.user.id;
};

export const setAdminSession = (cookies: AstroCookies, accessToken: string) => {
  cookies.set(SESSION_NAME, accessToken, {
    httpOnly: true, sameSite: 'strict', secure: import.meta.env.PROD, path: '/', maxAge: 60 * 60 * 12,
  });
};

export const clearAdminSession = (cookies: AstroCookies) => cookies.delete(SESSION_NAME, { path: '/' });
