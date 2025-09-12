import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseInvoiceService, PurchaseInvoice, CreatePurchaseInvoiceRequest, UpdatePurchaseInvoiceRequest } from '../services/purchaseInvoiceService';
import { useAuth } from '../contexts/AuthContext';

// Query Keys
export const purchaseInvoiceKeys = {
  all: ['purchaseInvoices'] as const,
  lists: () => [...purchaseInvoiceKeys.all, 'list'] as const,
  list: (filters: PurchaseInvoiceFilters) => [...purchaseInvoiceKeys.lists(), filters] as const,
  details: () => [...purchaseInvoiceKeys.all, 'detail'] as const,
  detail: (id: number) => [...purchaseInvoiceKeys.details(), id] as const,
  stats: () => [...purchaseInvoiceKeys.all, 'stats'] as const,
  bySupplier: (supplierId: number) => [...purchaseInvoiceKeys.all, 'supplier', supplierId] as const,
  byDateRange: (startDate: string, endDate: string) => [...purchaseInvoiceKeys.all, 'dateRange', startDate, endDate] as const,
};

// Types
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
  Data: T[];
  TotalCount: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

// Hooks for Purchase Invoices
export const usePurchaseInvoices = (filters?: PurchaseInvoiceFilters) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: purchaseInvoiceKeys.list(filters || {}),
    queryFn: async () => {
      console.log("usePurchaseInvoices - Calling API with filters:", filters);
      const result = await purchaseInvoiceService.getPurchaseInvoicesPaginated(filters);
      console.log("usePurchaseInvoices - API response:", result);
      return result;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePurchaseInvoice = (id: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: purchaseInvoiceKeys.detail(id),
    queryFn: () => purchaseInvoiceService.getPurchaseInvoiceById(id),
    enabled: isAuthenticated && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePurchaseStats = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: purchaseInvoiceKeys.stats(),
    queryFn: () => purchaseInvoiceService.getPurchaseStats(),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute for more real-time stats
    gcTime: 5 * 60 * 1000,
  });
};

export const usePurchaseInvoicesBySupplier = (supplierId: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: purchaseInvoiceKeys.bySupplier(supplierId),
    queryFn: () => purchaseInvoiceService.getPurchaseInvoicesBySupplier(supplierId),
    enabled: isAuthenticated && !!supplierId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePurchaseInvoicesByDateRange = (startDate: string, endDate: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: purchaseInvoiceKeys.byDateRange(startDate, endDate),
    queryFn: () => purchaseInvoiceService.getPurchaseInvoicesByDateRange(startDate, endDate),
    enabled: isAuthenticated && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useCreatePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceData: CreatePurchaseInvoiceRequest) => 
      purchaseInvoiceService.createPurchaseInvoice(invoiceData),
    onSuccess: (data) => {
      console.log('Create invoice mutation success:', data);
      // Invalidate and refetch purchase invoices list
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.stats() });
      // Invalidate inventory queries since new purchase affects inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error) => {
      console.error('Create invoice mutation error:', error);
    },
  });
};

export const useUpdatePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseInvoiceRequest }) => 
      purchaseInvoiceService.updatePurchaseInvoice(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate the specific invoice
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(id) });
      // Invalidate invoices list
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.stats() });
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeletePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => purchaseInvoiceService.deletePurchaseInvoice(id),
    onSuccess: (_, id) => {
      // Remove the invoice from cache
      queryClient.removeQueries({ queryKey: purchaseInvoiceKeys.detail(id) });
      // Invalidate invoices list
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.stats() });
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

// Utility hook for prefetching
export const usePrefetchPurchaseInvoice = () => {
  const queryClient = useQueryClient();
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: purchaseInvoiceKeys.detail(id),
      queryFn: () => purchaseInvoiceService.getPurchaseInvoiceById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};
