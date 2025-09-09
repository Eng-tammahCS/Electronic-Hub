import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, User, LoginRequest } from '../services/apiService';

export type UserRole = 'admin' | 'cashier';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth يجب استخدامه داخل AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    console.log('AuthProvider: تحقق من الجلسة الموجودة');
    const checkExistingSession = async () => {
      try {
        // Check if user is authenticated
        if (apiService.isAuthenticated()) {
          const storedUser = apiService.getCurrentUserFromStorage();
          if (storedUser) {
            console.log('AuthProvider: تم العثور على مستخدم محفوظ:', storedUser);
            setUser(storedUser);

            // Validate token with server (only if it's close to expiry)
            const token = apiService.getCurrentToken();
            if (token) {
              try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = tokenPayload.exp * 1000;
                const currentTime = Date.now();
                const timeUntilExpiry = expiryTime - currentTime;

                // Only validate if token expires in less than 5 minutes
                if (timeUntilExpiry < 5 * 60 * 1000) {
                  console.log('AuthProvider: Token قريب من الانتهاء، التحقق من الصلاحية');
                  const validationResult = await apiService.validateToken();
                  if (!validationResult.success || !validationResult.data?.isValid) {
                    console.log('AuthProvider: Token غير صحيح، مسح البيانات');
                    apiService.logout();
                    setUser(null);
                  }
                } else {
                  console.log('AuthProvider: Token صالح، لا حاجة للتحقق');
                }
              } catch (error) {
                console.log('AuthProvider: خطأ في فك تشفير Token، التحقق من الصلاحية');
                const validationResult = await apiService.validateToken();
                if (!validationResult.success || !validationResult.data?.isValid) {
                  apiService.logout();
                  setUser(null);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
        apiService.logout();
        setUser(null);
      } finally {
        console.log('AuthProvider: انتهى التحقق، تعيين isLoading إلى false');
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('AuthProvider: محاولة تسجيل الدخول للمستخدم:', username);
      
      // Call API service for login
      const result = await apiService.login({ username, password });
      
      if (result.success && result.data) {
        console.log('AuthProvider: تم تسجيل الدخول بنجاح:', result.data.user);
        setUser(result.data.user);
        return { success: true };
      } else {
        console.log('AuthProvider: فشل تسجيل الدخول:', result.message);
        return { success: false, message: result.message || 'فشل تسجيل الدخول' };
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call API logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    } finally {
      // Clear local state regardless of API response
      setUser(null);
    }
  };

  // Helper functions
  const hasPermission = (permission: string): boolean => {
    return apiService.hasPermission(permission);
  };

  const hasRole = (role: string): boolean => {
    return apiService.hasRole(role);
  };

  const isAuthenticated = apiService.isAuthenticated() && !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated,
      hasPermission,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};