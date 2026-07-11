import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10_000,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter, omit: { user: { password: true } } });
    this.pool = pool;
  }

  onModuleInit() {
    void this.$connect().catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Initial database connection failed; the server stays up and queries reconnect lazily: ${reason}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
