import { Test, TestingModule } from '@nestjs/testing';
import { ModifiersService } from './modifiers.service';
import {
  MockPrismaService,
  PrismaServiceMockProvider,
} from '../prisma/prisma.service.mock';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ModifiersService', () => {
  let service: ModifiersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModifiersService, PrismaServiceMockProvider],
    }).compile();

    service = module.get(ModifiersService);
    prisma = module.get(PrismaService);
  });

  it('creates a modifier group with options', async () => {
    prisma.modifierGroup.create.mockResolvedValue({
      id: 1,
      name: 'Milk Type',
      options: [],
    } as any);

    await service.createGroup({
      name: 'Milk Type',
      category: 'Coffee',
      options: [{ name: 'Oat', priceDelta: 15 }],
    });

    expect(prisma.modifierGroup.create).toHaveBeenCalled();
  });

  it('blocks deleting options used on orders', async () => {
    prisma.modifierOption.findUnique.mockResolvedValue({ id: 1 } as any);
    prisma.orderItemModifier.count.mockResolvedValue(2);

    await expect(service.deleteOption(1)).rejects.toThrow(BadRequestException);
  });
});
