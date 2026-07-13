import { disconnectPrisma, getPrisma } from './seed/client';

const POLL_MS = 2_000;
const MAX_WAIT_MS = 30 * 60 * 1000;

const prisma = getPrisma();

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

async function backlog(since: Date): Promise<number> {
  return prisma.outboxEvent.count({
    where: {
      createdAt: { gte: since },
      status: { in: ['PENDING', 'PROCESSING'] },
    },
  });
}

async function report(since: Date, drainedAt: Date | null): Promise<void> {
  const events = await prisma.outboxEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { status: true, createdAt: true, processedAt: true, attempts: true },
    orderBy: { createdAt: 'asc' },
  });

  if (events.length === 0) {
    console.log(`No outbox events created since ${since.toISOString()}.`);
    return;
  }

  const completed = events.filter((e) => e.status === 'COMPLETED' && e.processedAt);
  const failed = events.filter((e) => e.status === 'FAILED');
  const stillPending = events.filter((e) => e.status === 'PENDING' || e.status === 'PROCESSING');

  const lags = completed
    .map((e) => e.processedAt!.getTime() - e.createdAt.getTime())
    .sort((a, b) => a - b);

  const firstCreated = events[0].createdAt;
  const lastProcessed = completed.reduce<Date | null>(
    (latest, e) => (!latest || e.processedAt! > latest ? e.processedAt! : latest),
    null,
  );

  console.log('');
  console.log('Outbox lag — time from order commit to side effects being applied');
  console.log('-----------------------------------------------------------------');
  console.log(`  Window          : since ${since.toISOString()}`);
  console.log(`  Events created  : ${events.length}`);
  console.log(`  Completed       : ${completed.length}`);
  console.log(`  Failed          : ${failed.length}`);
  console.log(`  Still queued    : ${stillPending.length}`);
  console.log('');
  console.log(`  Lag p50         : ${seconds(percentile(lags, 50))}`);
  console.log(`  Lag p95         : ${seconds(percentile(lags, 95))}`);
  console.log(`  Lag p99         : ${seconds(percentile(lags, 99))}`);
  console.log(`  Lag max         : ${seconds(lags[lags.length - 1] ?? 0)}`);

  if (lastProcessed && drainedAt) {
    const drainMs = lastProcessed.getTime() - firstCreated.getTime();
    const rate = completed.length / (drainMs / 1000);
    console.log('');
    console.log(`  Drain window    : ${seconds(drainMs)} (first commit → last side effect)`);
    console.log(`  Drain rate      : ${rate.toFixed(2)} events/sec`);
  }

  if (stillPending.length > 0) {
    const oldest = stillPending[0];
    const age = Date.now() - oldest.createdAt.getTime();
    console.log('');
    console.log(`  Oldest unapplied event is ${seconds(age)} old — the ledger is behind by that much right now.`);
  }
}

async function main(): Promise<void> {
  const sinceEnv = process.env.SINCE;
  const since = sinceEnv ? new Date(sinceEnv) : new Date(Date.now() - 30 * 60 * 1000);

  if (Number.isNaN(since.getTime())) {
    console.error(`SINCE is not a valid ISO timestamp: ${sinceEnv}`);
    process.exit(1);
  }

  const shouldWait = process.env.WAIT_FOR_DRAIN === 'true';
  let drainedAt: Date | null = null;

  if (shouldWait) {
    const startedAt = Date.now();
    let pending = await backlog(since);
    console.log(`Waiting for the outbox to drain — ${pending} events queued.`);

    while (pending > 0 && Date.now() - startedAt < MAX_WAIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      const previous = pending;
      pending = await backlog(since);
      if (pending !== previous) {
        console.log(`  ${pending} queued (${seconds(Date.now() - startedAt)} elapsed)`);
      }
    }

    if (pending === 0) {
      drainedAt = new Date();
      console.log(`Outbox drained after ${seconds(Date.now() - startedAt)}.`);
    } else {
      console.log(`Gave up waiting after ${seconds(MAX_WAIT_MS)} — ${pending} events still queued.`);
    }
  }

  await report(since, drainedAt);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
  });
