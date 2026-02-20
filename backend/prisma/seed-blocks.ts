import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Ensure we load the .env file if it exists
import * as dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding initial Content Blocks...')

  const initialBlocks = [
    // LANDING BLOCKS
    {
      title: 'Тренировки Дня (WOD)',
      description: 'Получайте доступ к ежедневным тренировкам. Логируйте результаты, оставляйте заметки и отслеживайте историю своих побед в удобном формате.',
      location: 'LANDING',
      isActive: true,
      order: 10,
    },
    {
      title: 'Ваш Прогресс',
      description: 'Визуализируйте свой рост. Графики силовых показателей, личные рекорды и история выполнения комплексов всегда под рукой.',
      location: 'LANDING',
      isActive: true,
      order: 20,
    },
    {
      title: 'Сообщество и Лидерборды',
      description: 'Соревнуйтесь с друзьями и атлетами вашего зала. Поддерживайте друг друга в комментариях и следите за успехами команды.',
      location: 'LANDING',
      isActive: true,
      order: 30,
    },
    {
      title: 'Команды и Тренеры',
      description: 'Создавайте свои команды, управляйте атлетами и планируйте тренировочный процесс. Идеально для владельцев залов и тренеров.',
      location: 'LANDING',
      isActive: true,
      order: 40,
    },
    {
      title: 'Мероприятия',
      description: 'Организовывайте соревнования и челленджи. Удобный календарь событий поможет ничего не пропустить.',
      location: 'LANDING',
      isActive: true,
      order: 50,
    },
    {
      title: 'Всегда с вами',
      description: 'Используйте на компьютере, планшете или смартфоне. Ваши данные синхронизируются мгновенно, где бы вы ни находились.',
      location: 'LANDING',
      isActive: true,
      order: 60,
    },

    // KNOWLEDGE BLOCKS
    {
      title: 'Воркауты (WOD)',
      description: 'Ежедневные задания для атлетов разного уровня подготовки. Подробные описания комплексов, масштабирование и целевые показатели.',
      location: 'KNOWLEDGE',
      isActive: true,
      order: 10,
    },
    {
      title: 'База Упражнений',
      description: 'Библиотека техники выполнения упражнений. Видео-инструкции, разбор ошибок и рекомендации по безопасности для прогресса без травм.',
      location: 'KNOWLEDGE',
      isActive: true,
      order: 20,
    }
  ]

  for (const block of initialBlocks) {
    // Check if a block with this title already exists to prevent duplicates
    const existing = await prisma.contentBlock.findFirst({
      where: { title: block.title, location: block.location as any }
    })
    
    if (!existing) {
      await prisma.contentBlock.create({
        data: block as any
      })
      console.log(`Created block: ${block.title}`)
    } else {
      console.log(`Block already exists: ${block.title}`)
    }
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
