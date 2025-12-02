/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';
import { SafeUser, UserResponse, User } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        height: user.height,
        weight: user.weight,
      } as UserResponse,
      token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await (this.prisma as any).user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await (this.prisma as any).user.create({
      data: {
        name: registerDto.name,
        lastName: registerDto.lastName, // Properly handle lastName
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role, // Use the provided role
        gender: registerDto.gender,
        registrationType: registerDto.registrationType,
        isAdmin:
          registerDto.role === 'trainer' ||
          registerDto.registrationType === 'organization',
      },
    });

    const payload = {
      email: newUser.email,
      sub: newUser.id,
      role: newUser.role,
    };
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        height: newUser.height,
        weight: newUser.weight,
      } as UserResponse,
      token: this.jwtService.sign(payload),
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Log the incoming data
    console.log('Updating profile for user:', userId);
    console.log('Incoming data:', updateProfileDto);

    // Build update data object with only provided fields
    const updateData: Partial<User> = {};
    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.height !== undefined) {
      updateData.height = updateProfileDto.height;
    }
    if (updateProfileDto.weight !== undefined) {
      updateData.weight = updateProfileDto.weight;
    }

    // Update user with new data
    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('Updated user:', updatedUser);

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        height: updatedUser.height,
        weight: updatedUser.weight,
      } as UserResponse,
    };
  }

  async lookupUserByEmail(email: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  async getAthletes() {
    try {
      console.log('Fetching all users as athletes...');
      const users = await (this.prisma as any).user.findMany({
        where: { role: 'athlete' },
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          role: true,
        },
      });
      console.log(`Found ${users.length} users.`);
      return users;
    } catch (error) {
      console.error('Error fetching athletes:', error);
      throw error;
    }
  }
}
