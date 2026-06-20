export class OrderCreatedEvent {
  constructor(
    public readonly order: any, // Ideally type it as Order from Prisma
    public readonly ingredientRequirements: Map<number, number>,
    public readonly branchId: number,
    public readonly customerId: number | null
  ) {}
}
