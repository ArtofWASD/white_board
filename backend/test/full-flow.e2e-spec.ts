import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Full User Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let teamId: string;
  let eventId: string;

  const uniqueSuffix = Date.now();
  // We need a TRAINER to create teams
  const testUser = {
    email: `e2e_trainer_${uniqueSuffix}@example.com`,
    password: 'password123',
    name: 'E2E',
    lastName: 'Trainer',
    role: 'TRAINER', 
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up
    if (eventId) {
        await prisma.event.deleteMany({ where: { id: eventId } });
    }
    if (teamId) {
        // Remove members first
        await prisma.teamMember.deleteMany({ where: { teamId } });
        await prisma.team.delete({ where: { id: teamId } });
    }
    if (userId) {
        await prisma.user.delete({ where: { id: userId } });
    }
    await app.close();
  });

  it('/auth/register (POST) - Register new Trainer', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.role).toBe('TRAINER');
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  it('/teams/create (POST) - Create a team', async () => {
    const response = await request(app.getHttpServer())
      .post('/teams/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: `E2E Team ${uniqueSuffix}`,
        description: 'Test Team',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(`E2E Team ${uniqueSuffix}`);
    teamId = response.body.id;
  });

  it('/events (POST) - Create an event for the team', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          teamId: teamId,
          title: 'E2E Team Event',
          eventDate: new Date().toISOString(),
          description: 'Test Event Description',
          exerciseType: 'AMRAP', 
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      eventId = response.body.id;
  });

  it('/events/:userId (GET) - Verify event visibility', async () => {
      const response = await request(app.getHttpServer())
        .get(`/events/${userId}`) // This endpoint returns events for user (personal + team)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const events = response.body;
      const found = events.find((e: any) => e.id === eventId);
      expect(found).toBeDefined();
      expect(found.title).toBe('E2E Team Event');
  });
});

