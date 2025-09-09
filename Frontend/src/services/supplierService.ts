import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Supplier Types - Updated to match backend exactly
export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: number;
}

// Supplier Service Class
class SupplierService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.SUPPLIERS;

  // Get all suppliers
  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    return apiService.get<Supplier[]>(this.baseEndpoint);
  }

  // Get supplier by ID
  async getSupplierById(id: number): Promise<ApiResponse<Supplier>> {
    return apiService.get<Supplier>(`${this.baseEndpoint}/${id}`);
  }

  // Create new supplier
  async createSupplier(supplierData: CreateSupplierRequest): Promise<ApiResponse<Supplier>> {
    return apiService.post<Supplier>(this.baseEndpoint, supplierData);
  }

  // Update existing supplier
  async updateSupplier(id: number, supplierData: Partial<CreateSupplierRequest>): Promise<ApiResponse<Supplier>> {
    return apiService.put<Supplier>(`${this.baseEndpoint}/${id}`, supplierData);
  }

  // Delete supplier
  async deleteSupplier(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}

// Create and export singleton instance
export const supplierService = new SupplierService();

// Export types
// export type { Supplier, CreateSupplierRequest, UpdateSupplierRequest };
