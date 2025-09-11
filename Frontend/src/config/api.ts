// API Configuration
export const API_CONFIG = {
  // Base URLs - Fixed to use HTTP directly
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002',
  BASE_URL_HTTP: import.meta.env.VITE_API_BASE_URL_HTTP || 'http://localhost:5002',
  
  // App Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Electronics Store',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Storage Keys
  TOKEN_KEY: import.meta.env.VITE_TOKEN_KEY || 'token',
  USER_KEY: import.meta.env.VITE_USER_KEY || 'user',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/Auth/login',
      REGISTER: '/api/Auth/register',
      LOGOUT: '/api/Auth/logout',
      REFRESH_TOKEN: '/api/Auth/refresh-token',
      VALIDATE_TOKEN: '/api/Auth/validate-token',
      ME: '/api/Auth/me',
      CHANGE_PASSWORD: '/api/Auth/change-password',
      RESET_PASSWORD: '/api/Auth/reset-password',
      CONFIRM_RESET_PASSWORD: '/api/Auth/confirm-reset-password',
      CHECK_USERNAME: '/api/Auth/check-username',
      CHECK_EMAIL: '/api/Auth/check-email',
      CHECK_PASSWORD_STRENGTH: '/api/Auth/check-password-strength'
    },
    PRODUCTS: '/api/Products',
    CATEGORIES: '/api/Categories',
    SUPPLIERS: '/api/Suppliers',
    USERS: '/api/Users',
    INVENTORY: '/api/Inventory',
    SALES_INVOICES: '/api/SalesInvoices',
    SALES_STATISTICS: '/api/SalesInvoices/Statistics',
    PURCHASE_INVOICES: '/api/PurchaseInvoices',
    SALES_RETURNS: '/api/Returns/sales',
    PURCHASE_RETURNS: '/api/Returns/purchases',
    RETURNS: '/api/Returns',
    EXPENSES: '/api/Expenses',
    DASHBOARD: '/api/Dashboard',
    PERMISSIONS: '/api/Permissions',
    CUSTOMERS: '/api/Customers'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get HTTP API URL (fallback)
export const getHttpApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL_HTTP}${endpoint}`;
};