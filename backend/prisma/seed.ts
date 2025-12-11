import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash password once
  const password = await bcrypt.hash('password123', 10);

  const trainersData = [
    { name: 'Ivan Drago', email: 'ivan@example.com', gender: 'male' },
    { name: 'Rocky Balboa', email: 'rocky@example.com', gender: 'male' },
    { name: 'Mickey Goldmill', email: 'mickey@example.com', gender: 'male' },
    { name: 'Apollo Creed', email: 'apollo@example.com', gender: 'male' },
    { name: 'Adrian Pennino', email: 'adrian@example.com', gender: 'female' },
  ];

  const athletesNames = [
    'John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'Chris Brown',
    'Patricia Wilson', 'Matthew Taylor', 'Jessica Anderson', 'David Thomas', 'Sarah Martinez',
    'James Jackson', 'Linda White', 'Robert Harris', 'Barbara Martin', 'William Thompson'
  ];

  const trainers: User[] = [];
  const athletes: User[] = [];

  // Create Trainers
  for (const trainer of trainersData) {
    const user = await prisma.user.upsert({
      where: { email: trainer.email },
      update: {
        userType: 'individual', // Update existing users
        role: 'trainer',
      },
      create: {
        name: trainer.name,
        email: trainer.email,
        password,
        role: 'trainer',
        gender: trainer.gender,
        userType: 'individual', // Set for new users
        organizationName: 'Global Gym',
      },
    });
    trainers.push(user);
    console.log(`Created/Updated trainer: ${user.name}`);
  }

  // Create Athletes
  for (let i = 0; i < athletesNames.length; i++) {
    const name = athletesNames[i];
    const email = `athlete${i + 1}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        userType: 'individual', // Update existing users
        role: 'athlete',
      },
      create: {
        name,
        email,
        password,
        role: 'athlete',
        gender: i % 2 === 0 ? 'male' : 'female',
        userType: 'individual', // Set for new users
        height: 170 + Math.floor(Math.random() * 20),
        weight: 60 + Math.floor(Math.random() * 30),
      },
    });
    athletes.push(user);
    console.log(`Created/Updated athlete: ${user.name}`);
  }

  // Create Teams
  const teamNames = ['Thunderbolts', 'Iron Pumpers', 'Cardio Kings'];
  for (let i = 0; i < teamNames.length; i++) {
    const owner = trainers[i % trainers.length];
    
    // Check if team exists to avoid duplicates or errors if unique constraints exist (though this schema doesn't seem to enforce unique team names globally, but good practice)
    // Actually schema doesn't have unique on team name. But let's check basic existence or just create.
    // The previous script just did create, which might duplicate teams if run multiple times. 
    // Let's use findFirst first to avoid spamming teams if they exist with same name and owner.
    
    let team = await prisma.team.findFirst({
        where: { name: teamNames[i], ownerId: owner.id }
    });

    if (!team) {
        team = await prisma.team.create({
            data: {
              name: teamNames[i],
              description: `Training team led by ${owner.name}`,
              ownerId: owner.id,
            },
          });
          console.log(`Created team: ${team.name} owned by ${owner.name}`);
    } else {
        console.log(`Team already exists: ${team.name}`);
    }


    // Add random athletes to team (Upsert logic for team members is cleaner)
    const teamAthletes = athletes.slice(i * 5, (i + 1) * 5);
    for (const athlete of teamAthletes) {
        // Check membership
        const membership = await prisma.teamMember.findUnique({
             where: {
                 teamId_userId: {
                     teamId: team.id,
                     userId: athlete.id
                 }
             }
        });

        if (!membership) {
            await prisma.teamMember.create({
                data: {
                  teamId: team.id,
                  userId: athlete.id,
                  role: 'athlete',
                },
              });
        }
    }
  }

  // Create Events
  const allUsers = [...trainers, ...athletes];
  const eventTitles = ['Morning Run', 'Strength Session', 'Yoga Class', 'HIIT Workout'];

  for (const user of allUsers) {
    // Check if user has events to avoid infinite accumulation
    const eventCount = await prisma.event.count({ where: { userId: user.id } });
    
    if (eventCount < 2) {
         // Create 2-3 events for each user
        const numEvents = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numEvents; i++) {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 10) - 2); // +/- days

            await prisma.event.create({
                data: {
                    title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
                    description: 'Test event description',
                    eventDate: eventDate,
                    userId: user.id,
                    status: 'future',
                    exerciseType: 'General',
                }
            });
        }
        console.log(`Added events for ${user.name}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
