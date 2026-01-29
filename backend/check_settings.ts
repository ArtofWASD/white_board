import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const settings = await prisma.systemSetting.findMany();
  console.log('ALL SETTINGS:', settings);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
