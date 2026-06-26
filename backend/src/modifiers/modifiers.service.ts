import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModifiersService {
  constructor(private prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.modifierGroup.findMany({
      where: category
        ? { OR: [{ category: null }, { category }] }
        : undefined,
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
