import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login'
}) => {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('ProtectedRoute: الدور المطلوب =', requiredRole);
    console.log('ProtectedRoute: دور المستخدم =', user?.roleName);
    console.log('ProtectedRoute: hasRole result =', hasRole(requiredRole));
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600 mb-4">
            تحتاج إلى دور "{requiredRole}" للوصول إلى هذه الصفحة
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600 mb-4">
            تحتاج إلى صلاحية "{requiredPermission}" للوصول إلى هذه الصفحة
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: string;
    requiredPermission?: string;
    fallbackPath?: string;
  }
) => {
  return (props: P) => (
    <ProtectedRoute
      requiredRole={options?.requiredRole}
      requiredPermission={options?.requiredPermission}
      fallbackPath={options?.fallbackPath}
    >
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Hook for checking if user can access a route
export const useCanAccess = (requiredRole?: string, requiredPermission?: string) => {
  const { user, isAuthenticated, hasRole, hasPermission } = useAuth();

  if (!isAuthenticated || !user) {
    return { canAccess: false, reason: 'not_authenticated' };
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return { canAccess: false, reason: 'insufficient_role' };
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return { canAccess: false, reason: 'insufficient_permission' };
  }

  return { canAccess: true, reason: null };
};
