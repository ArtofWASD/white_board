
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hardcoded trainer email based on user context or we can list all trainers
  const trainerEmail = 'chunl3e666@yabdex.ru'; 
  console.log(`Looking for trainer: ${trainerEmail}`);

  const trainer = await prisma.user.findUnique({
    where: { email: trainerEmail },
  });

  if (!trainer) {
    console.log('Trainer not found');
    return;
  }

  console.log(`Trainer ID: ${trainer.id}`);

  // 1. Get Teams
  const teams = await prisma.team.findMany({
    where: { ownerId: trainer.id },
    include: {
        members: {
            include: {
                user: true
            }
        }
    }
  });

  console.log(`Found ${teams.length} teams.`);

  const allMembers = teams.flatMap(t => t.members.map(m => m.user));
  const uniqueAthletes = Array.from(new Set(allMembers.map(u => u.id)))
      .map(id => allMembers.find(u => u.id === id));

  console.log(`Found ${uniqueAthletes.length} unique athletes.`);
  uniqueAthletes.forEach(a => {
      console.log(` - Athlete: ${a?.name} (${a?.email}) ID: ${a?.id}`);
  });

  const athleteIds = uniqueAthletes.map(u => u?.id).filter(id => id !== undefined) as string[];

  if (athleteIds.length === 0) {
      console.log("No athletes found in teams.");
      return;
  }

  // 2. Check Strength Data (Any date)
  const strengthCount = await prisma.strengthWorkoutResult.count({
      where: {
          userId: { in: athleteIds }
      }
  });
  console.log(`Total Strength Results for these athletes (all time): ${strengthCount}`);

  // Check last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentStrengthCount = await prisma.strengthWorkoutResult.count({
      where: {
          userId: { in: athleteIds },
          date: { gte: thirtyDaysAgo }
      }
  });
  console.log(`Strength Results (last 30 days): ${recentStrengthCount}`);

  // 3. Check Event Results (Any date)
  const eventResultCount = await prisma.eventResult.count({
       where: {
             OR: [
                { userId: { in: athleteIds } },
                { event: { userId: { in: athleteIds } } }
             ]
        }
  });
  console.log(`Total Event Results linked to athletes (all time): ${eventResultCount}`);

    const recentEventCount = await prisma.eventResult.count({
       where: {
             OR: [
                { userId: { in: athleteIds } },
                { event: { userId: { in: athleteIds } } }
             ],
             dateAdded: { gte: thirtyDaysAgo }
        }
  });
  console.log(`Event Results (last 30 days): ${recentEventCount}`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
