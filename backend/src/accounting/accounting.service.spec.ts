import { Test, TestingModule } from '@nestjs/testing';
import { AccountingService } from './accounting.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Prisma, PrismaClient } from '@prisma/client';

describe('AccountingService', () => {
  let service: AccountingService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
  });

  describe('createJournalEntry', () => {
    const mockAccounts = [
      { id: 1, code: '1010', name: 'Cash', type: 'ASSET' },
      { id: 2, code: '4010', name: 'Sales Revenue', type: 'REVENUE' },
    ];

    it('throws when debits and credits do not balance', async () => {
      const entryData = {
        description: 'Unbalanced Entry',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '4010', debit: 0, credit: 90 }, // Unbalanced!
        ],
      };

      await expect(service.createJournalEntry(entryData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createJournalEntry(entryData)).rejects.toThrow(
        'Journal entry unbalanced',
      );

      expect(prismaMock.account.findMany).not.toHaveBeenCalled();
      expect(prismaMock.journalEntry.create).not.toHaveBeenCalled();
    });

    it('throws when account codes are invalid', async () => {
      const entryData = {
        description: 'Invalid Accounts',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '9999', debit: 0, credit: 100 }, // 9999 does not exist
        ],
      };

      // Mock DB returning only 1 account
      prismaMock.account.findMany.mockResolvedValue([mockAccounts[0]] as any);

      await expect(service.createJournalEntry(entryData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createJournalEntry(entryData)).rejects.toThrow(
        'One or more account codes are invalid',
      );

      expect(prismaMock.journalEntry.create).not.toHaveBeenCalled();
    });

    it('creates journal entry when balanced and accounts are valid', async () => {
      const entryData = {
        branchId: 1,
        reference: 'TEST-001',
        description: 'Valid Entry',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '4010', debit: 0, credit: 100 },
        ],
      };

      prismaMock.account.findMany.mockResolvedValue(mockAccounts as any);

      const createdEntry = {
        id: 1,
        ...entryData,
        status: 'POSTED',
        date: new Date(),
      };

      prismaMock.journalEntry.create.mockResolvedValue(createdEntry as any);

      const result = await service.createJournalEntry(entryData);

      expect(result).toEqual(createdEntry);
      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        where: { code: { in: ['1010', '4010'] } },
      });
      expect(prismaMock.journalEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'POSTED',
            lines: {
              create: [
                { accountId: 1, debit: 100, credit: 0, description: undefined },
                { accountId: 2, debit: 0, credit: 100, description: undefined },
              ],
            },
          }),
        }),
      );
    });

    it('rejects an entry that is off by one cent', async () => {
      const entryData = {
        description: 'Off by a cent',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '4010', debit: 0, credit: 100.01 },
        ],
      };

      await expect(service.createJournalEntry(entryData)).rejects.toThrow(
        'Journal entry unbalanced',
      );
    });

    it('returns the existing entry when the reference was already posted (outbox retry)', async () => {
      const entryData = {
        reference: 'ORD-42',
        description: 'Duplicate delivery',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '4010', debit: 0, credit: 100 },
        ],
      };

      prismaMock.account.findMany.mockResolvedValue(mockAccounts as any);
      prismaMock.journalEntry.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: ['reference'] },
        }),
      );

      const existingEntry = { id: 7, reference: 'ORD-42', lines: [] };
      prismaMock.journalEntry.findUnique.mockResolvedValue(
        existingEntry as any,
      );

      const result = await service.createJournalEntry(entryData);

      expect(result).toEqual(existingEntry);
      expect(prismaMock.journalEntry.findUnique).toHaveBeenCalledWith({
        where: { reference: 'ORD-42' },
        include: { lines: true },
      });
    });
  });

  describe('handleOrderVoided / handleOrderRefunded', () => {
    const orderSnapshot = {
      id: 42,
      branchId: 1,
      netAmount: 150,
      totalCogs: 30,
      paymentMethod: 'CASH',
    };

    it('posts a VOID reversal that mirrors the sale entry', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handleOrderVoided({ order: orderSnapshot } as any);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: 'VOID-ORD-42',
          lines: [
            expect.objectContaining({ accountCode: '1010', credit: 150 }),
            expect.objectContaining({ accountCode: '4010', debit: 150 }),
            expect.objectContaining({ accountCode: '5010', credit: 30 }),
            expect.objectContaining({ accountCode: '1030', debit: 30 }),
          ],
        }),
      );
      createSpy.mockRestore();
    });

    it('posts a REFUND reversal with its own reference (idempotency key)', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handleOrderRefunded({
        order: orderSnapshot,
        reason: 'Wrong drink',
      } as any);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: 'REFUND-ORD-42',
          description: expect.stringContaining('Wrong drink'),
        }),
      );
      createSpy.mockRestore();
    });

    it('skips reversal for zero-value orders', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handleOrderVoided({
        order: { ...orderSnapshot, netAmount: 0, totalCogs: 0 },
      } as any);

      expect(createSpy).not.toHaveBeenCalled();
      createSpy.mockRestore();
    });
  });

  describe('handlePurchaseOrderReceived', () => {
    it('recognizes inventory and accounts payable for the PO total', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handlePurchaseOrderReceived({
        poNumber: 'PO-000123',
        branchId: 2,
        totalAmount: 1234.56,
      } as any);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: 'PO-000123',
          lines: [
            expect.objectContaining({ accountCode: '1030', debit: 1234.56 }),
            expect.objectContaining({ accountCode: '2010', credit: 1234.56 }),
          ],
        }),
      );
      createSpy.mockRestore();
    });

    it('ignores zero-amount receipts', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handlePurchaseOrderReceived({
        poNumber: 'PO-000124',
        branchId: 2,
        totalAmount: 0,
      } as any);

      expect(createSpy).not.toHaveBeenCalled();
      createSpy.mockRestore();
    });
  });

  describe('handleProductionCompleted', () => {
    it('posts finished goods at standard cost with variance to 5030', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handleProductionCompleted({
        orderNumber: 'PRD-001',
        targetIngredientName: 'Cold Brew Concentrate',
        branchId: 1,
        totalRawCost: 90,
        finishedGoodsValue: 100,
      } as any);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: 'PRD-001',
          lines: [
            expect.objectContaining({ accountCode: '1030', debit: 100 }),
            expect.objectContaining({ accountCode: '1030', credit: 90 }),
            expect.objectContaining({ accountCode: '5030', credit: 10 }),
          ],
        }),
      );

      createSpy.mockRestore();
    });

    it('skips the entry when conversion happens exactly at cost', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handleProductionCompleted({
        orderNumber: 'PRD-002',
        targetIngredientName: 'Syrup',
        branchId: 1,
        totalRawCost: 50,
        finishedGoodsValue: 50,
      } as any);

      expect(createSpy).not.toHaveBeenCalled();
      createSpy.mockRestore();
    });
  });

  describe('handleOrderCreated', () => {
    it('uses the payment clearing account for card sales', async () => {
      const createSpy = jest
        .spyOn(service, 'createJournalEntry')
        .mockResolvedValue({ id: 1 } as any);

      await service.handleOrderCreated({
        order: {
          id: 42,
          branchId: 1,
          netAmount: 150,
          totalCogs: 30,
          paymentMethod: 'CREDIT_CARD',
        },
      } as any);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          lines: expect.arrayContaining([
            expect.objectContaining({
              accountCode: '1040',
              debit: 150,
              description: 'Card payment received',
            }),
          ]),
        }),
      );

      createSpy.mockRestore();
    });
  });
});
