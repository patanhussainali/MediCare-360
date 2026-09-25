import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
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

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role) && currentUser.role !== 'ADMIN') {
    const roleRoutes = {
      PATIENT: '/patient/dashboard',
      DOCTOR: '/doctor/dashboard',
      NURSE: '/nurse/dashboard',
      RECEPTIONIST: '/receptionist/dashboard',
      PHARMACIST: '/pharmacist/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={roleRoutes[currentUser.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
