import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MockPrismaService,
  PrismaServiceMockProvider,
} from '../prisma/prisma.service.mock';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: MockPrismaService;
  let emitter: { emit: jest.Mock };

  beforeEach(async () => {
    emitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        PrismaServiceMockProvider,
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();

    service = module.get(NotificationsService);
    prisma = module.get(PrismaService);
  });

  it('skips branch notifications when an unread duplicate exists', async () => {
    prisma.notification.findFirst.mockResolvedValue({ id: 1 } as any);

    const result = await service.notifyBranch({
      branchId: 2,
      type: 'LOW_STOCK',
      title: 'Beans is running low',
      dedupeKey: 'low-stock-3',
    });

    expect(result).toBeNull();
    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('creates and emits when no unread duplicate exists', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({
      id: 5,
      branchId: 2,
      type: 'LOW_STOCK',
    } as any);

    const result = await service.notifyBranch({
      branchId: 2,
      type: 'LOW_STOCK',
      title: 'Beans is running low',
      dedupeKey: 'low-stock-3',
    });

    expect(result).toMatchObject({ id: 5 });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ minRole: 'MANAGER' }),
    });
    expect(emitter.emit).toHaveBeenCalledWith(
      'notification.created',
      expect.objectContaining({ id: 5 }),
    );
  });

  it('scopes staff visibility to staff-level branch notifications only', async () => {
    prisma.notification.count.mockResolvedValue(0);

    await service.countUnread({ userId: 7, role: 'STAFF', branchId: 2 });

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        OR: [
          { userId: 7 },
          expect.objectContaining({
            userId: null,
            branchId: 2,
            minRole: { in: ['STAFF'] },
          }),
        ],
        readAt: null,
      }),
    });
  });

  it('lets managers see staff and manager notifications', async () => {
    prisma.notification.count.mockResolvedValue(0);

    await service.countUnread({ userId: 8, role: 'MANAGER', branchId: 2 });

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        OR: [
          { userId: 8 },
          expect.objectContaining({
            minRole: { in: ['STAFF', 'MANAGER'] },
          }),
        ],
      }),
    });
  });
});
