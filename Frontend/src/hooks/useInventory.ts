import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, InventoryDto, InventoryReportDto, InventoryMovementDto, InventoryAdjustmentDto } from '../services/inventoryService';
import { useAuth } from '../contexts/AuthContext';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  report: () => [...inventoryKeys.all, 'report'] as const,
  list: () => [...inventoryKeys.all, 'list'] as const,
  product: (productId: number) => [...inventoryKeys.all, 'product', productId] as const,
  movements: () => [...inventoryKeys.all, 'movements'] as const,
  productMovements: (productId: number) => [...inventoryKeys.all, 'movements', 'product', productId] as const,
  lowStock: (threshold: number) => [...inventoryKeys.all, 'low-stock', threshold] as const,
  outOfStock: () => [...inventoryKeys.all, 'out-of-stock'] as const,
};

// Hooks for Inventory
export const useInventoryReport = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.report(),
    queryFn: () => inventoryService.getInventoryReport(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

export const useAllInventory = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: () => inventoryService.getAllInventory(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

export const useProductInventory = (productId: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.product(productId),
    queryFn: () => inventoryService.getProductInventory(productId),
    enabled: isAuthenticated && !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

export const useInventoryMovements = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.movements(),
    queryFn: () => inventoryService.getAllInventoryMovements(),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

export const useProductInventoryMovements = (productId: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.productMovements(productId),
    queryFn: () => inventoryService.getProductInventoryMovements(productId),
    enabled: isAuthenticated && !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

export const useLowStockItems = (threshold: number = 10) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.lowStock(threshold),
    queryFn: () => inventoryService.getLowStockItems(threshold),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

export const useOutOfStockItems = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: inventoryKeys.outOfStock(),
    queryFn: () => inventoryService.getOutOfStockItems(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adjustment: InventoryAdjustmentDto) => inventoryService.adjustInventory(adjustment),
    onSuccess: (_, variables) => {
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      // Invalidate specific product inventory
      queryClient.invalidateQueries({ queryKey: inventoryKeys.product(variables.productId) });
      // Invalidate products queries since currentQuantity might change
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
