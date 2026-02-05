
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
  console.log('--- Debugging Events Visibility ---');

  // 1. List all users and their roles
  const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, organizationName: true }
  });
  console.log(`Found ${users.length} users.`);

  // 2. Iterate over a few specific users (Trainers) and check what events they see
  const targetEmails = ['ivan@example.com', 'rocky@example.com']; 
  // Should also check if there are any new users created by the user, but I don't know their email.
  // I will check the last created user.
  const lastUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
  if (lastUser && !targetEmails.includes(lastUser.email)) {
      targetEmails.push(lastUser.email);
  }

  for (const email of targetEmails) {
      const user = users.find(u => u.email === email);
      if (!user) continue;

      console.log(`\nChecking for User: ${user.name} (${user.email}) [${user.role}]`);

      // Replicating EventsService.getEventsByUserId logic
      let events = [];
      
      const userId = user.id;

      // Logic copy-paste from Service
      if (user.role === 'ORGANIZATION_ADMIN' && user.organizationName) { // NOTE: Enum casing might be different? Schema says ORGANIZATION_ADMIN
         console.log('User is Org Admin');
         // ... Org logic
      } else {
         console.log('User is Normal User');
         
         const userTeams = await prisma.teamMember.findMany({
            where: { userId },
            select: { teamId: true },
         });
         const memberTeamIds = userTeams.map(t => t.teamId);

         const ownedTeams = await prisma.team.findMany({
            where: { ownerId: userId },
            select: { id: true }
         });
         const ownedTeamIds = ownedTeams.map(t => t.id);

         const teamIds = [...new Set([...memberTeamIds, ...ownedTeamIds])];
         console.log(`User teams: ${teamIds.length} found`);

         const teamMembers = await prisma.teamMember.findMany({
            where: { teamId: { in: teamIds } },
            select: { userId: true }
         });
         const allMemberIds = [...new Set(teamMembers.map(m => m.userId))];

         events = await prisma.event.findMany({
            where: {
              OR: [
                { userId: userId }, 
                { teamId: { in: teamIds } }, 
                { userId: { in: allMemberIds } } 
              ],
            },
            select: { id: true, title: true, scheme: true, userId: true, teamId: true }
         });
      }

      console.log(`Found ${events.length} events for ${user.name}:`);
      events.forEach(e => {
          console.log(` - [${e.scheme || 'N/A'}] ${e.title} (Owner: ${e.userId}, Team: ${e.teamId})`);
      });
  }
}

main()
  .catch(e => {
      console.error(e);
      process.exit(1);
  })
  .finally(async () => {
      await prisma.$disconnect();
  });
