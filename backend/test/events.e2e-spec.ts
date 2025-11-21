import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EventsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get the prisma service instance
    prisma = moduleFixture.get(PrismaService);

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'athlete',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.event.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await app.close();
  });

  it('/events (POST)', () => {
    return request(app.getHttpServer())
      .post('/events')
      .send({
        userId: testUser.id,
        title: 'Test Event',
        eventDate: new Date(),
        description: 'Test event description',
        exerciseType: 'running',
      })
      .expect(201);
  });

  it('/events/:userId (GET)', () => {
    return request(app.getHttpServer())
      .get(`/events/${testUser.id}`)
      .expect(200);
  });
});