import { Controller, Get } from '@nestjs/common';
import { WodsService } from '../services/wods.service';

@Controller('public/wods')
export class PublicWodsController {
  constructor(private readonly wodsService: WodsService) {}

  @Get()
  findAll() {
    // Определите, как фильтровать безопасные WOD. Пока возвращаем все, так как WOD, как правило, являются общедоступной информацией в этом конкурсе приложений.
    // Или фильтруем по isGlobal, если этот флаг существует.
    return this.wodsService.findAll();
  }
}
