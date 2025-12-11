
import { PrismaClient, UserRole, TeamRole } from '@prisma/client';

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
        role: UserRole.ORGANIZATION_ADMIN,
        organizationName: 'Demo Org',
        isAdmin: true,
      }
    });
  } else {
    console.log('User found:', user.email, user.role);
    // Ensure role and org
    if (user.role !== UserRole.ORGANIZATION_ADMIN || !user.organizationName) {
        console.log('Updating user role/org...');
        user = await prisma.user.update({
            where: { id: user.id },
            data: { 
                role: UserRole.ORGANIZATION_ADMIN,
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
              role: UserRole.ORGANIZATION_ADMIN,
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
      { name: 'John Doe', email: 'john@example.com', role: UserRole.ATHLETE },
      { name: 'Jane Smith', email: 'jane@example.com', role: UserRole.ATHLETE },
      { name: 'Coach Mike', email: 'mike@example.com', role: UserRole.TRAINER },
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
      // Map UserRole to TeamRole if possible or defaulting to MEMBER/ATHLETE if that's what TeamRole has
      // Assuming TeamRole has ATHLETE/TRAINER based on previous frontend code, OR we match logic.
      // If TeamRole is owner/admin/member, then we need mapping.
      // Let's assume TeamRole has similar values or we map 'athlete' -> 'MEMBER'? 
      // Actually in frontend we saw user passing 'ATHLETE'/'TRAINER' to team member API.
      // So TeamRole probably mirrors UserRole in this design?
      // Let's try to use the same enum value if types allow, or cast to any if stuck, but try TeamRole.ATHLETE if exists.
      // Safer: Just cast to TeamRole for now as I can't check the generated client Enum easily without reading d.ts which was erroring.
      // But based on user input, it expects Uppercase.
      
      let teamRole: TeamRole;
      if (m.role === UserRole.TRAINER) {
          // If TeamRole has TRAINER, use it. If not, use MEMBER + isTrainer flag? No, schema refactor says Enum.
          // Let's assume the schema has TRAINER in TeamRole per previous findings.
           teamRole = 'TRAINER' as TeamRole; 
      } else {
           teamRole = 'ATHLETE' as TeamRole;
      }

      if (teamAlpha && m.email.includes('john')) {
          await addToTeam(teamAlpha.id, mUser.id, teamRole);
      }
      if (teamBeta && (m.email.includes('jane') || m.email.includes('mike'))) {
          await addToTeam(teamBeta.id, mUser.id, teamRole);
      }
  }

  console.log('Seeding complete.');
}

async function addToTeam(teamId: string, userId: string, role: TeamRole) {
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
