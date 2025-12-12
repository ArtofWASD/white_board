
import { PrismaClient, UserRole, TeamRole, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create 2 Trainers
  const trainers = [];
  for (let i = 1; i <= 2; i++) {
    const email = `trainer${i}@test.com`;
    let trainer = await prisma.user.findUnique({ where: { email } });
    if (!trainer) {
      trainer = await prisma.user.create({
        data: {
          name: `Trainer ${i}`,
          email,
          password: 'password123',
          role: UserRole.TRAINER,
        },
      });
      console.log(`Created Trainer: ${trainer.email}`);
    } else {
      console.log(`Trainer already exists: ${trainer.email}`);
    }
    trainers.push(trainer);
  }

  // 2. Create 1 Team (Owned by Trainer 1)
  const teamOwner = trainers[0];
  const teamName = 'Test Team Alpha';
  let team = await prisma.team.findFirst({ where: { name: teamName, ownerId: teamOwner.id } });
  
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: teamName,
        description: 'A test team for development',
        ownerId: teamOwner.id,
      },
    });
    console.log(`Created Team: ${team.name}`);
  } else {
    console.log(`Team already exists: ${team.name}`);
  }

  // 3. Create 10 Athletes
  const athletes = [];
  for (let i = 1; i <= 10; i++) {
    const email = `athlete${i}@test.com`;
    let athlete = await prisma.user.findUnique({ where: { email } });
    if (!athlete) {
      athlete = await prisma.user.create({
        data: {
          name: `Athlete ${i}`,
          email,
          password: 'password123',
          role: UserRole.ATHLETE,
        },
      });
      console.log(`Created Athlete: ${athlete.email}`);
    } else {
        console.log(`Athlete already exists: ${athlete.email}`);
    }
    athletes.push(athlete);
  }

  // 4. Add 4 Athletes to the Team
  const athletesForTeam = athletes.slice(0, 4);
  for (const athlete of athletesForTeam) {
    try {
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: athlete.id,
          role: TeamRole.MEMBER,
        },
      });
      console.log(`Added ${athlete.email} to team ${team.name}`);
    } catch (e) {
      // Ignore if already exists (unique constraint)
      // console.log(`User ${athlete.email} already in team (or error: ${e.message})`);
    }
  }

  // 5. Add 2-3 Events for ALL Athletes
  const eventTitles = ['Morning Run', 'Strength Training', 'Yoga Session', 'Cycle Circuit', 'HIIT Workout'];

  for (const athlete of athletes) {
    // Generate 2 or 3 events randomly
    const numberOfEvents = Math.floor(Math.random() * 2) + 2; // 2 or 3

    for (let k = 0; k < numberOfEvents; k++) {
      const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
      
      // Random date within next 30 days
      const daysFromNow = Math.floor(Math.random() * 30) + 1;
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + daysFromNow);

      await prisma.event.create({
        data: {
          title: randomTitle,
          description: `Test event for ${athlete.name}`,
          eventDate: eventDate,
          status: EventStatus.FUTURE,
          userId: athlete.id,
        },
      });
    }
    console.log(`Created ${numberOfEvents} events for ${athlete.email}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
