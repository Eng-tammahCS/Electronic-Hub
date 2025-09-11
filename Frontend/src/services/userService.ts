import { API_CONFIG } from '@/config/api';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  image?: string;
  permissions: string[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  roleId: number;
  isActive?: boolean;
  image?: string;
}

export interface UpdateUserDto {
  email: string;
  fullName?: string;
  phoneNumber?: string;
  roleId: number;
  isActive: boolean;
  image?: string;
}

export interface UsersSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  usersLoggedInToday: number;
  roleDistribution: {
    roleName: string;
    userCount: number;
    percentage: number;
  }[];
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class UserService {
  private baseUrl = `${API_CONFIG.BASE_URL}/api/Users`;

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  // Create new user
  async createUser(userData: CreateUserDto): Promise<User> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  // Update user
  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`);
    }
  }

  // Activate user
  async activateUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/activate`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to activate user: ${response.statusText}`);
    }
  }

  // Deactivate user
  async deactivateUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to deactivate user: ${response.statusText}`);
    }
  }

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    return response.json();
  }

  // Get users by role
  async getUsersByRole(roleId: number): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/role/${roleId}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users by role: ${response.statusText}`);
    }

    return response.json();
  }

  // Get active users
  async getActiveUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/active`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active users: ${response.statusText}`);
    }

    return response.json();
  }

  // Get inactive users
  async getInactiveUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/inactive`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inactive users: ${response.statusText}`);
    }

    return response.json();
  }

  // Get users summary
  async getUsersSummary(): Promise<UsersSummary> {
    const response = await fetch(`${this.baseUrl}/summary`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users summary: ${response.statusText}`);
    }

    return response.json();
  }

  // Change password
  async changePassword(id: number, passwordData: ChangePasswordDto): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/change-password`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to change password: ${response.statusText}`);
    }
  }

  // Reset password
  async resetPassword(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/reset-password`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to reset password: ${response.statusText}`);
    }
  }
}

export const userService = new UserService();
