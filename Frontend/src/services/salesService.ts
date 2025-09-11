import { apiService, ApiResponse, PaymentMethod } from './apiService';
import { API_CONFIG } from '../config/api';

// Sales Types - Matching backend DTOs
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

export interface SalesSummary {
  totalInvoices: number;
  totalSalesAmount: number;
  todaySales: number;
  thisMonthSales: number;
  averageInvoiceAmount: number;
  totalCustomers: number;
}

export interface SalesStatistics {
  totalInvoices: number;
  totalSales: number;
  totalDiscounts: number;
}

// Sales Service Class
class SalesService {
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

  // Delete sales invoice
  async deleteSalesInvoice(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get sales invoices by customer
  async getSalesInvoicesByCustomer(customerName: string): Promise<ApiResponse<SalesInvoice[]>> {
    return apiService.get<SalesInvoice[]>(`${this.baseEndpoint}/by-customer/${encodeURIComponent(customerName)}`);
  }

  // Get sales invoices by date range
  async getSalesInvoicesByDateRange(startDate?: string, endDate?: string): Promise<ApiResponse<SalesInvoice[]>> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const endpoint = queryParams.toString() 
      ? `${this.baseEndpoint}/by-date?${queryParams.toString()}`
      : `${this.baseEndpoint}/by-date`;
    
    return apiService.get<SalesInvoice[]>(endpoint);
  }

  // Get sales summary
  async getSalesSummary(): Promise<ApiResponse<SalesSummary>> {
    return apiService.get<SalesSummary>(`${this.baseEndpoint}/summary`);
  }

  // Get sales statistics
  async getSalesStatistics(): Promise<ApiResponse<SalesStatistics>> {
    return apiService.get<SalesStatistics>(`${this.baseEndpoint}/Statistics`);
  }

  // Generate invoice number
  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `INV-${year}${month}${day}-${time}`;
  }
}

// Create and export singleton instance
export const salesService = new SalesService();

// Export types
export type { 
  SalesInvoice, 
  SalesInvoiceDetail, 
  CreateSalesInvoiceRequest, 
  CreateSalesInvoiceDetailRequest,
  SalesSummary,
  SalesStatistics
};
