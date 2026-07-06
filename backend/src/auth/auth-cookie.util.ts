import type { CookieOptions, Response } from 'express';

export const AUTH_COOKIE_NAME = 'erp_access_token';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function sameSiteMode(): 'lax' | 'none' {
  return process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax';
}

export function authCookieOptions(): CookieOptions {
  const sameSite = sameSiteMode();
  return {
    httpOnly: true,
    secure: sameSite === 'none' || process.env.NODE_ENV === 'production',
    sameSite,
    maxAge: ONE_DAY_MS,
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
}

export function clearAuthCookie(res: Response): void {
  const options = authCookieOptions();
  delete options.maxAge;
  res.clearCookie(AUTH_COOKIE_NAME, options);
}

export function parseAuthCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}
