# Prisma ORM Setup

This project has been migrated from TypeORM to Prisma ORM. Here's how to work with the Prisma setup:

## Prisma Commands

- `npm run db:generate` - Generates the Prisma client
- `npm run db:migrate` - Runs migrations
- `npm run db:studio` - Opens Prisma Studio for database browsing

## Initial Setup

1. Make sure you have PostgreSQL running
2. Update the DATABASE_URL in the .env file if needed
3. Run `npm run db:migrate` to apply migrations
4. Run `npm run db:generate` to generate the Prisma client

## Database Schema

The schema is defined in `prisma/schema.prisma`. It includes:

- User model with fields for id, name, email, password, role, height, weight
- Event model with fields for id, title, description, eventDate, status, exerciseType, and relation to User

## Migration Process

This project was migrated from TypeORM to Prisma. All existing database functionality should work the same way, but now using Prisma's API instead of TypeORM's Repository pattern.