import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, LoginRequest, RegisterRequest } from '../services/apiService';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
  validateToken: () => [...authKeys.all, 'validate-token'] as const,
};

// Hooks for Authentication
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthContext();
  
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => apiService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useValidateToken = () => {
  const { isAuthenticated } = useAuthContext();
  
  return useQuery({
    queryKey: authKeys.validateToken(),
    queryFn: () => apiService.validateToken(),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login } = useAuthContext();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials.username, credentials.password),
    onSuccess: () => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => apiService.register(userData),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthContext();
  
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.refreshToken(),
    onSuccess: () => {
      // Invalidate auth queries to refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => 
      apiService.post('/api/Auth/change-password', data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (email: string) => 
      apiService.post('/api/Auth/reset-password', { email }),
  });
};

// Utility hooks
export const useCheckUsername = () => {
  return useMutation({
    mutationFn: (username: string) => 
      apiService.post('/api/Auth/check-username', username),
  });
};

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: (email: string) => 
      apiService.post('/api/Auth/check-email', email),
  });
};

export const useCheckPasswordStrength = () => {
  return useMutation({
    mutationFn: (password: string) => 
      apiService.post('/api/Auth/check-password-strength', password),
  });
};
