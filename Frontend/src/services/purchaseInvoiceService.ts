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

export interface PurchaseInvoiceFilters {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  supplierId?: number;
  startDate?: string;
  endDate?: string;
}

export interface PurchaseInvoiceStats {
  TotalInvoices: number;
  TotalAmount: number;
  CompletedInvoices: number;
  PendingInvoices: number;
  AverageAmount: number;
  ThisMonthInvoices: number;
  ThisMonthAmount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
    console.log('createPurchaseInvoice - Input data:', invoiceData);
    console.log('createPurchaseInvoice - Endpoint:', this.baseEndpoint);
    
    const result = await apiService.post<PurchaseInvoice>(this.baseEndpoint, invoiceData);
    console.log('createPurchaseInvoice - API result:', result);
    
    return result;
  }

  // Update purchase invoice
  async updatePurchaseInvoice(id: number, data: UpdatePurchaseInvoiceRequest): Promise<ApiResponse<PurchaseInvoice>> {
    console.log("updatePurchaseInvoice - Input data:", data);
    console.log("updatePurchaseInvoice - Endpoint:", `${this.baseEndpoint}/${id}`);
    
    const result = await apiService.put<PurchaseInvoice>(`${this.baseEndpoint}/${id}`, data);
    console.log("updatePurchaseInvoice - API result:", result);
    
    return result;
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

  // Get paginated purchase invoices with filters
  async getPurchaseInvoicesPaginated(filters?: PurchaseInvoiceFilters): Promise<ApiResponse<PaginatedResponse<PurchaseInvoice>>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.supplierId) params.append('supplierId', filters.supplierId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const endpoint = queryString ? `${this.baseEndpoint}/paginated?${queryString}` : `${this.baseEndpoint}/paginated`;
    
    console.log("purchaseInvoiceService - Calling endpoint:", endpoint);
    console.log("purchaseInvoiceService - Filters:", filters);
    
    const result = await apiService.get<PaginatedResponse<PurchaseInvoice>>(endpoint);
    console.log("purchaseInvoiceService - API result:", result);
    console.log("purchaseInvoiceService - API result.success:", result.success);
    console.log("purchaseInvoiceService - API result.data:", result.data);
    console.log("purchaseInvoiceService - API result.data.Data:", result.data?.Data);
    
    return result;
  }

  // Get purchase invoice statistics
  async getPurchaseStats(): Promise<ApiResponse<PurchaseInvoiceStats>> {
    return apiService.get<PurchaseInvoiceStats>(`${this.baseEndpoint}/stats`);
  }

  // Search purchase invoices
  async searchPurchaseInvoices(searchTerm: string): Promise<ApiResponse<PurchaseInvoice[]>> {
    return apiService.get<PurchaseInvoice[]>(`${this.baseEndpoint}/search?searchTerm=${encodeURIComponent(searchTerm)}`);
  }
}

export const purchaseInvoiceService = new PurchaseInvoiceService();
