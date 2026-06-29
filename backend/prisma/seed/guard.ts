/**
 * Refuses to wipe and reseed when NODE_ENV is production unless explicitly overridden.
 * Demo seed deletes all rows — never run against a live database by accident.
 */
export function assertSeedAllowed(): void {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    console.error(
      'Refusing to run demo seed in production (NODE_ENV=production).',
      'Set ALLOW_DEMO_SEED=true only on an intentional demo/staging database.',
    );
    process.exit(1);
  }
}
