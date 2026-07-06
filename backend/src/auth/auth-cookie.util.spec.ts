import {
  parseAuthCookie,
  authCookieOptions,
  AUTH_COOKIE_NAME,
} from './auth-cookie.util';

describe('authCookieOptions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults to sameSite lax', () => {
    delete process.env.COOKIE_SAME_SITE;
    expect(authCookieOptions().sameSite).toBe('lax');
  });

  it('forces secure when COOKIE_SAME_SITE=none (browser requirement)', () => {
    process.env.COOKIE_SAME_SITE = 'none';
    process.env.NODE_ENV = 'development';

    const options = authCookieOptions();
    expect(options.sameSite).toBe('none');
    expect(options.secure).toBe(true);
  });
});

describe('parseAuthCookie', () => {
  it('extracts the auth token from cookie header', () => {
    const header = `other=value; ${AUTH_COOKIE_NAME}=jwt-token-123; foo=bar`;
    expect(parseAuthCookie(header)).toBe('jwt-token-123');
  });

  it('returns null when cookie is missing', () => {
    expect(parseAuthCookie('other=value')).toBeNull();
    expect(parseAuthCookie(undefined)).toBeNull();
  });
});
