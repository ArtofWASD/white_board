import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/user.entity';

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Создание таблиц, если они не существуют
    await AppDataSource.synchronize();
    console.log('Database schema synchronized!');

    // Проверка подключения
    const userRepository = AppDataSource.getRepository(User);
    const userCount = await userRepository.count();
    console.log(`Database connected successfully. Total users: ${userCount}`);
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
    process.exit(1);
  }
}

initializeDatabase();