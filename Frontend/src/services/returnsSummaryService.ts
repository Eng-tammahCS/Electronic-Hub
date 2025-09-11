import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Returns Summary Types - Match backend DTOs exactly
export interface ReturnsSummary {
  totalSalesReturns: number;
  totalSalesReturnAmount: number;
  todaySalesReturns: number;
  todaySalesReturnAmount: number;
  thisMonthSalesReturns: number;
  thisMonthSalesReturnAmount: number;
  totalPurchaseReturns: number;
  totalPurchaseReturnAmount: number;
  todayPurchaseReturns: number;
  todayPurchaseReturnAmount: number;
  thisMonthPurchaseReturns: number;
  thisMonthPurchaseReturnAmount: number;
  topReturnedProducts: TopReturnedProduct[];
  topReturnReasons: TopReturnReason[];
}

export interface TopReturnedProduct {
  productId: number;
  productName: string;
  totalReturns: number;
  salesReturns: number;
  purchaseReturns: number;
  totalReturnAmount: number;
}

export interface TopReturnReason {
  reason: string;
  count: number;
}

// Returns Summary Service Class
class ReturnsSummaryService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.RETURNS;

  // Get returns summary
  async getReturnsSummary(): Promise<ApiResponse<ReturnsSummary>> {
    return apiService.get<ReturnsSummary>(`${this.baseEndpoint}/summary`);
  }

  // Get top returned products
  async getTopReturnedProducts(limit: number = 10): Promise<ApiResponse<TopReturnedProduct[]>> {
    return apiService.get<TopReturnedProduct[]>(`${this.baseEndpoint}/top-products?limit=${limit}`);
  }

  // Get top return reasons
  async getTopReturnReasons(limit: number = 10): Promise<ApiResponse<TopReturnReason[]>> {
    return apiService.get<TopReturnReason[]>(`${this.baseEndpoint}/top-reasons?count=${limit}`);
  }

  // Get returns stats by date range
  async getReturnsStatsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return apiService.get<any>(`${this.baseEndpoint}/stats?startDate=${startDate}&endDate=${endDate}`);
  }

  // Check if sales item can be returned
  async canReturnSalesItem(salesInvoiceId: number, productId: number, quantity: number): Promise<ApiResponse<{ canReturn: boolean }>> {
    return apiService.get<{ canReturn: boolean }>(`${this.baseEndpoint}/can-return-sales?salesInvoiceId=${salesInvoiceId}&productId=${productId}&quantity=${quantity}`);
  }

  // Check if purchase item can be returned
  async canReturnPurchaseItem(purchaseInvoiceId: number, productId: number, quantity: number): Promise<ApiResponse<{ canReturn: boolean }>> {
    return apiService.get<{ canReturn: boolean }>(`${this.baseEndpoint}/can-return-purchase?purchaseInvoiceId=${purchaseInvoiceId}&productId=${productId}&quantity=${quantity}`);
  }
}

export const returnsSummaryService = new ReturnsSummaryService();
