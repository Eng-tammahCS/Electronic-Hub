import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Category Types - Updated to match backend exactly
export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
}

// Category Service Class
class CategoryService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.CATEGORIES;

  // Get all categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiService.get<Category[]>(this.baseEndpoint);
  }

  // Get category by ID
  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    return apiService.get<Category>(`${this.baseEndpoint}/${id}`);
  }

  // Create new category
  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiService.post<Category>(this.baseEndpoint, categoryData);
  }

  // Update existing category
  async updateCategory(id: number, categoryData: Partial<CreateCategoryRequest>): Promise<ApiResponse<Category>> {
    const updateData: UpdateCategoryRequest = {
      id: id,
      name: categoryData.name || ''
    };
    return apiService.put<Category>(`${this.baseEndpoint}/${id}`, updateData);
  }

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}

// Create and export singleton instance
export const categoryService = new CategoryService();
