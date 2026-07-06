import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MockPrismaService,
  PrismaServiceMockProvider,
} from '../prisma/prisma.service.mock';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersService, PrismaServiceMockProvider],
    }).compile();

    service = module.get(CustomersService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('rejects a duplicate phone number', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 1 } as any);

      await expect(
        service.create({ name: 'Dup', phone: '0811111111' }),
      ).rejects.toThrow('Customer with this phone already exists');
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('creates new members at REGULAR tier with zero points', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);
      prisma.customer.create.mockResolvedValue({ id: 2 } as any);

      await service.create({ name: 'New', phone: '0822222222' });

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          name: 'New',
          phone: '0822222222',
          points: 0,
          tier: 'REGULAR',
        },
      });
    });
  });

  describe('findByPhone', () => {
    it('throws when no customer matches', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.findByPhone('0000000000')).rejects.toThrow(
        'Customer not found',
      );
    });
  });

  describe('checkAndUpdateTier', () => {
    const spendCases: Array<[number, string]> = [
      [4999, 'REGULAR'],
      [5000, 'SILVER'],
      [20000, 'GOLD'],
      [50000, 'PLATINUM'],
    ];

    it.each(spendCases)(
      'lifetime spend %d maps to tier %s',
      async (spend, expectedTier) => {
        prisma.order.aggregate.mockResolvedValue({
          _sum: { netAmount: spend },
        } as any);
        prisma.customer.findUnique.mockResolvedValue({
          id: 1,
          tier: 'REGULAR',
        } as any);
        prisma.customer.update.mockResolvedValue({} as any);

        await service.checkAndUpdateTier(1);

        if (expectedTier === 'REGULAR') {
          expect(prisma.customer.update).not.toHaveBeenCalled();
        } else {
          expect(prisma.customer.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { tier: expectedTier },
          });
        }
      },
    );

    it('does not touch the row when the tier is already correct', async () => {
      prisma.order.aggregate.mockResolvedValue({
        _sum: { netAmount: 6000 },
      } as any);
      prisma.customer.findUnique.mockResolvedValue({
        id: 1,
        tier: 'SILVER',
      } as any);

      await service.checkAndUpdateTier(1);

      expect(prisma.customer.update).not.toHaveBeenCalled();
    });
  });

  describe('handleOrderCreated', () => {
    it('ignores walk-in orders without a customer', async () => {
      await service.handleOrderCreated({ customerId: null } as any);

      expect(prisma.order.aggregate).not.toHaveBeenCalled();
    });
  });
});
