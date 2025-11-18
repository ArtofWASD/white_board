import { dataSource } from '../../typeorm.config';

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    await dataSource.runMigrations();
    console.log('Migrations have been run successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error during migration run:', error);
    process.exit(1);
  }
}

runMigrations();