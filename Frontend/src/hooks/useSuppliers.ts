import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService, Supplier, CreateSupplierRequest } from '../services/supplierService';
import { useAuth } from '../contexts/AuthContext';

// Query Keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const,
};

// Hooks for Suppliers
export const useSuppliers = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: () => supplierService.getSuppliers(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSupplier = (id: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierService.getSupplierById(id),
    enabled: isAuthenticated && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Mutations
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (supplierData: CreateSupplierRequest) => supplierService.createSupplier(supplierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSupplierRequest> }) => 
      supplierService.updateSupplier(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(supplierKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => supplierService.deleteSupplier(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: supplierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};
