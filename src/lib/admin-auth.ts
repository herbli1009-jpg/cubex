import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const SESSION_NAME = 'cubex_inquiry_admin';
const digest = (value: string) => createHash('sha256').update(value).digest();
const signature = (userId: string, secret: string) => createHmac('sha256', secret).update(userId).digest('base64url');

export const canUseAdmin = (env: ImportMetaEnv) => Boolean(env.ADMIN_SESSION_SECRET);

export const getAdminSessionUserId = (cookies: AstroCookies, env: ImportMetaEnv) => {
  if (!canUseAdmin(env)) return null;
  const [userId, tokenSignature] = (cookies.get(SESSION_NAME)?.value || '').split('.');
  if (!userId || !tokenSignature) return null;
  return timingSafeEqual(digest(tokenSignature), digest(signature(userId, env.ADMIN_SESSION_SECRET))) ? userId : null;
};

export const setAdminSession = (cookies: AstroCookies, userId: string, env: ImportMetaEnv) => {
  cookies.set(SESSION_NAME, `${userId}.${signature(userId, env.ADMIN_SESSION_SECRET)}`, {
    httpOnly: true, sameSite: 'strict', secure: import.meta.env.PROD, path: '/', maxAge: 60 * 60 * 12,
  });
};

export const clearAdminSession = (cookies: AstroCookies) => cookies.delete(SESSION_NAME, { path: '/' });
