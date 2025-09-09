import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Inventory Types - Updated to match backend exactly
export interface InventoryDto {
  productId: number;
  productName: string;
  categoryName: string;
  currentQuantity: number;
  totalValue: number;
  averageCost: number;
  lastCost: number;
  lastMovementDate: string;
}

export interface InventoryReportDto {
  items: InventoryDto[];
  totalInventoryValue: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface InventoryMovementDto {
  id: number;
  productId: number;
  productName: string;
  movementType: string;
  quantity: number;
  unitCost: number;
  referenceTable: string;
  referenceId: number;
  note?: string;
  username: string;
  createdAt: string;
}

export interface InventoryAdjustmentDto {
  productId: number;
  newQuantity: number;
  unitCost: number;
  reason: string;
}

// Inventory Service Class
class InventoryService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.INVENTORY;

  // Get inventory report
  async getInventoryReport(): Promise<ApiResponse<InventoryReportDto>> {
    return apiService.get<InventoryReportDto>(`${this.baseEndpoint}/report`);
  }

  // Get all inventory items
  async getAllInventory(): Promise<ApiResponse<InventoryDto[]>> {
    return apiService.get<InventoryDto[]>(this.baseEndpoint);
  }

  // Get product inventory
  async getProductInventory(productId: number): Promise<ApiResponse<InventoryDto>> {
    return apiService.get<InventoryDto>(`${this.baseEndpoint}/product/${productId}`);
  }

  // Get all inventory movements
  async getAllInventoryMovements(): Promise<ApiResponse<InventoryMovementDto[]>> {
    return apiService.get<InventoryMovementDto[]>(`${this.baseEndpoint}/movements`);
  }

  // Get product inventory movements
  async getProductInventoryMovements(productId: number): Promise<ApiResponse<InventoryMovementDto[]>> {
    return apiService.get<InventoryMovementDto[]>(`${this.baseEndpoint}/movements/product/${productId}`);
  }

  // Adjust inventory
  async adjustInventory(adjustment: InventoryAdjustmentDto): Promise<ApiResponse<boolean>> {
    return apiService.post<boolean>(`${this.baseEndpoint}/adjust`, adjustment);
  }

  // Get low stock items
  async getLowStockItems(threshold: number = 10): Promise<ApiResponse<InventoryDto[]>> {
    return apiService.get<InventoryDto[]>(`${this.baseEndpoint}/low-stock?threshold=${threshold}`);
  }

  // Get out of stock items
  async getOutOfStockItems(): Promise<ApiResponse<InventoryDto[]>> {
    return apiService.get<InventoryDto[]>(`${this.baseEndpoint}/out-of-stock`);
  }
}

// Create and export singleton instance
export const inventoryService = new InventoryService();
