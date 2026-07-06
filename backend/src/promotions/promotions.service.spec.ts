import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PromotionsService } from './promotions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const basePromo = {
    id: 1,
    code: 'SAVE20',
    description: 'Save 20%',
    discountType: 'PERCENTAGE' as const,
    discountValue: new Prisma.Decimal(20),
    minPurchase: null as Prisma.Decimal | null,
    isActive: true,
    startDate: null as Date | null,
    endDate: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
  });

  describe('create', () => {
    it('rejects percentage discounts above 100', async () => {
      await expect(
        service.create({
          code: 'BROKEN',
          description: 'Too much',
          discountType: 'PERCENTAGE',
          discountValue: 150,
        }),
      ).rejects.toThrow('Percentage discount cannot exceed 100%');

      expect(prismaMock.promotion.create).not.toHaveBeenCalled();
    });

    it('maps a duplicate code to a friendly error', async () => {
      prismaMock.promotion.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['code'] },
        }),
      );

      await expect(
        service.create({
          code: 'SAVE20',
          description: 'Duplicate',
          discountType: 'FIXED_AMOUNT',
          discountValue: 10,
        }),
      ).rejects.toThrow('A promotion with this code already exists');
    });
  });

  describe('update', () => {
    it('rejects raising an existing fixed promo to percentage above 100', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        discountType: 'FIXED_AMOUNT',
        discountValue: new Prisma.Decimal(150),
      } as any);

      await expect(
        service.update(1, { discountType: 'PERCENTAGE' }),
      ).rejects.toThrow('Percentage discount cannot exceed 100%');
    });

    it('throws when the promotion does not exist', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('refuses to delete a promotion already used on orders', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        _count: { orders: 3 },
      } as any);

      await expect(service.remove(1)).rejects.toThrow(
        'Cannot delete a promotion that has been used on orders',
      );
      expect(prismaMock.promotion.delete).not.toHaveBeenCalled();
    });
  });

  describe('validateCode', () => {
    it('throws when the code does not exist', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue(null);

      await expect(service.validateCode('NOPE', 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects inactive promotions', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        isActive: false,
      });

      await expect(service.validateCode('SAVE20', 100)).rejects.toThrow(
        'This promotion is no longer active',
      );
    });

    it('rejects promotions outside their date window', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        startDate: tomorrow,
      });
      await expect(service.validateCode('SAVE20', 100)).rejects.toThrow(
        'This promotion has not started yet',
      );

      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        endDate: yesterday,
      });
      await expect(service.validateCode('SAVE20', 100)).rejects.toThrow(
        'This promotion has expired',
      );
    });

    it('enforces the minimum purchase against the subtotal', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        minPurchase: new Prisma.Decimal(200),
      });

      await expect(service.validateCode('SAVE20', 199)).rejects.toThrow(
        'Minimum purchase of 200 required',
      );
    });

    it('computes a percentage discount in decimal space', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        discountValue: new Prisma.Decimal(17.5),
      });

      const result = await service.validateCode('SAVE20', 199.99);

      expect(result.discountAmount).toBe(35);
    });

    it('returns the fixed amount for FIXED_AMOUNT promos', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        discountType: 'FIXED_AMOUNT',
        discountValue: new Prisma.Decimal(30),
      } as any);

      const result = await service.validateCode('SAVE20', 100);

      expect(result.discountAmount).toBe(30);
    });

    it('caps the discount at the subtotal', async () => {
      prismaMock.promotion.findUnique.mockResolvedValue({
        ...basePromo,
        discountType: 'FIXED_AMOUNT',
        discountValue: new Prisma.Decimal(500),
      } as any);

      const result = await service.validateCode('SAVE20', 120);

      expect(result.discountAmount).toBe(120);
    });
  });
});
