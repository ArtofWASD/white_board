import { Module } from '@nestjs/common';
import { CsrfService } from '../services/csrf.service';
import { CsrfController } from '../controllers/csrf.controller';

/**
 * Модуль для CSRF защиты
 * Предоставляет сервисы и endpoints для работы с CSRF токенами
 */
@Module({
  controllers: [CsrfController],
  providers: [CsrfService],
  exports: [CsrfService], // Экспортируем для использования в других модулях
})
export class CsrfModule {}
