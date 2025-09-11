import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService, SalesInvoice, CreateSalesInvoiceRequest, SalesSummary, SalesStatistics } from '../services/salesService';
import { useAuth } from '../contexts/AuthContext';

// Query Keys
export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (filters?: any) => [...salesKeys.lists(), filters] as const,
  details: () => [...salesKeys.all, 'detail'] as const,
  detail: (id: number) => [...salesKeys.details(), id] as const,
  byCustomer: (customerName: string) => [...salesKeys.all, 'customer', customerName] as const,
  byDateRange: (startDate?: string, endDate?: string) => [...salesKeys.all, 'dateRange', startDate, endDate] as const,
  summary: () => [...salesKeys.all, 'summary'] as const,
  statistics: () => [...salesKeys.all, 'statistics'] as const,
};

// Hooks for Sales
export const useSales = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: salesKeys.lists(),
    queryFn: () => salesService.getSalesInvoices(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSale = (id: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesService.getSalesInvoiceById(id),
    enabled: isAuthenticated && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSalesByCustomer = (customerName: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: salesKeys.byCustomer(customerName),
    queryFn: () => salesService.getSalesInvoicesByCustomer(customerName),
    enabled: isAuthenticated && customerName.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSalesByDateRange = (startDate?: string, endDate?: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: salesKeys.byDateRange(startDate, endDate),
    queryFn: () => salesService.getSalesInvoicesByDateRange(startDate, endDate),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useSalesSummary = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: salesKeys.summary(),
    queryFn: () => salesService.getSalesSummary(),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useSalesStatistics = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: salesKeys.statistics(),
    queryFn: () => salesService.getSalesStatistics(),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Mutations
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceData: CreateSalesInvoiceRequest) => salesService.createSalesInvoice(invoiceData),
    onSuccess: () => {
      // Invalidate and refetch sales list
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      // Invalidate summary and statistics
      queryClient.invalidateQueries({ queryKey: salesKeys.summary() });
      queryClient.invalidateQueries({ queryKey: salesKeys.statistics() });
      // Invalidate inventory queries since sale affects inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Invalidate categories to update product counts
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => salesService.deleteSalesInvoice(id),
    onSuccess: (_, id) => {
      // Remove the sale from cache
      queryClient.removeQueries({ queryKey: salesKeys.detail(id) });
      // Invalidate sales list
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      // Invalidate summary and statistics
      queryClient.invalidateQueries({ queryKey: salesKeys.summary() });
      queryClient.invalidateQueries({ queryKey: salesKeys.statistics() });
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Utility hook for prefetching
export const usePrefetchSale = () => {
  const queryClient = useQueryClient();
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: salesKeys.detail(id),
      queryFn: () => salesService.getSalesInvoiceById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};
