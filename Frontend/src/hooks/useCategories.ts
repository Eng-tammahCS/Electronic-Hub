import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category, CreateCategoryRequest } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// Hooks for Categories
export const useCategories = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryService.getCategories(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCategory = (id: number) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: isAuthenticated && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Mutations
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData: CreateCategoryRequest) => categoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCategoryRequest> }) => 
      categoryService.updateCategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(categoryKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
