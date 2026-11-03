import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { initializeStorage, removeItem, STORAGE_KEYS } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    // Initialize non-auth localStorage keys (system settings, audit logs, etc.)
    initializeStorage();

    // Restore session from localStorage cache (populated on login from backend response)
    const storedUser = authService.getCurrentUser();
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isLegacyPreviewSession = storedUser?.isDemo || storedToken?.includes('demo_jwt_token_');
    if (isLegacyPreviewSession) {
      removeItem(STORAGE_KEYS.CURRENT_USER);
      removeItem(STORAGE_KEYS.TOKEN);
      removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setCurrentUser(null);
    } else {
      setCurrentUser(storedUser);
    }

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
      login,
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
