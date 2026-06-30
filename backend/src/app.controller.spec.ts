import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const prismaMock = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('returns ok when database is reachable', async () => {
      await expect(appController.health()).resolves.toEqual({ status: 'ok' });
    });

    it('throws service unavailable when database is unreachable', async () => {
      prismaMock.$queryRaw.mockRejectedValueOnce(new Error('database down'));

      await expect(appController.health()).rejects.toMatchObject({
        status: 503,
      });
    });
  });
});
