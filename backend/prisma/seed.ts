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

  // Create Organization
  const org = await prisma.organization.create({
    data: {
        name: 'Global Gym'
    }
  });

  // Create Trainers
  for (const trainer of trainersData) {
    const user = await prisma.user.upsert({
      where: { email: trainer.email },
      update: {
        role: 'TRAINER',
      },
      create: {
        name: trainer.name,
        email: trainer.email,
        password,
        role: 'TRAINER',
        gender: trainer.gender === 'male' ? 'MALE' : 'FEMALE',
        organizationId: org.id,
        isAdmin: true
      },
    });
    trainers.push(user);
    console.log(`Created/Updated trainer: ${user.name}`);
  }

  // Create Athletes
  for (let i = 0; i < athletesNames.length; i++) {
    const name = athletesNames[i];
    const email = `athlete${i + 1}@example.com`;
    // Athletes join the same org for demo? Or null? Let's say null for individuals, or same org.
    // Spec says individuals exist.
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ATHLETE',
      },
      create: {
        name,
        email,
        password,
        role: 'ATHLETE',
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
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
    
    let team = await prisma.team.findFirst({
        where: { name: teamNames[i], ownerId: owner.id }
    });

    if (!team) {
        team = await prisma.team.create({
            data: {
              name: teamNames[i],
              description: `Training team led by ${owner.name}`,
              ownerId: owner.id,
              organizationId: org.id // Link to org
            },
          });
          console.log(`Created team: ${team.name} owned by ${owner.name}`);
    } else {
        console.log(`Team already exists: ${team.name}`);
    }


    // Add random athletes to team
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
                  role: 'MEMBER', 
                },
              });
        }
    }
  }

  // Create Events
  const allUsers = [...trainers, ...athletes];
  const eventTitles = ['Morning Run', 'Strength Session', 'Yoga Class', 'HIIT Workout'];

  for (const user of allUsers) {
    const eventCount = await prisma.event.count({ where: { userId: user.id } });
    
    if (eventCount < 2) {
        const numEvents = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numEvents; i++) {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 10) - 2); 

            await prisma.event.create({
                data: {
                    title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
                    description: 'Test event description',
                    eventDate: eventDate,
                    userId: user.id,
                    status: 'FUTURE',
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
