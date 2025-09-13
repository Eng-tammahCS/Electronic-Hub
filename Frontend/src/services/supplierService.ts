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
    const updateData = {
      id: id,
      ...supplierData
    };
    return apiService.put<Supplier>(`${this.baseEndpoint}/${id}`, updateData);
  }

  // Delete supplier
  async deleteSupplier(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Check if supplier has references (products, purchase invoices)
  async checkSupplierReferences(id: number): Promise<ApiResponse<{ hasReferences: boolean; message?: string }>> {
    try {
      // This will be implemented in backend later
      return { success: true, data: { hasReferences: false } };
    } catch (error) {
      return { success: false, data: { hasReferences: false }, error: 'خطأ في التحقق من المراجع' };
    }
  }
}

// Create and export singleton instance
export const supplierService = new SupplierService();

// Export types
// export type { Supplier, CreateSupplierRequest, UpdateSupplierRequest };
