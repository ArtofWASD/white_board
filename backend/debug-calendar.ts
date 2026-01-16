
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- START DEBUG ---');
  
  // 1. List all users with their roles
  const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
  });
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
      console.log(`\nChecking User: ${user.name} (${user.id})`);
      
      // 2. Get Member Teams
      const memberTeams = await prisma.teamMember.findMany({
          where: { userId: user.id },
          include: { team: true }
      });
      const memberTeamIds = memberTeams.map(m => m.teamId);
      console.log(`- Member of Teams: ${memberTeamIds.length} -> [${memberTeamIds.map(id => id.substring(0,8)).join(', ')}]`);

      // 3. Get Owned Teams
      const ownedTeams = await prisma.team.findMany({
          where: { ownerId: user.id }
      });
      const ownedTeamIds = ownedTeams.map(t => t.id);
      console.log(`- Owns Teams: ${ownedTeams.length} -> [${ownedTeamIds.map(id => id.substring(0,8)).join(', ')}]`);

      // 4. Combined Team IDs
      const allTeamIds = [...new Set([...memberTeamIds, ...ownedTeamIds])];
      console.log(`- Total Unique Relevant Teams: ${allTeamIds.length}`);

      if (allTeamIds.length > 0) {
          // 5. Get All Members of these combined teams
          const teamMembers = await prisma.teamMember.findMany({
              where: { teamId: { in: allTeamIds } },
              select: { userId: true, teamId: true }
          });
          const allMemberIds = [...new Set(teamMembers.map(m => m.userId))];
          console.log(`- Total Extended Network (Teammates): ${allMemberIds.length} users`);

          // 6. Count Potential Events (The Query I implemented)
          const events = await prisma.event.findMany({
              where: {
                  OR: [
                      { userId: user.id },
                      { teamId: { in: allTeamIds } },
                      { userId: { in: allMemberIds } }
                  ]
              },
              select: { id: true, title: true, teamId: true, userId: true }
          });
          
          console.log(`- QUERY RESULT: Found ${events.length} events for this user view.`);
          
          // Breakdown
          const personal = events.filter(e => e.userId === user.id && !e.teamId).length;
          const assigned = events.filter(e => e.teamId && allTeamIds.includes(e.teamId)).length;
          const teammate = events.filter(e => e.userId !== user.id && !e.teamId).length; // Personal events of teammates?
          const other = events.length - personal - assigned - teammate;
          
          console.log(`  -> Personal (unassigned): ${personal}`);
          console.log(`  -> Team Assigned: ${assigned}`);
          console.log(`  -> Teammates Personal: ${teammate}`);
          console.log(`  -> Other/Mixed: ${other}`);
          
          if (events.length > 0) {
              console.log(`  -> Sample Event: ${events[0].title} (Team: ${events[0].teamId}, User: ${events[0].userId})`);
          }
      }
  }
  
  console.log('--- END DEBUG ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
