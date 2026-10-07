import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleDashboardMap = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PHARMACIST: '/pharmacist/dashboard',
  PATIENT: '/patient/dashboard',
  LAB_TECHNICIAN: '/admin/reports',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold">Authenticating MediCare360 Session...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users cannot access protected routes
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Deactivated accounts are locked out immediately
  if (currentUser.status && currentUser.status !== 'Active') {
    logout();
    return <Navigate to="/login?error=deactivated" replace />;
  }

  // 3. Strict Role-Based Route Protection:
  // If the user's role is not explicitly authorized for this route,
  // access is denied and they are redirected back to their own authorized dashboard.
  // Neither Admin nor any other role can bypass role boundaries.
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const authorizedPath = roleDashboardMap[currentUser.role] || '/login';
    return <Navigate to={authorizedPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
