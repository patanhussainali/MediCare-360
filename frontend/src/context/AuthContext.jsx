import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { initializeStorage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);

  const refreshAuth = async () => {
    // Initialize non-auth localStorage keys (system settings, audit logs, etc.)
    initializeStorage();

    // Restore session from localStorage cache (populated on login from backend response)
    const storedUser = authService.getCurrentUser();
    setCurrentUser(storedUser);

    // Check backend for admin existence (drives first-run setup UI)
    const adminCheck = await authService.checkAdminStatus();
    setHasAdmin(adminCheck.data?.hasAdmin || false);
    setLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email, password, role) => {
    const res = await authService.login(email, password, role);
    if (res.success) {
      setCurrentUser(res.data.user);
    }
    return res;
  };

  const setupMasterAdmin = async (adminData) => {
    const res = await authService.setupMasterAdmin(adminData);
    if (res.success) {
      setHasAdmin(true);
    }
    return res;
  };

  const registerPatient = async (patientData) => {
    return authService.registerPatient(patientData);
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      hasAdmin,
      login,
      setupMasterAdmin,
      registerPatient,
      logout,
      refreshAuth,
      isAuthenticated: !!currentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
