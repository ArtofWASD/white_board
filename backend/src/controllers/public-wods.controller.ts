
import { Controller, Get, Query } from '@nestjs/common';
import { WodsService } from '../services/wods.service';

@Controller('public/wods')
export class PublicWodsController {
  constructor(private readonly wodsService: WodsService) {}

  @Get()
  findAll(@Query('limit') limit?: number) {
    // Determine how to filter safe WODs. For now return all as WODs are generally public info in this app contest.
    // Or filter by isGlobal if that flag exists.
    return this.wodsService.findAll();
  }
}
