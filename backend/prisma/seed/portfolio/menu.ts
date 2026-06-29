import type { SeedContext } from '../types';

/** Additional cafe menu items for a fuller POS catalog. */
export async function seedPosMenu(ctx: SeedContext): Promise<void> {
  const {
    prisma,
    coffeeBeans,
    milk,
    cup,
    syrup,
    coldBrewBase,
  } = ctx;

  console.log('Seeding POS menu items...');

  const coffeeItems = [
    {
      name: 'Americano',
      price: 55,
      recipe: [
        { ingredientId: coffeeBeans.id, quantity: 18 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Mocha',
      price: 75,
      recipe: [
        { ingredientId: coffeeBeans.id, quantity: 18 },
        { ingredientId: milk.id, quantity: 150 },
        { ingredientId: syrup.id, quantity: 40 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Flat White',
      price: 70,
      recipe: [
        { ingredientId: coffeeBeans.id, quantity: 18 },
        { ingredientId: milk.id, quantity: 130 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Cold Brew',
      price: 80,
      recipe: [
        { ingredientId: coldBrewBase.id, quantity: 200 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Caramel Macchiato',
      price: 78,
      recipe: [
        { ingredientId: coffeeBeans.id, quantity: 18 },
        { ingredientId: milk.id, quantity: 140 },
        { ingredientId: syrup.id, quantity: 35 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Honey Oat Latte',
      price: 92,
      recipe: [
        { ingredientId: coffeeBeans.id, quantity: 18 },
        { ingredientId: ctx.oatMilk.id, quantity: 180 },
        { ingredientId: syrup.id, quantity: 25 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
  ];

  for (const item of coffeeItems) {
    await prisma.product.create({
      data: {
        name: item.name,
        price: item.price,
        category: 'Coffee',
        recipeItems: { create: item.recipe },
      },
    });
  }

  const bakeryItems = [
    { name: 'Chocolate Muffin', price: 55 },
    { name: 'Blueberry Scone', price: 50 },
    { name: 'Ham & Cheese Toast', price: 89 },
    { name: 'Banana Bread Slice', price: 48 },
    { name: 'Chocolate Chip Cookie', price: 35 },
    { name: 'Almond Croissant', price: 58 },
  ];

  for (const item of bakeryItems) {
    await prisma.product.create({
      data: {
        name: item.name,
        price: item.price,
        category: 'Bakery',
        recipeItems: { create: [] },
      },
    });
  }

  const teaItems = [
    {
      name: 'Thai Milk Tea',
      price: 65,
      recipe: [
        { ingredientId: milk.id, quantity: 200 },
        { ingredientId: syrup.id, quantity: 40 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Honey Lemon Tea',
      price: 55,
      recipe: [
        { ingredientId: syrup.id, quantity: 30 },
        { ingredientId: cup.id, quantity: 1 },
      ],
    },
    {
      name: 'Green Tea',
      price: 45,
      recipe: [{ ingredientId: cup.id, quantity: 1 }],
    },
  ];

  for (const item of teaItems) {
    await prisma.product.create({
      data: {
        name: item.name,
        price: item.price,
        category: 'Tea',
        recipeItems: { create: item.recipe },
      },
    });
  }

  const beverageItems = [
    { name: 'Sparkling Water', price: 35 },
    { name: 'Fresh Orange Juice', price: 70 },
    { name: 'Coconut Water', price: 55 },
  ];

  for (const item of beverageItems) {
    await prisma.product.create({
      data: {
        name: item.name,
        price: item.price,
        category: 'Beverage',
        recipeItems: { create: [{ ingredientId: cup.id, quantity: 1 }] },
      },
    });
  }

  // Inactive item — visible in product admin, hidden from POS
  await prisma.product.create({
    data: {
      name: 'Seasonal Pumpkin Spice (Retired)',
      price: 95,
      category: 'Coffee',
      isActive: false,
      recipeItems: {
        create: [
          { ingredientId: coffeeBeans.id, quantity: 18 },
          { ingredientId: milk.id, quantity: 150 },
          { ingredientId: syrup.id, quantity: 50 },
          { ingredientId: cup.id, quantity: 1 },
        ],
      },
    },
  });
}
