/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
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
        dashboardLayout: user.dashboardLayout,
        dashboardLayoutMode: user.dashboardLayoutMode,
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
    

    
    let organizationData: any = {};
    // Check if organizationName is provided and not empty
    if (registerDto.organizationName && registerDto.organizationName.trim().length > 0) {
        organizationData = {
            organization: {
                create: {
                    name: registerDto.organizationName
                }
            }
        };
    }

    const isOrgRegistration = !!organizationData.organization;
    const computedUserType = isOrgRegistration ? 'organization' : (registerDto.userType || 'individual');

    const newUser = await (this.prisma as any).user.create({
      data: {
        name: registerDto.name,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role, 
        gender: registerDto.gender,
        isAdmin:
          registerDto.role === 'TRAINER' ||
          registerDto.role === 'ORGANIZATION_ADMIN',
        // Legacy fields mapping
        userType: computedUserType,
        organizationName: registerDto.organizationName,
        ...organizationData
      },
      include: {
        organization: true
      }
    });

    const payload = {
      email: newUser.email,
      sub: newUser.id,
      role: newUser.role,
      organizationId: newUser.organization?.id 
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
        dashboardLayout: newUser.dashboardLayout,
        dashboardLayoutMode: newUser.dashboardLayoutMode,
        organizationId: newUser.organization?.id
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
    if (updateProfileDto.dashboardLayout !== undefined) {
      updateData.dashboardLayout = updateProfileDto.dashboardLayout;
    }
    if (updateProfileDto.dashboardLayoutMode !== undefined) {
      updateData.dashboardLayoutMode = updateProfileDto.dashboardLayoutMode;
    }

    // Handle Email Update
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await (this.prisma as any).user.findUnique({
        where: { email: updateProfileDto.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('Email already in use');
      }
      updateData.email = updateProfileDto.email;
    }

    // Handle Password Update
    if (updateProfileDto.password) {
      if (!updateProfileDto.currentPassword) {
        throw new UnauthorizedException('Current password is required to set a new password');
      }
      
      const isPasswordValid = await bcrypt.compare(
        updateProfileDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid current password');
      }

      const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
      updateData.password = hashedPassword;
    }

    // Update user with new data
    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: updateData,
    });



    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        height: updatedUser.height,
        weight: updatedUser.weight,
        dashboardLayout: updatedUser.dashboardLayout,
        dashboardLayoutMode: updatedUser.dashboardLayoutMode,
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

      const users = await (this.prisma as any).user.findMany({
        where: { role: UserRole.ATHLETE },
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          role: true,
        },
      });

      return users;
    } catch (error) {
      // Log error internally if needed, or just rethrow

      throw error;
    }
  }
  async getUser(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        height: user.height,
        weight: user.weight,
        dashboardLayout: user.dashboardLayout,
        dashboardLayoutMode: user.dashboardLayoutMode,
        organizationId: user.organizationId
      } as UserResponse,
    };
  }
}
