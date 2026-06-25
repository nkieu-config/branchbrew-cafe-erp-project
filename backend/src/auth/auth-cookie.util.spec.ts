import { parseAuthCookie, AUTH_COOKIE_NAME } from './auth-cookie.util';

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
