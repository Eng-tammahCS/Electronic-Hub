import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Product Types - Updated to match backend exactly
export interface Product {
  id: number;
  name: string;
  barcode?: string;
  categoryId: number;
  categoryName: string;
  supplierId?: number;
  supplierName?: string;
  defaultCostPrice: number;
  defaultSellingPrice: number;
  minSellingPrice: number;
  description?: string;
  createdAt: string;
  currentQuantity: number;
}

export interface CreateProductRequest {
  name: string;
  barcode?: string;
  categoryId: number;
  supplierId?: number;
  defaultCostPrice: number;
  defaultSellingPrice: number;
  minSellingPrice: number;
  description?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface ProductFilters {
  categoryId?: number;
  supplierId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

// Product Service Class
class ProductService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.PRODUCTS;

  // Get all products with optional filters
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() 
      ? `${this.baseEndpoint}?${queryParams.toString()}`
      : this.baseEndpoint;

    return apiService.get<Product[]>(endpoint);
  }

  // Get product by ID
  async getProductById(id: number): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`${this.baseEndpoint}/${id}`);
  }

  // Create new product
  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(this.baseEndpoint, productData);
  }

  // Update existing product
  async updateProduct(id: number, productData: Partial<CreateProductRequest>): Promise<ApiResponse<Product>> {
    return apiService.put<Product>(`${this.baseEndpoint}/${id}`, productData);
  }

  // Delete product
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get product by barcode
  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`${this.baseEndpoint}/barcode/${barcode}`);
  }

  // Get products by category
  async getProductsByCategory(categoryId: number): Promise<ApiResponse<Product[]>> {
    return apiService.get<Product[]>(`${this.baseEndpoint}/category/${categoryId}`);
  }

  // Get products by supplier
  async getProductsBySupplier(supplierId: number): Promise<ApiResponse<Product[]>> {
    return apiService.get<Product[]>(`${this.baseEndpoint}/supplier/${supplierId}`);
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<ApiResponse<Product[]>> {
    return apiService.get<Product[]>(`${this.baseEndpoint}/search?term=${encodeURIComponent(searchTerm)}`);
  }
}

// Create and export singleton instance
export const productService = new ProductService();

// Export types
export type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters };