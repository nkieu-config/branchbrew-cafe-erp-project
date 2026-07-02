import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseVatRatePercent } from '../common/vat.util';
import {
  fromDbSettings,
  SettingsReadable,
  SettingsUpdateInput,
  toDbSettings,
} from './settings-keys.util';
import {
  AuditService,
  AUDIT_ACTIONS,
  AUDIT_TARGETS,
} from '../audit/audit.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllSettings(): Promise<SettingsReadable> {
    const settings = await this.prisma.systemSetting.findMany();
    const raw: Record<string, string> = {};
    for (const setting of settings) {
      raw[setting.key] = setting.value;
    }
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

  async updateSettings(data: SettingsUpdateInput, userId: number) {
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
      AUDIT_ACTIONS.UPDATE_SETTINGS,
      AUDIT_TARGETS.SYSTEM_SETTING,
      undefined,
      { keys: Object.keys(dbData) },
    );

    return this.getAllSettings();
  }
}
