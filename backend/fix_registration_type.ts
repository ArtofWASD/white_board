
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Correcting Registration Types based on Feedback...');

  // 1. Admin/Organization
  // User said "administrator", checking auth.service it uses "organization" for special logic. 
  // I will use "organization" for organization_admin to align with that check, 
  // or "organization_admin" if the user strictly meant the role name.
  // Given "userType === 'organization'" is in code, 'organization' is safer for Admin.
  const admins = await prisma.user.updateMany({
    where: { role: 'organization_admin' },
    data: { userType: 'organization' } 
  });
  console.log(`Updated ${admins.count} admins to 'organization'`);

  // 2. Trainers
  const trainers = await prisma.user.updateMany({
    where: { role: 'trainer' },
    data: { userType: 'trainer' }
  });
  console.log(`Updated ${trainers.count} trainers to 'trainer'`);

  // 3. Athletes
  const athletes = await prisma.user.updateMany({
    where: { role: 'athlete' },
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
