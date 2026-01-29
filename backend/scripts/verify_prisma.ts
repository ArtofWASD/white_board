
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Connecting...');
    await prisma.$connect();
    console.log('Connected.');
    
    // Try to fetch one user
    const user = await prisma.user.findFirst();
    console.log('User found:', user ? user.email : 'No user');

    if (user) {
        // Try to fetch with relations if possible, or just check basic structure
        console.log('User ID:', user.id);
    }
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
