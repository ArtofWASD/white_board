import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('PrismaService: Подключено к БД.');
    console.log('PrismaService: Модель User существует:', !!this.user);
    console.log(
      'PrismaService: Модель UserExercise существует:',
      !!this.userExercise,
    );
    console.log(
      'PrismaService: Модель ContentExercise существует:',
      !!this.contentExercise,
    );
  }
}
