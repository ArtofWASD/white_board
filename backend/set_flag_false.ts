
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
  const updated = await prisma.systemSetting.update({
    where: { key: 'HIDE_BLOG_CONTENT' },
    data: { value: 'false' }
  });
  console.log('UPDATED SETTING:', updated);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
