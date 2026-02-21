import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getAll(@Query('limit') limit?: number) {
    return this.newsService.getAll(limit);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.newsService.getOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  create(
    @Body()
    body: {
      title: string;
      content: string;
      excerpt?: string;
      imageUrl?: string;
      createdAt?: string;
    },
  ) {
    return this.newsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      content?: string;
      excerpt?: string;
      imageUrl?: string;
      createdAt?: string;
    },
  ) {
    return this.newsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
