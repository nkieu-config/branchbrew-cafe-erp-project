import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Quick fix for batches
  const prisma = app.get(PrismaService);
  const inventories = await prisma.branchInventory.findMany();
  for (const inv of inventories) {
    if (inv.stock > 0) {
      const existing = await prisma.inventoryBatch.findFirst({
        where: { branchId: inv.branchId, ingredientId: inv.ingredientId }
      });
      if (!existing) {
        await prisma.inventoryBatch.create({
          data: {
            branchId: inv.branchId,
            ingredientId: inv.ingredientId,
            quantity: inv.stock,
            status: 'ACTIVE',
          }
        });
      }
    }
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
