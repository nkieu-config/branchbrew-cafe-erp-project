import { OrderStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { InventoryHelper } from './inventory.helper';
import { buildIngredientRequirementsFromOrderItems } from './recipe-requirements.helper';

export const ORDER_REVERSAL_INCLUDE = {
  items: {
    include: {
      product: { include: { recipeItems: true } },
      modifiers: {
        include: {
          option: { include: { group: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderForReversal = Prisma.OrderGetPayload<{
  include: typeof ORDER_REVERSAL_INCLUDE;
}>;

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === 'CANCELLED' || status === 'REFUNDED';
}

/** Restore inventory and reverse loyalty points for a void/refund. */
export async function applyOrderReversalEffects(
  tx: Prisma.TransactionClient,
  order: OrderForReversal,
): Promise<void> {
  const ingredientRequirements = buildIngredientRequirementsFromOrderItems(
    order.items,
  );

  if (ingredientRequirements.size > 0) {
    await InventoryHelper.restoreInventory(
      tx,
      order.branchId,
      ingredientRequirements,
    );
  }

  if (order.customerId) {
    const pointsDelta = order.pointsRedeemed - order.pointsEarned;
    if (pointsDelta !== 0) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { points: { increment: pointsDelta } },
      });
    }
  }
}
