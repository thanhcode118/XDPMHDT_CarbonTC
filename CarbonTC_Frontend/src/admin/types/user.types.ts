import type { UserRole } from './auth.types';

export interface User {
  id: string;
  userId?: string;
  fullName: string | null;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  avatarUrl?: string | null;
}

export interface UserDetail extends User {
  address?: string | null;
  companyName?: string | null;
  taxCode?: string | null;
  updatedAt?: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    evOwner: number;
    buyer: number;
    cva: number;
    admin: number;
  };
  pendingVerifiers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface UserFilters {
  role?: UserRole | string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const UserRoleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  BUYER: 'Carbon Credit Buyer',
  EV_OWNER: 'EV Owner',
  CVA: 'Carbon Verifier',
};

export const UserStatusLabels: Record<'ACTIVE' | 'INACTIVE', string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const getUserRoleColor = (
  role: UserRole,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (role) {
    case 'ADMIN':
      return 'error';
    case 'BUYER':
      return 'primary';
    case 'EV_OWNER':
      return 'success';
    case 'CVA':
      return 'info';
    default:
      return 'default';
  }
};

export const getUserStatusColor = (
  status: 'ACTIVE' | 'INACTIVE',
): 'success' | 'default' => {
  return status === 'ACTIVE' ? 'success' : 'default';
};
