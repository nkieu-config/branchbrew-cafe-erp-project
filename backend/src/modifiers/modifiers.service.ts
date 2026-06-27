import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateModifierGroupDto,
  CreateModifierOptionForGroupDto,
  UpdateModifierGroupDto,
  UpdateModifierOptionDto,
} from './dto/modifier.dto';

const groupInclude = {
  swapIngredient: { select: { id: true, name: true, unit: true } },
  options: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      swapToIngredient: { select: { id: true, name: true, unit: true } },
    },
  },
};

@Injectable()
export class ModifiersService {
  constructor(private prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.modifierGroup.findMany({
      where: category ? { OR: [{ category: null }, { category }] } : undefined,
      include: groupInclude,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createGroup(dto: CreateModifierGroupDto) {
    const { options, ...groupData } = dto;
    return this.prisma.modifierGroup.create({
      data: {
        ...groupData,
        options: options?.length ? { create: options } : undefined,
      },
      include: groupInclude,
    });
  }

  async updateGroup(id: number, dto: UpdateModifierGroupDto) {
    await this.ensureGroup(id);
    return this.prisma.modifierGroup.update({
      where: { id },
      data: dto,
      include: groupInclude,
    });
  }

  async deleteGroup(id: number) {
    await this.ensureGroup(id);
    await this.prisma.modifierGroup.delete({ where: { id } });
    return { id, deleted: true };
  }

  async createOption(dto: CreateModifierOptionForGroupDto) {
    await this.ensureGroup(dto.groupId);
    const { groupId, ...optionData } = dto;
    return this.prisma.modifierOption.create({
      data: { ...optionData, groupId },
      include: {
        swapToIngredient: { select: { id: true, name: true, unit: true } },
        group: { select: { id: true, name: true } },
      },
    });
  }

  async updateOption(id: number, dto: UpdateModifierOptionDto) {
    await this.ensureOption(id);
    return this.prisma.modifierOption.update({
      where: { id },
      data: dto,
      include: {
        swapToIngredient: { select: { id: true, name: true, unit: true } },
        group: { select: { id: true, name: true } },
      },
    });
  }

  async deleteOption(id: number) {
    await this.ensureOption(id);
    const used = await this.prisma.orderItemModifier.count({
      where: { optionId: id },
    });
    if (used > 0) {
      throw new BadRequestException(
        'Cannot delete modifier option that was used on past orders.',
      );
    }
    await this.prisma.modifierOption.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureGroup(id: number) {
    const group = await this.prisma.modifierGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException(`Modifier group ${id} not found`);
    return group;
  }

  private async ensureOption(id: number) {
    const option = await this.prisma.modifierOption.findUnique({
      where: { id },
    });
    if (!option) throw new NotFoundException(`Modifier option ${id} not found`);
    return option;
  }
}
