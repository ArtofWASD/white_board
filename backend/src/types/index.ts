export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  password: string;
  role: string;
  height?: number;
  weight?: number;
  dashboardLayout?: string[];
  dashboardLayoutMode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, 'password'>;

// Prisma User type with mapped field names
export interface PrismaUser {
  id: string;
  name: string;
  last_name?: string;
  email: string;
  password: string;
  role: string;
  height?: number;
  weight?: number;
  dashboard_layout?: string[];
  dashboard_layout_mode?: string;
  created_at: Date;
  updated_at: Date;
}

export type SafePrismaUser = Omit<PrismaUser, 'password'>;

// Type for the user object after Prisma processing
export interface ProcessedUser {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
  dashboardLayout?: string[];
  dashboardLayoutMode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeProcessedUser = Omit<ProcessedUser, 'password'>;

// Interface for the user response object
export interface UserResponse {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
  dashboardLayout?: string[];
  dashboardLayoutMode?: string;
  organizationId?: string;
}
