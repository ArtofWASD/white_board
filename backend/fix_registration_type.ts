
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Correcting Registration Types based on Feedback...');

  // 1. Admin/Organization
  const admins = await prisma.user.updateMany({
    where: { role: UserRole.ORGANIZATION_ADMIN },
    data: { userType: 'organization' } 
  });
  console.log(`Updated ${admins.count} admins to 'organization'`);

  // 2. Trainers
  const trainers = await prisma.user.updateMany({
    where: { role: UserRole.TRAINER },
    data: { userType: 'trainer' }
  });
  console.log(`Updated ${trainers.count} trainers to 'trainer'`);

  // 3. Athletes
  const athletes = await prisma.user.updateMany({
    where: { role: UserRole.ATHLETE },
    data: { userType: 'athlete' }
  });
  console.log(`Updated ${athletes.count} athletes to 'athlete'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
