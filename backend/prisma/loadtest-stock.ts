import { writeFileSync } from 'fs';
import { join } from 'path';
import { disconnectPrisma, getPrisma } from './seed/client';

const STOCK_PER_INGREDIENT = 5_000_000;
const BATCH_COUNT = 12;
const TARGET_FILE = join(__dirname, '..', '..', 'loadtest', 'target.json');

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'db', 'postgres']);

function assertLocalDatabase(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Refusing to run: DATABASE_URL is not set.');
    process.exit(1);
  }

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    console.error('Refusing to run: DATABASE_URL is not a valid connection string.');
    process.exit(1);
  }

  if (!LOCAL_HOSTS.has(host)) {
    console.error(
      `Refusing to inflate stock on a non-local database (host=${host}). ` +
        'The load-test fixture is only meant for a throwaway local stack.',
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  assertLocalDatabase();

  const prisma = getPrisma();

  try {
    const product = await prisma.product.findFirst({
      where: { isActive: true, recipeItems: { some: {} } },
      include: { recipeItems: { include: { ingredient: true } } },
      orderBy: { id: 'asc' },
    });

    if (!product) {
      throw new Error('No active product with a recipe was found. Run the demo seed first.');
    }

    const branch = await prisma.branch.findFirst({
      where: { isCentralKitchen: false },
      orderBy: { id: 'asc' },
    });

    if (!branch) {
      throw new Error('No branch was found. Run the demo seed first.');
    }

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);

    for (const item of product.recipeItems) {
      await prisma.branchInventory.upsert({
        where: {
          branchId_ingredientId: {
            branchId: branch.id,
            ingredientId: item.ingredientId,
          },
        },
        create: {
          branchId: branch.id,
          ingredientId: item.ingredientId,
          stock: STOCK_PER_INGREDIENT,
          minStock: 0,
        },
        update: { stock: STOCK_PER_INGREDIENT },
      });

      await prisma.inventoryBatch.createMany({
        data: Array.from({ length: BATCH_COUNT }, (_, index) => ({
          branchId: branch.id,
          ingredientId: item.ingredientId,
          quantity: STOCK_PER_INGREDIENT / BATCH_COUNT,
          expiryDate: new Date(expiryDate.getTime() + index * 86_400_000),
          status: 'ACTIVE' as const,
        })),
      });
    }

    const target = {
      productId: product.id,
      productName: product.name,
      branchId: branch.id,
      branchName: branch.name,
      ingredientCount: product.recipeItems.length,
    };

    writeFileSync(TARGET_FILE, `${JSON.stringify(target, null, 2)}\n`);

    console.log('Load-test stock is ready.');
    console.log(`  Product     : ${product.name} (id ${product.id})`);
    console.log(`  Branch      : ${branch.name} (id ${branch.id})`);
    console.log(`  Ingredients : ${product.recipeItems.length}`);
    console.log(`  Stock each  : ${STOCK_PER_INGREDIENT.toLocaleString()} across ${BATCH_COUNT} batches`);
    console.log(`  Target file : ${TARGET_FILE}`);
  } finally {
    await disconnectPrisma();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
