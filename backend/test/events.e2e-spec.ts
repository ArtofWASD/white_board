import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Event } from '../src/entities/event.entity';

describe('EventsController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get the dataSource instance
    dataSource = moduleFixture.get(DataSource);

    // Create a test user
    const userRepository = dataSource.getRepository(User);
    testUser = userRepository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'athlete',
    });
    await userRepository.save(testUser);
  });

  afterAll(async () => {
    // Clean up test data
    const eventRepository = dataSource.getRepository(Event);
    await eventRepository.delete({ userId: testUser.id });

    const userRepository = dataSource.getRepository(User);
    await userRepository.delete(testUser.id);

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
