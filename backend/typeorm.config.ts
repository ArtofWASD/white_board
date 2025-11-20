import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Event } from './src/entities/event.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'whiteboard',
  entities: [User, Event],
  migrations: ['src/database/migrations/*.{ts,js}'],
  synchronize: false, // Отключаем автоматическую синхронизацию
  logging: false,
});
