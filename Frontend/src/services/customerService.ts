import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Customer Types - Match backend DTOs exactly
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: number;
  isActive?: boolean;
}

// Customer Service Class
class CustomerService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.CUSTOMERS;

  // Get all customers
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(this.baseEndpoint);
  }

  // Get customer by ID
  async getCustomerById(id: number): Promise<ApiResponse<Customer>> {
    return apiService.get<Customer>(`${this.baseEndpoint}/${id}`);
  }

  // Create new customer
  async createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    return apiService.post<Customer>(this.baseEndpoint, customerData);
  }

  // Update existing customer
  async updateCustomer(id: number, customerData: Partial<CreateCustomerRequest>): Promise<ApiResponse<Customer>> {
    return apiService.put<Customer>(`${this.baseEndpoint}/${id}`, customerData);
  }

  // Delete customer
  async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get customers by phone
  async getCustomersByPhone(phone: string): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(`${this.baseEndpoint}/phone?phone=${encodeURIComponent(phone)}`);
  }

  // Get customers by email
  async getCustomersByEmail(email: string): Promise<ApiResponse<Customer[]>> {
    return apiService.get<Customer[]>(`${this.baseEndpoint}/email?email=${encodeURIComponent(email)}`);
  }
}

export const customerService = new CustomerService();
