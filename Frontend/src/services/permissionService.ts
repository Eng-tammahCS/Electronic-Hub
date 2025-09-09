import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Permission Types - Match backend DTOs exactly
export interface Permission {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest extends Partial<CreatePermissionRequest> {
  id: number;
}

export interface PermissionsSummary {
  totalPermissions: number;
  usedPermissions: number;
  unusedPermissions: number;
}

export interface PermissionUsage {
  permissionId: number;
  permissionName: string;
  usageCount: number;
  usedByRoles: string[];
}

export interface AssignPermissionToRoleRequest {
  roleId: number;
  permissionId: number;
}

export interface AssignMultiplePermissionsRequest {
  roleId: number;
  permissionIds: number[];
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  permissions: Permission[];
}

// Permission Service Class
class PermissionService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.PERMISSIONS;

  // Get all permissions
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return apiService.get<Permission[]>(this.baseEndpoint);
  }

  // Get permission by ID
  async getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    return apiService.get<Permission>(`${this.baseEndpoint}/${id}`);
  }

  // Create new permission
  async createPermission(permissionData: CreatePermissionRequest): Promise<ApiResponse<Permission>> {
    return apiService.post<Permission>(this.baseEndpoint, permissionData);
  }

  // Update existing permission
  async updatePermission(id: number, permissionData: Partial<CreatePermissionRequest>): Promise<ApiResponse<Permission>> {
    return apiService.put<Permission>(`${this.baseEndpoint}/${id}`, permissionData);
  }

  // Delete permission
  async deletePermission(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get permissions summary
  async getPermissionsSummary(): Promise<ApiResponse<PermissionsSummary>> {
    return apiService.get<PermissionsSummary>(`${this.baseEndpoint}/summary`);
  }

  // Get permission usage
  async getPermissionUsage(): Promise<ApiResponse<PermissionUsage[]>> {
    return apiService.get<PermissionUsage[]>(`${this.baseEndpoint}/usage`);
  }

  // Assign permission to role
  async assignPermissionToRole(data: AssignPermissionToRoleRequest): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/assign`, data);
  }

  // Assign multiple permissions to role
  async assignMultiplePermissions(data: AssignMultiplePermissionsRequest): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/assign-multiple`, data);
  }

  // Get all roles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return apiService.get<Role[]>(`${this.baseEndpoint}/roles`);
  }

  // Get role by ID
  async getRoleById(id: number): Promise<ApiResponse<Role>> {
    return apiService.get<Role>(`${this.baseEndpoint}/roles/${id}`);
  }
}

export const permissionService = new PermissionService();
