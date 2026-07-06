import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StockCountStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { OUTBOX_EVENT_TYPES } from '../outbox/outbox-event.types';
import { InventoryHelper } from '../common/helpers/inventory.helper';
import { dec, roundMoney } from '../common/decimal.util';
import {
  assertBranchAccess,
  BranchScopedUser,
} from '../auth/branch-scope.util';
import { AUDIT_ACTIONS, AUDIT_TARGETS } from '../audit/audit.service';
import { toStockAdjustedSnapshot } from './domain/stock-adjusted.snapshot';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateStockCountDto,
  ManualAdjustmentDto,
  UpdateStockCountLinesDto,
} from './dto/stock-count.dto';

const OPEN_STOCK_COUNT_STATUSES: StockCountStatus[] = ['DRAFT', 'SUBMITTED'];

@Injectable()
export class StockCountService {
  constructor(
    private prisma: PrismaService,
    private outboxService: OutboxService,
    private notifications: NotificationsService,
  ) {}

  async createStockCount(
    branchId: number,
    user: BranchScopedUser,
    dto: CreateStockCountDto,
  ) {
    const inventories = await this.prisma.branchInventory.findMany({
      where: { branchId, ingredient: { isActive: true } },
      select: { ingredientId: true },
    });
    if (inventories.length === 0) {
      throw new BadRequestException('No inventory to count at this branch.');
    }

    try {
      const count = await this.prisma.stockCount.create({
        data: {
          branchId,
          isBlind: dto.isBlind ?? false,
          notes: dto.notes,
          createdByUserId: user.userId,
          lines: {
            create: inventories.map((inv) => ({
              ingredientId: inv.ingredientId,
            })),
          },
        },
        include: { _count: { select: { lines: true } } },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: AUDIT_ACTIONS.CREATE_STOCK_COUNT,
          targetType: AUDIT_TARGETS.STOCK_COUNT,
          targetId: count.id,
          details: JSON.stringify({
            branchId,
            isBlind: count.isBlind,
            lineCount: count._count.lines,
          }),
        },
      });

      return count;
    } catch (err) {
      if (this.isOpenCountConflict(err)) {
        throw new BadRequestException(
          'An open stock count already exists for this branch. Finish or cancel it first.',
        );
      }
      throw err;
    }
  }

  async getStockCounts(branchId?: number) {
    return this.prisma.stockCount.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        branch: { select: { name: true } },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        _count: { select: { lines: true, adjustments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getStockCount(id: number, user: BranchScopedUser) {
    const count = await this.prisma.stockCount.findUnique({
      where: { id },
      include: {
        branch: { select: { name: true } },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        lines: {
          include: {
            ingredient: {
              select: { id: true, name: true, unit: true, costPerUnit: true },
            },
          },
          orderBy: { ingredient: { name: 'asc' } },
        },
      },
    });
    if (!count) throw new NotFoundException('Stock count not found');
    assertBranchAccess(user, count.branchId);

    const hideLiveStock = count.isBlind && count.status === 'DRAFT';
    let stockByIngredient = new Map<number, number>();
    if (!hideLiveStock) {
      const balances = await this.prisma.branchInventory.findMany({
        where: { branchId: count.branchId },
        select: { ingredientId: true, stock: true },
      });
      stockByIngredient = new Map(
        balances.map((b) => [b.ingredientId, b.stock]),
      );
    }

    return {
      ...count,
      lines: count.lines.map((line) => ({
        ...line,
        currentStock: hideLiveStock
          ? null
          : (stockByIngredient.get(line.ingredientId) ?? 0),
      })),
    };
  }

  async updateLines(
    id: number,
    user: BranchScopedUser,
    dto: UpdateStockCountLinesDto,
  ) {
    const count = await this.prisma.stockCount.findUnique({ where: { id } });
    if (!count) throw new NotFoundException('Stock count not found');
    assertBranchAccess(user, count.branchId);
    if (count.status !== 'DRAFT') {
      throw new BadRequestException(
        'Counted quantities can only be edited while the count is in draft.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const line of dto.lines) {
        const updated = await tx.stockCountLine.updateMany({
          where: { stockCountId: id, ingredientId: line.ingredientId },
          data: { countedQty: line.countedQty },
        });
        if (updated.count === 0) {
          throw new BadRequestException(
            `Ingredient ${line.ingredientId} is not part of this stock count.`,
          );
        }
      }
    });

    return this.getStockCount(id, user);
  }

  async submit(id: number, user: BranchScopedUser) {
    await this.prisma.$transaction(async (tx) => {
      const count = await tx.stockCount.findUnique({
        where: { id },
        include: { lines: true },
      });
      if (!count) throw new NotFoundException('Stock count not found');
      assertBranchAccess(user, count.branchId);
      if (count.status !== 'DRAFT') {
        throw new BadRequestException(
          'Only draft stock counts can be submitted.',
        );
      }

      const countedLines = count.lines.filter((l) => l.countedQty != null);
      if (countedLines.length === 0) {
        throw new BadRequestException(
          'Enter at least one counted quantity before submitting.',
        );
      }

      const balances = await tx.branchInventory.findMany({
        where: { branchId: count.branchId },
        select: { ingredientId: true, stock: true },
      });
      const stockByIngredient = new Map(
        balances.map((b) => [b.ingredientId, b.stock]),
      );

      for (const line of countedLines) {
        await tx.stockCountLine.update({
          where: { id: line.id },
          data: {
            expectedQty: stockByIngredient.get(line.ingredientId) ?? 0,
          },
        });
      }

      const claimed = await tx.stockCount.updateMany({
        where: { id, status: 'DRAFT' },
        data: { status: 'SUBMITTED', submittedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Stock count changed while submitting. Please retry.',
        );
      }
    });

    const submitted = await this.prisma.stockCount.findUnique({
      where: { id },
    });
    if (submitted) {
      await this.notifications.notifyBranch({
        branchId: submitted.branchId,
        type: 'STOCK_COUNT_PENDING',
        title: `Stock count #${id} awaiting approval`,
        link: `/inventory/stocktake/${id}`,
        dedupeKey: `stock-count-${id}`,
      });
    }

    return this.getStockCount(id, user);
  }

  async approve(id: number, user: BranchScopedUser) {
    await this.prisma.$transaction(async (tx) => {
      const count = await tx.stockCount.findUnique({
        where: { id },
        include: { lines: { include: { ingredient: true } } },
      });
      if (!count) throw new NotFoundException('Stock count not found');
      assertBranchAccess(user, count.branchId);
      if (count.status !== 'SUBMITTED') {
        throw new BadRequestException(
          'Only submitted stock counts can be approved.',
        );
      }

      const claimed = await tx.stockCount.updateMany({
        where: { id, status: 'SUBMITTED' },
        data: {
          status: 'APPROVED',
          approvedByUserId: user.userId,
          approvedAt: new Date(),
        },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'Stock count changed while approving. Please retry.',
        );
      }

      let netValue = dec(0);
      let adjustedLines = 0;

      for (const line of count.lines) {
        if (line.countedQty == null || line.expectedQty == null) continue;
        const delta = line.countedQty - line.expectedQty;
        if (delta === 0) continue;

        await this.applyStockDelta(
          tx,
          count.branchId,
          line.ingredientId,
          delta,
        );
        await tx.stockAdjustment.create({
          data: {
            branchId: count.branchId,
            ingredientId: line.ingredientId,
            quantityDelta: delta,
            reason: 'COUNT_VARIANCE',
            stockCountId: count.id,
            createdByUserId: user.userId,
          },
        });

        netValue = netValue.plus(dec(line.ingredient.costPerUnit).times(delta));
        adjustedLines += 1;
      }

      const netVarianceValue = roundMoney(netValue);

      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: AUDIT_ACTIONS.APPROVE_STOCK_COUNT,
          targetType: AUDIT_TARGETS.STOCK_COUNT,
          targetId: count.id,
          details: JSON.stringify({
            branchId: count.branchId,
            adjustedLines,
            netVarianceValue,
          }),
        },
      });

      if (netVarianceValue !== 0) {
        await this.outboxService.enqueue(
          tx,
          OUTBOX_EVENT_TYPES.STOCK_ADJUSTED,
          {
            adjustment: toStockAdjustedSnapshot({
              reference: `STOCKCOUNT-${count.id}`,
              branchId: count.branchId,
              netVarianceValue,
              description: `Stock count #${count.id} variance`,
            }),
          },
        );
      }
    });

    return this.getStockCount(id, user);
  }

  async cancel(id: number, user: BranchScopedUser) {
    const count = await this.prisma.stockCount.findUnique({ where: { id } });
    if (!count) throw new NotFoundException('Stock count not found');
    assertBranchAccess(user, count.branchId);
    if (!OPEN_STOCK_COUNT_STATUSES.includes(count.status)) {
      throw new BadRequestException('Only open stock counts can be cancelled.');
    }

    const cancelled = await this.prisma.stockCount.updateMany({
      where: { id, status: { in: OPEN_STOCK_COUNT_STATUSES } },
      data: { status: 'CANCELLED' },
    });
    if (cancelled.count === 0) {
      throw new BadRequestException(
        'Stock count changed while cancelling. Please retry.',
      );
    }

    return this.prisma.stockCount.findUnique({ where: { id } });
  }

  async createManualAdjustment(
    branchId: number,
    user: BranchScopedUser,
    dto: ManualAdjustmentDto,
  ) {
    if (dto.quantityDelta === 0) {
      throw new BadRequestException('Adjustment quantity cannot be zero.');
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.branchInventory.findUnique({
        where: {
          branchId_ingredientId: { branchId, ingredientId: dto.ingredientId },
        },
        include: { ingredient: true },
      });
      if (!inventory) {
        throw new NotFoundException(
          'Ingredient is not stocked at this branch.',
        );
      }

      await this.applyStockDelta(
        tx,
        branchId,
        dto.ingredientId,
        dto.quantityDelta,
      );

      const adjustment = await tx.stockAdjustment.create({
        data: {
          branchId,
          ingredientId: dto.ingredientId,
          quantityDelta: dto.quantityDelta,
          reason: dto.reason,
          notes: dto.notes,
          createdByUserId: user.userId,
        },
        include: {
          ingredient: {
            select: { id: true, name: true, unit: true, costPerUnit: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: AUDIT_ACTIONS.MANUAL_ADJUSTMENT,
          targetType: AUDIT_TARGETS.STOCK_ADJUSTMENT,
          targetId: adjustment.id,
          details: JSON.stringify({
            branchId,
            ingredientId: dto.ingredientId,
            quantityDelta: dto.quantityDelta,
            reason: dto.reason,
          }),
        },
      });

      const netVarianceValue = roundMoney(
        dec(inventory.ingredient.costPerUnit).times(dto.quantityDelta),
      );
      if (netVarianceValue !== 0) {
        await this.outboxService.enqueue(
          tx,
          OUTBOX_EVENT_TYPES.STOCK_ADJUSTED,
          {
            adjustment: toStockAdjustedSnapshot({
              reference: `ADJ-${adjustment.id}`,
              branchId,
              netVarianceValue,
              description: `Manual stock adjustment #${adjustment.id} (${dto.reason})`,
            }),
          },
        );
      }

      return adjustment;
    });
  }

  async getAdjustments(branchId: number) {
    return this.prisma.stockAdjustment.findMany({
      where: { branchId },
      include: {
        ingredient: {
          select: { id: true, name: true, unit: true, costPerUnit: true },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  private async applyStockDelta(
    tx: Prisma.TransactionClient,
    branchId: number,
    ingredientId: number,
    delta: number,
  ) {
    if (delta < 0) {
      await InventoryHelper.deductInventoryFIFO(
        tx,
        branchId,
        new Map([[ingredientId, -delta]]),
      );
      return;
    }

    await tx.branchInventory.upsert({
      where: { branchId_ingredientId: { branchId, ingredientId } },
      update: { stock: { increment: delta } },
      create: { branchId, ingredientId, stock: delta, minStock: 10 },
    });
    await tx.inventoryBatch.create({
      data: { branchId, ingredientId, quantity: delta, status: 'ACTIVE' },
    });
  }

  private isOpenCountConflict(err: unknown): boolean {
    return (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    );
  }
}
