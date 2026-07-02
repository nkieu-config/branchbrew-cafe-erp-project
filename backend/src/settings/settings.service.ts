import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseVatRatePercent } from '../common/vat.util';
import { fromDbSettings, toDbSettings } from './settings-keys.util';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    const raw = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );
    return fromDbSettings(raw);
  }

  async getSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async getVatRatePercent(): Promise<number> {
    const raw = await this.getSetting('vat_rate');
    return parseVatRatePercent(raw);
  }

  async updateSettings(data: Record<string, string>, userId: number) {
    const dbData = toDbSettings(data);
    const updates = Object.entries(dbData).map(async ([key, value]) => {
      return this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await Promise.all(updates);

    await this.auditService.logAction(
      userId,
      'UPDATE_SETTINGS',
      'SystemSetting',
      undefined,
      { keys: Object.keys(dbData) },
    );

    return this.getAllSettings();
  }
}
