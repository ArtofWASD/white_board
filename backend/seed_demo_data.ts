
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  console.log(`Checking user: ${email}`);
  
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found. Creating demo user...');
    user = await prisma.user.create({
      data: {
        name: 'Demo Admin',
        email: email,
        password: 'password123', // In real app should be hashed, but for dev/test env maybe okay if auth allows plain or we restart
        role: 'organization_admin',
        organizationName: 'Demo Org',
        isAdmin: true,
      }
    });
  } else {
    console.log('User found:', user.email, user.role);
    // Ensure role and org
    if (user.role !== 'organization_admin' || !user.organizationName) {
        console.log('Updating user role/org...');
        user = await prisma.user.update({
            where: { id: user.id },
            data: { 
                role: 'organization_admin',
                organizationName: user.organizationName || 'Demo Org'
            }
        });
    }
  }

  const orgName = user.organizationName!;
  console.log(`Using Organization: ${orgName}`);

  // Create another Admin in same Org
  const otherAdminEmail = 'partner@example.com';
  let partner = await prisma.user.findUnique({ where: { email: otherAdminEmail } });
  if (!partner) {
      partner = await prisma.user.create({
          data: {
              name: 'Partner Admin',
              email: otherAdminEmail,
              password: 'password123',
              role: 'organization_admin',
              organizationName: orgName
          }
      });
  }

  // Create Teams
  const teamsData = [
      { name: 'Alpha Team', description: 'Main squad', ownerId: user.id },
      { name: 'Beta Team', description: 'Development squad', ownerId: partner.id }, // Owned by partner, but same org
  ];

  for (const t of teamsData) {
      const existing = await prisma.team.findFirst({ where: { name: t.name, ownerId: t.ownerId } });
      if (!existing) {
          await prisma.team.create({
              data: {
                  name: t.name,
                  description: t.description,
                  ownerId: t.ownerId,
                  organizationName: orgName // Vital for the new feature
              }
          });
          console.log(`Created team: ${t.name}`);
      } else {
          // Update org name if missing (backfill)
          if (!existing.organizationName) {
              await prisma.team.update({
                  where: { id: existing.id },
                  data: { organizationName: orgName }
              });
              console.log(`Updated team org: ${t.name}`);
          }
      }
  }

  // Create Athletes and Trainers
  const members = [
      { name: 'John Doe', email: 'john@example.com', role: 'athlete' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'athlete' },
      { name: 'Coach Mike', email: 'mike@example.com', role: 'trainer' },
  ];

  const teamAlpha = await prisma.team.findFirst({ where: { name: 'Alpha Team' } });
  const teamBeta = await prisma.team.findFirst({ where: { name: 'Beta Team' } });

  for (const m of members) {
      let mUser = await prisma.user.findUnique({ where: { email: m.email } });
      if (!mUser) {
          mUser = await prisma.user.create({
              data: {
                  name: m.name,
                  email: m.email,
                  password: 'password123',
                  role: m.role
              }
          });
          console.log(`Created user: ${m.name}`);
      }

      // Add to teams
      if (teamAlpha && m.email.includes('john')) {
          await addToTeam(teamAlpha.id, mUser.id, m.role);
      }
      if (teamBeta && (m.email.includes('jane') || m.email.includes('mike'))) {
          await addToTeam(teamBeta.id, mUser.id, m.role);
      }
  }

  console.log('Seeding complete.');
}

async function addToTeam(teamId: string, userId: string, role: string) {
    try {
        await prisma.teamMember.create({
            data: { teamId, userId, role }
        });
        console.log(`Added user ${userId} to team ${teamId}`);
    } catch (e) {
        // Ignore duplicate constraints
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
