import { apiService, ApiResponse, PaymentMethod } from './apiService';
import { API_CONFIG } from '../config/api';

// Sales Invoice Types - Match backend DTOs exactly
export interface SalesInvoice {
  id: number;
  invoiceNumber: string;
  customerName?: string;
  invoiceDate: string;
  discountTotal: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  overrideByUserId?: number;
  overrideByUsername?: string;
  overrideDate?: string;
  userId: number;
  username: string;
  createdAt: string;
  details: SalesInvoiceDetail[];
  isReturned?: boolean;
  returnDate?: string;
  returnReason?: string;
}

export interface SalesInvoiceDetail {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface CreateSalesInvoiceRequest {
  invoiceNumber: string;
  customerName?: string;
  invoiceDate: string;
  discountTotal: number;
  paymentMethod: PaymentMethod;
  details: CreateSalesInvoiceDetailRequest[];
}

export interface CreateSalesInvoiceDetailRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export interface UpdateSalesInvoiceRequest extends Partial<CreateSalesInvoiceRequest> {
  id: number;
}

// Temporarily commented out until database migration is done
/*
export interface ReturnInvoiceResult {
  success: boolean;
  message: string;
  invoiceId: number;
  invoiceNumber: string;
  totalRefundAmount: number;
  returnedItems: ReturnedItem[];
  returnDate: string;
}

export interface ReturnedItem {
  productId: number;
  productName: string;
  quantity: number;
  refundAmount: number;
}
*/

// Sales Invoice Service Class
class SalesInvoiceService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.SALES_INVOICES;

  // Get all sales invoices
  async getSalesInvoices(): Promise<ApiResponse<SalesInvoice[]>> {
    return apiService.get<SalesInvoice[]>(this.baseEndpoint);
  }

  // Get sales invoice by ID
  async getSalesInvoiceById(id: number): Promise<ApiResponse<SalesInvoice>> {
    return apiService.get<SalesInvoice>(`${this.baseEndpoint}/${id}`);
  }

  // Create new sales invoice
  async createSalesInvoice(invoiceData: CreateSalesInvoiceRequest): Promise<ApiResponse<SalesInvoice>> {
    return apiService.post<SalesInvoice>(this.baseEndpoint, invoiceData);
  }

  // Update existing sales invoice
  async updateSalesInvoice(id: number, invoiceData: Partial<CreateSalesInvoiceRequest>): Promise<ApiResponse<SalesInvoice>> {
    return apiService.put<SalesInvoice>(`${this.baseEndpoint}/${id}`, invoiceData);
  }

  // Delete sales invoice
  async deleteSalesInvoice(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get sales invoices by date range
  async getSalesInvoicesByDateRange(startDate: string, endDate: string): Promise<ApiResponse<SalesInvoice[]>> {
    return apiService.get<SalesInvoice[]>(`${this.baseEndpoint}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Temporarily commented out until database migration is done
  /*
  // Return entire sales invoice
  async returnSalesInvoice(invoiceId: number, reason?: string): Promise<ApiResponse<ReturnInvoiceResult>> {
    return apiService.post<ReturnInvoiceResult>(`${this.baseEndpoint}/${invoiceId}/return`, { reason });
  }

  // Get returned invoices
  async getReturnedInvoices(): Promise<ApiResponse<SalesInvoice[]>> {
    return apiService.get<SalesInvoice[]>(`${this.baseEndpoint}/returned`);
  }
  */

  // Get sales invoices by customer
  async getSalesInvoicesByCustomer(customerName: string): Promise<ApiResponse<SalesInvoice[]>> {
    return apiService.get<SalesInvoice[]>(`${this.baseEndpoint}/customer?customerName=${encodeURIComponent(customerName)}`);
  }
}

export const salesInvoiceService = new SalesInvoiceService();
