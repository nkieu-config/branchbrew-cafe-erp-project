import type {
  Branch,
  Customer,
  Ingredient,
  ModifierGroup,
  ModifierOption,
  PrismaClient,
  Product,
  Supplier,
  User,
} from '@prisma/client';

export type SeedContext = {
  prisma: PrismaClient;
  mainBranch: Branch;
  secondBranch: Branch;
  centralKitchen: Branch;
  admin: User;
  manager: User;
  staff: User;
  asokManager: User;
  asokStaff: User;
  supplier1: Supplier;
  supplier2: Supplier;
  coffeeBeans: Ingredient;
  milk: Ingredient;
  cup: Ingredient;
  syrup: Ingredient;
  oatMilk: Ingredient;
  almondMilk: Ingredient;
  coldBrewBase: Ingredient;
  icedLatte: Product;
  cappuccino: Product;
  vanillaLatte: Product;
  croissant: Product;
  customer: Customer;
  goldCustomer: Customer;
  tempGroup: ModifierGroup & { options: ModifierOption[] };
};
