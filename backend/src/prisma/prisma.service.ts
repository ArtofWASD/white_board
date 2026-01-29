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
    console.log('PrismaService: Connected to DB.');
    console.log('PrismaService: User model exists:', !!(this as any).user);
    console.log('PrismaService: UserExercise model exists:', !!(this as any).userExercise);
    console.log('PrismaService: ContentExercise model exists:', !!(this as any).contentExercise);
  }
}
