import { API_CONFIG, getApiUrl, getHttpApiUrl } from '../config/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    roleName: string;
    permissions: string[];
    isActive: boolean;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  image?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
}

// Enums matching backend
export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  Deferred = 2
}

export enum MovementType {
  Purchase = 'Purchase',
  Sale = 'Sale',
  ReturnSale = 'ReturnSale',
  ReturnPurchase = 'ReturnPurchase',
  Adjust = 'Adjust'
}

// API Service Class
class ApiService {
  private baseUrl: string;
  private httpBaseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.httpBaseUrl = API_CONFIG.BASE_URL_HTTP;
  }

  // Get stored token
  private getToken(): string | null {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
  }

  // Get stored user
  private getUser(): User | null {
    const userStr = localStorage.getItem(API_CONFIG.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  // Store token and user
  private storeAuth(token: string, user: User): void {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
  }

  // Clear stored auth data
  private clearAuth(): void {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.USER_KEY);
  }

  // Create headers for authenticated requests
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic fetch method with error handling and timeout
  private async fetchWithErrorHandling<T>(
    url: string,
    options: RequestInit = {},
    timeout: number = 5000 // 5 seconds timeout
  ): Promise<ApiResponse<T>> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.clearAuth();
        window.location.href = '/login';
        return {
          success: false,
          message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
        };
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        return {
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        };
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          message: `خطأ في الخادم: ${response.status} ${response.statusText}`,
          error: errorData,
        };
      }

      // Parse JSON response
      const data = await response.json();
      
      // Check if the response already has the expected format
      if (data && typeof data === 'object' && 'success' in data) {
        return data;
      }
      
      // If not, wrap it in the expected format
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('API Error:', error);

      // Handle timeout
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'انتهت مهلة الاتصال بالخادم',
          error: 'timeout',
        };
      }

      // Handle network errors
      if (error.message?.includes('fetch')) {
        return {
          success: false,
          message: 'خطأ في الاتصال بالشبكة',
          error: 'network',
        };
      }

      return {
        success: false,
        message: 'حدث خطأ غير متوقع',
        error: error.message,
      };
    }
  }

  // Generic fetch method with fallback
  private async fetchWithFallback<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Try HTTPS first (more reliable in production)
    const httpsUrl = getApiUrl(endpoint);
    console.log('Trying HTTPS:', httpsUrl);
    const httpsResult = await this.fetchWithErrorHandling<T>(httpsUrl, options, 3000);

    // If HTTPS succeeds, return it
    if (httpsResult.success) {
      return httpsResult;
    }

    // If HTTPS fails with network error, try HTTP as fallback
    if (!httpsResult.success && httpsResult.error === 'network') {
      console.warn('HTTPS failed, trying HTTP fallback');
      const httpUrl = getHttpApiUrl(endpoint);
      console.log('Trying HTTP:', httpUrl);
      return this.fetchWithErrorHandling<T>(httpUrl, options, 3000);
    }

    return httpsResult;
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const result = await this.fetchWithFallback<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (result.success && result.data) {
      // Store authentication data
      this.storeAuth(result.data.token, result.data.user);
    }

    return result;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    return this.fetchWithFallback(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.fetchWithFallback(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
      {
        method: 'POST',
      }
    );

    // Clear auth data regardless of API response
    this.clearAuth();
    return result;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.fetchWithFallback<{ user: User }>(
      API_CONFIG.ENDPOINTS.AUTH.ME
    );
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; expiresAt: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return {
        success: false,
        message: 'لا يوجد refresh token',
      };
    }

    const result = await this.fetchWithFallback<{ token: string; expiresAt: string }>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      {
        method: 'POST',
        body: JSON.stringify(refreshToken),
      }
    );

    if (result.success && result.data) {
      // Update stored token
      localStorage.setItem(API_CONFIG.TOKEN_KEY, result.data.token);
    }

    return result;
  }

  async validateToken(): Promise<ApiResponse<{
    isValid: boolean;
    isExpired: boolean;
    expirationDate: string;
    message: string;
  }>> {
    const token = this.getToken();
    if (!token) {
      return {
        success: false,
        message: 'لا يوجد token',
      };
    }

    return this.fetchWithFallback(
      API_CONFIG.ENDPOINTS.AUTH.VALIDATE_TOKEN,
      {
        method: 'POST',
        body: JSON.stringify(token),
      }
    );
  }

  // Generic API methods for protected endpoints
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchWithFallback<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.fetchWithFallback<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.fetchWithFallback<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchWithFallback<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserFromStorage(): User | null {
    return this.getUser();
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getUser();
    console.log('hasRole: الدور المطلوب =', role);
    console.log('hasRole: دور المستخدم =', user?.roleName);
    const result = user?.roleName?.toLowerCase() === role.toLowerCase();
    console.log('hasRole: النتيجة =', result);
    return result;
  }

  // Get current token (public method)
  getCurrentToken(): string | null {
    return this.getToken();
  }
}

// Create and export singleton instance
export const apiService = new ApiService();