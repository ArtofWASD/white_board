import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  Get,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() body: any) {
    console.log('RAW REGISTER BODY (RETRY):', JSON.stringify(body, null, 2));
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Put('profile/:userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('lookup')
  async lookupUser(@Query('email') email: string) {
    try {
      return await this.authService.lookupUserByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('athletes')
  async getAthletes() {
    return this.authService.getAthletes();
  }
  @HttpCode(HttpStatus.OK)
  // Get user details for verification
  @Get('user/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.authService.getUser(userId);
  }
}
