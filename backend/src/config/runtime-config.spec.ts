import {
  assertRuntimeConfig,
  assertDatabaseUrl,
  getCorsOrigins,
} from './runtime-config';

describe('runtime-config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('assertDatabaseUrl', () => {
    it('requires DATABASE_URL to be set', () => {
      delete process.env.DATABASE_URL;

      expect(() => assertDatabaseUrl()).toThrow(
        'DATABASE_URL environment variable is not set',
      );
    });

    it('rejects non-Postgres URLs', () => {
      process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/db';

      expect(() => assertDatabaseUrl()).toThrow(
        'DATABASE_URL must use postgresql:// or postgres:// scheme',
      );
    });

    it('accepts postgres and postgresql schemes', () => {
      process.env.DATABASE_URL =
        'postgresql://user:pass@localhost:5432/erp?schema=public';
      expect(() => assertDatabaseUrl()).not.toThrow();

      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/erp';
      expect(() => assertDatabaseUrl()).not.toThrow();
    });
  });

  describe('assertRuntimeConfig', () => {
    it('requires JWT_SECRET and DATABASE_URL', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'dev-secret';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/erp';

      expect(() => assertRuntimeConfig()).not.toThrow();
    });

    it('rejects placeholder JWT_SECRET in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'dev-secret-qafacafe-erp-change-in-production';
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.example.com:5432/erp';
      process.env.CORS_ORIGIN = 'https://erp.example.com';

      expect(() => assertRuntimeConfig()).toThrow(
        'JWT_SECRET looks like a placeholder/dev value',
      );
    });

    it('accepts a random JWT_SECRET in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'f3a9'.repeat(16);
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.example.com:5432/erp';
      process.env.CORS_ORIGIN = 'https://erp.example.com';

      expect(() => assertRuntimeConfig()).not.toThrow();
    });

    it('enforces production CORS rules', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'x'.repeat(32);
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.example.com:5432/erp';
      process.env.CORS_ORIGIN = 'http://localhost:3001';

      expect(() => assertRuntimeConfig()).toThrow(
        'CORS_ORIGIN cannot include local origin',
      );
    });

    it('rejects scheme-less CORS origins in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'x'.repeat(32);
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.example.com:5432/erp';
      process.env.CORS_ORIGIN = 'demo.example.com';

      expect(() => assertRuntimeConfig()).toThrow('missing its scheme');
    });

    it('accepts a fully-qualified https CORS origin in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'x'.repeat(32);
      process.env.DATABASE_URL =
        'postgresql://user:pass@db.example.com:5432/erp';
      process.env.CORS_ORIGIN = 'https://demo.example.com';

      expect(() => assertRuntimeConfig()).not.toThrow();
    });
  });

  describe('getCorsOrigins', () => {
    it('returns localhost defaults when CORS_ORIGIN is unset', () => {
      delete process.env.CORS_ORIGIN;
      expect(getCorsOrigins()).toEqual([
        'http://localhost:3000',
        'http://localhost:3001',
      ]);
    });
  });
});
