
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    const users = await prisma.user.findMany({
      select: {
         id: true,
         email: true,
         role: true
      }
    });

    console.log('Total users found:', users.length);
    if (users.length > 0) {
      console.log('Sample users:', JSON.stringify(users.slice(0, 5), null, 2));
    }
    
    // Check for specific queries
    const athletesLowercase = await prisma.user.findMany({ where: { role: 'athlete' as any } }); // cast to any to bypass type check if literal is enforced
    console.log("Query role='athlete' found:", athletesLowercase.length);

    const athletesUppercase = await prisma.user.findMany({ where: { role: 'ATHLETE' as any } });
    console.log("Query role='ATHLETE' found:", athletesUppercase.length);
    
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
