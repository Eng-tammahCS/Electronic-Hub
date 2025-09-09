import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Purchase Return Types - Match backend DTOs exactly
export interface PurchaseReturn {
  id: number;
  purchaseInvoiceId: number;
  purchaseInvoiceNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  reason?: string;
  userId: number;
  username: string;
  createdAt: string;
  supplierId: number;
  supplierName: string;
  unitCost: number;
  totalReturnAmount: number;
}

export interface CreatePurchaseReturnRequest {
  purchaseInvoiceId: number;
  productId: number;
  quantity: number;
  reason?: string;
}

export interface UpdatePurchaseReturnRequest {
  quantity: number;
  reason?: string;
}

// Purchase Return Service Class
class PurchaseReturnService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.PURCHASE_RETURNS;

  // Get all purchase returns
  async getPurchaseReturns(): Promise<ApiResponse<PurchaseReturn[]>> {
    return apiService.get<PurchaseReturn[]>(this.baseEndpoint);
  }

  // Get purchase return by ID
  async getPurchaseReturnById(id: number): Promise<ApiResponse<PurchaseReturn>> {
    return apiService.get<PurchaseReturn>(`${this.baseEndpoint}/${id}`);
  }

  // Create new purchase return
  async createPurchaseReturn(returnData: CreatePurchaseReturnRequest): Promise<ApiResponse<PurchaseReturn>> {
    return apiService.post<PurchaseReturn>(this.baseEndpoint, returnData);
  }

  // Update existing purchase return
  async updatePurchaseReturn(id: number, returnData: UpdatePurchaseReturnRequest): Promise<ApiResponse<PurchaseReturn>> {
    return apiService.put<PurchaseReturn>(`${this.baseEndpoint}/${id}`, returnData);
  }

  // Delete purchase return
  async deletePurchaseReturn(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get purchase returns by invoice
  async getPurchaseReturnsByInvoice(invoiceId: number): Promise<ApiResponse<PurchaseReturn[]>> {
    return apiService.get<PurchaseReturn[]>(`${this.baseEndpoint}/invoice/${invoiceId}`);
  }

  // Get purchase returns by date range
  async getPurchaseReturnsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<PurchaseReturn[]>> {
    return apiService.get<PurchaseReturn[]>(`${this.baseEndpoint}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const purchaseReturnService = new PurchaseReturnService();
