import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  search: (term: string) => [...productKeys.all, 'search', term] as const,
  byCategory: (categoryId: number) => [...productKeys.all, 'category', categoryId] as const,
  bySupplier: (supplierId: number) => [...productKeys.all, 'supplier', supplierId] as const,
  byBarcode: (barcode: string) => [...productKeys.all, 'barcode', barcode] as const,
};

// Hooks for Products
export const useProducts = (filters?: ProductFilters) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: () => productService.getProducts(filters),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProduct = (id: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: isAuthenticated && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProductByBarcode = (barcode: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: productKeys.byBarcode(barcode),
    queryFn: () => productService.getProductByBarcode(barcode),
    enabled: isAuthenticated && barcode.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchProducts = (searchTerm: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: productKeys.search(searchTerm),
    queryFn: () => productService.searchProducts(searchTerm),
    enabled: isAuthenticated && searchTerm.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
};

export const useProductsByCategory = (categoryId: number, filters?: Omit<ProductFilters, 'categoryId'>) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...productKeys.byCategory(categoryId), filters],
    queryFn: () => productService.getProductsByCategoryWithFilters(categoryId, filters),
    enabled: isAuthenticated && !!categoryId,
    staleTime: 2 * 60 * 1000, // 2 minutes for better real-time updates
    gcTime: 5 * 60 * 1000,
  });
};

export const useProductsBySupplier = (supplierId: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: productKeys.bySupplier(supplierId),
    queryFn: () => productService.getProductsBySupplier(supplierId),
    enabled: isAuthenticated && !!supplierId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: CreateProductRequest) => productService.createProduct(productData),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Also invalidate inventory queries since new product affects inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateProductRequest> }) => 
      productService.updateProduct(id, data),
    onSuccess: (data, variables) => {
      // Update the specific product in cache
      queryClient.setQueryData(productKeys.detail(variables.id), data);
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: (_, id) => {
      // Remove the product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

// Utility hook for prefetching
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => productService.getProductById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};