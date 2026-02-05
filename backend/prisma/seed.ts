import { PrismaClient, UserRole, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Hash password once
  const password = await bcrypt.hash('password123', 10);

  // Create Organization
  const org = await prisma.organization.create({
    data: {
        name: 'Global Gym'
    }
  });

  // Create Organizer
  await prisma.user.create({
    data: {
        name: 'Organizer',
        email: 'organizer@example.com',
        password,
        role: UserRole.ORGANIZATION_ADMIN,
        organizationId: org.id
    }
  });
  console.log('Created Organizer: organizer@example.com');

  // Create Trainers (2)
  for (let i = 1; i <= 2; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Trainer ${i}`,
        email: `trainer${i}@example.com`,
        password,
        role: UserRole.TRAINER,
        gender: Gender.MALE,
        organizationId: org.id,
        isAdmin: true
      },
    });
    console.log(`Created trainer: ${user.email}`);
  }

  // Create Athletes (10)
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Athlete ${i}`,
        email: `athlete${i}@example.com`,
        password,
        role: UserRole.ATHLETE,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        height: 170 + Math.floor(Math.random() * 20),
        weight: 60 + Math.floor(Math.random() * 30),
        organizationId: org.id,
      },
    });
    console.log(`Created athlete: ${user.email}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
