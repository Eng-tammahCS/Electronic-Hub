import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Purchase Invoice Types - Match backend DTOs exactly
export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  invoiceDate: string;
  userId: number;
  username: string;
  totalAmount: number;
  createdAt: string;
  details: PurchaseInvoiceDetail[];
}

export interface PurchaseInvoiceDetail {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface CreatePurchaseInvoiceRequest {
  invoiceNumber: string;
  supplierId: number;
  invoiceDate: string;
  details: CreatePurchaseInvoiceDetailRequest[];
}

export interface CreatePurchaseInvoiceDetailRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface UpdatePurchaseInvoiceRequest extends Partial<CreatePurchaseInvoiceRequest> {
  id: number;
}

// Purchase Invoice Service Class
class PurchaseInvoiceService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.PURCHASE_INVOICES;

  // Get all purchase invoices
  async getPurchaseInvoices(): Promise<ApiResponse<PurchaseInvoice[]>> {
    return apiService.get<PurchaseInvoice[]>(this.baseEndpoint);
  }

  // Get purchase invoice by ID
  async getPurchaseInvoiceById(id: number): Promise<ApiResponse<PurchaseInvoice>> {
    return apiService.get<PurchaseInvoice>(`${this.baseEndpoint}/${id}`);
  }

  // Create new purchase invoice
  async createPurchaseInvoice(invoiceData: CreatePurchaseInvoiceRequest): Promise<ApiResponse<PurchaseInvoice>> {
    return apiService.post<PurchaseInvoice>(this.baseEndpoint, invoiceData);
  }

  // Update existing purchase invoice
  async updatePurchaseInvoice(id: number, invoiceData: Partial<CreatePurchaseInvoiceRequest>): Promise<ApiResponse<PurchaseInvoice>> {
    return apiService.put<PurchaseInvoice>(`${this.baseEndpoint}/${id}`, invoiceData);
  }

  // Delete purchase invoice
  async deletePurchaseInvoice(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get purchase invoices by date range
  async getPurchaseInvoicesByDateRange(startDate: string, endDate: string): Promise<ApiResponse<PurchaseInvoice[]>> {
    return apiService.get<PurchaseInvoice[]>(`${this.baseEndpoint}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Get purchase invoices by supplier
  async getPurchaseInvoicesBySupplier(supplierId: number): Promise<ApiResponse<PurchaseInvoice[]>> {
    return apiService.get<PurchaseInvoice[]>(`${this.baseEndpoint}/supplier/${supplierId}`);
  }

  // Get purchase statistics
  async getPurchaseStatistics(): Promise<ApiResponse<{
    totalInvoices: number;
    totalAmount: number;
    completedInvoices: number;
    pendingInvoices: number;
    averageAmount: number;
    thisMonthCount: number;
    thisMonthAmount: number;
  }>> {
    return apiService.get<{
      totalInvoices: number;
      totalAmount: number;
      completedInvoices: number;
      pendingInvoices: number;
      averageAmount: number;
      thisMonthCount: number;
      thisMonthAmount: number;
    }>(`${this.baseEndpoint}/statistics`);
  }
}

export const purchaseInvoiceService = new PurchaseInvoiceService();
