import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Full User Flow (e2e)', () => {
  let app: INestApplication<App>;
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

    const body = response.body as {
      token: string;
      user: { id: string; role: string };
    };
    expect(body).toHaveProperty('token');
    expect(body.user).toHaveProperty('id');
    expect(body.user.role).toBe('TRAINER');

    authToken = body.token;
    userId = body.user.id;
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

    const body = response.body as { id: string; name: string };
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(`E2E Team ${uniqueSuffix}`);
    teamId = body.id;
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

    const body = response.body as { id: string };
    expect(body).toHaveProperty('id');
    eventId = body.id;
  });

  it('/events/:userId (GET) - Verify event visibility', async () => {
    const response = await request(app.getHttpServer())
      .get(`/events/${userId}`) // This endpoint returns events for user (personal + team)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const events = response.body as { id: string; title: string }[];
    const found = events.find((e) => e.id === eventId);
    expect(found).toBeDefined();
    expect(found?.title).toBe('E2E Team Event');
  });
});
