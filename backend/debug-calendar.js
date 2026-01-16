
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function log(message) {
  try {
    fs.appendFileSync('debug_output.txt', message + '\n');
  } catch (err) {
    // ignore
  }
}

async function main() {
  // Clear previous log
  try { fs.unlinkSync('debug_output.txt'); } catch (e) {}
  
  log('--- START SIMPLE DEBUG ---');
  
  try {
      const users = await prisma.user.findMany({
          take: 5
      });
      log(`Checking ${users.length} users...`);

      for (const user of users) {
          log(`\nUser: ${user.name} (${user.id})`);
          
          // Member Teams
          const members = await prisma.teamMember.findMany({ where: { userId: user.id } });
          const memberIds = members.map(m => m.teamId);
          log(`- Member Teams: ${memberIds.length}`);

          // Owned Teams
          const owned = await prisma.team.findMany({ where: { ownerId: user.id } });
          const ownedIds = owned.map(t => t.id);
          log(`- Owned Teams: ${ownedIds.length}`);
          
          const allTeamIds = [...new Set([...memberIds, ...ownedIds])];
          log(`- Total Unique Teams: ${allTeamIds.length} -> [${allTeamIds}]`);
          
          if (allTeamIds.length === 0) {
             // Even with no teams, we should see personal events if logic allows
             log(`- No teams for user, checking personal only...`);
          }

          // Events Query Logic (Replicating Service)
          const teamMembers = await prisma.teamMember.findMany({
              where: { teamId: { in: allTeamIds } },
              select: { userId: true }
          });
          const allMemberIds = [...new Set(teamMembers.map(m => m.userId))];

          const events = await prisma.event.findMany({
              where: {
                  OR: [
                      { userId: user.id }, // Personal events
                      { teamId: { in: allTeamIds } }, // Team events
                      { userId: { in: allMemberIds } } // Teammate events
                  ]
              },
              select: { id: true, title: true, teamId: true, userId: true }
          });
          
          log(`- Events Found (Backend Query logic): ${events.length}`);
          
          if (events.length > 0) {
             const personal = events.filter(e => e.userId === user.id && !e.teamId).length;
             const assigned = events.filter(e => e.teamId && allTeamIds.includes(e.teamId)).length;
             const others = events.length - personal - assigned;
             log(`  > Personal: ${personal}, Assigned: ${assigned}, Others (Teammates): ${others}`);
             
             // Check specific 'All Teams' logic
             const frontendVisible = events.filter(e => true); // 'all_teams' now returns true
             log(`  > Frontend 'All Teams' Visible Count: ${frontendVisible.length}`);
          }
      }

  } catch (e) {
      log('Error: ' + e.message);
  } finally {
      await prisma.$disconnect();
  }
  log('--- END SIMPLE DEBUG ---');
}

main();
