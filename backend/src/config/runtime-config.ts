const LOCAL_ORIGIN_PATTERN =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return ['http://localhost:3000', 'http://localhost:3001'];

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function assertDatabaseUrl(): void {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Server cannot start without it.',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    throw new Error(
      'DATABASE_URL must use postgresql:// or postgres:// scheme.',
    );
  }
}

export function assertRuntimeConfig(): void {
  assertDatabaseUrl();

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. Server cannot start without it.',
    );
  }

  if (process.env.NODE_ENV !== 'production') return;

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  const corsOrigins = getCorsOrigins();
  if (!process.env.CORS_ORIGIN || corsOrigins.length === 0) {
    throw new Error('CORS_ORIGIN must be set explicitly in production.');
  }

  if (corsOrigins.includes('*')) {
    throw new Error('CORS_ORIGIN cannot contain "*" in production.');
  }

  const localOrigin = corsOrigins.find((origin) =>
    LOCAL_ORIGIN_PATTERN.test(origin),
  );
  if (localOrigin) {
    throw new Error(
      `CORS_ORIGIN cannot include local origin "${localOrigin}" in production.`,
    );
  }
}
