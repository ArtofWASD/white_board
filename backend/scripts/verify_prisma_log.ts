
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const logFile = path.join(__dirname, 'verify_log.txt');

function log(msg: string) {
  fs.appendFileSync(logFile, msg + '\n');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    log('Connecting...');
    await prisma.$connect();
    log('Connected.');
    
    // Try to fetch one user
    const user = await prisma.user.findFirst();
    log('User found: ' + (user ? user.email : 'No user'));

    if (user) {
        log('User ID: ' + user.id);
    }
    
  } catch (e) {
    log('Error: ' + e);
    if (e instanceof Error) {
        log(e.stack || '');
    }
  } finally {
    await prisma.$disconnect();
    log('Done.');
  }
}

main().catch(e => log('Fatal: ' + e));
