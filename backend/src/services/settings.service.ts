import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SETTINGS = {
  'REGISTRATION_ATHLETE': 'true',
  'REGISTRATION_TRAINER': 'true',
  'REGISTRATION_ORGANIZATION': 'true',
  'MAINTENANCE_MODE': 'false',
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  async seedDefaults() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const exists = await this.prisma.systemSetting.findUnique({ where: { key } });
      if (!exists) {
        await this.prisma.systemSetting.create({
          data: { key, value, description: `System setting for ${key}` },
        });
      }
    }
  }

  async getAll() {
    return this.prisma.systemSetting.findMany();
  }

  async getPublic() {
      // Filter only public safe settings
      const settings = await this.prisma.systemSetting.findMany({
          where: {
              key: {
                  in: [
                      'REGISTRATION_ATHLETE',
                      'REGISTRATION_TRAINER',
                      'REGISTRATION_ORGANIZATION',
                      'MAINTENANCE_MODE'
                  ]
              }
          }
      });
      
      // Convert to boolean map
      return settings.reduce((acc, curr) => {
          acc[curr.key] = curr.value === 'true';
          return acc;
      }, {});
  }

  async update(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
