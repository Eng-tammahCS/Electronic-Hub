import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Sales Return Types - Match backend DTOs exactly
export interface SalesReturn {
  id: number;
  salesInvoiceId: number;
  salesInvoiceNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  reason?: string;
  userId: number;
  username: string;
  createdAt: string;
  customerName?: string;
  unitPrice: number;
  totalReturnAmount: number;
}

export interface CreateSalesReturnRequest {
  salesInvoiceId: number;
  productId: number;
  quantity: number;
  reason?: string;
}

export interface UpdateSalesReturnRequest {
  quantity: number;
  reason?: string;
}

// Sales Return Service Class
class SalesReturnService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.SALES_RETURNS;

  // Get all sales returns
  async getSalesReturns(): Promise<ApiResponse<SalesReturn[]>> {
    return apiService.get<SalesReturn[]>(this.baseEndpoint);
  }

  // Get sales return by ID
  async getSalesReturnById(id: number): Promise<ApiResponse<SalesReturn>> {
    return apiService.get<SalesReturn>(`${this.baseEndpoint}/${id}`);
  }

  // Create new sales return
  async createSalesReturn(returnData: CreateSalesReturnRequest): Promise<ApiResponse<SalesReturn>> {
    return apiService.post<SalesReturn>(this.baseEndpoint, returnData);
  }

  // Update existing sales return
  async updateSalesReturn(id: number, returnData: UpdateSalesReturnRequest): Promise<ApiResponse<SalesReturn>> {
    return apiService.put<SalesReturn>(`${this.baseEndpoint}/${id}`, returnData);
  }

  // Delete sales return
  async deleteSalesReturn(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get sales returns by invoice
  async getSalesReturnsByInvoice(invoiceId: number): Promise<ApiResponse<SalesReturn[]>> {
    return apiService.get<SalesReturn[]>(`${this.baseEndpoint}/invoice/${invoiceId}`);
  }

  // Get sales returns by date range
  async getSalesReturnsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<SalesReturn[]>> {
    return apiService.get<SalesReturn[]>(`${this.baseEndpoint}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const salesReturnService = new SalesReturnService();
