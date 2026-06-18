import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.branch.findMany({
      include: {
        _count: {
          select: { users: true, orders: true }
        }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.branch.findUnique({
      where: { id },
      include: { inventories: { include: { ingredient: true } } }
    });
  }
}
