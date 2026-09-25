import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const authService = {
  // Check if system has any registered admin
  async checkAdminStatus() {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const hasAdmin = users.some(u => u.role === 'ADMIN');
      return { hasAdmin, totalUsers: users.length };
    });
  },

  // Initial setup routine for establishing the primary Admin account
  async setupMasterAdmin(adminData) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const existingAdmin = users.find(u => u.role === 'ADMIN');
      if (existingAdmin) {
        throw new Error('System administrator account is already configured.');
      }

      const newAdmin = {
        id: 'usr-admin-1',
        name: adminData.name || 'Hospital Administrator',
        email: adminData.email.trim().toLowerCase(),
        password: adminData.password, // In real backend, hashed with bcrypt
        role: 'ADMIN',
        department: 'Executive Administration',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      users.push(newAdmin);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('INITIAL_SYSTEM_SETUP', 'System Administrator account created', newAdmin.id, newAdmin.name);

      return { message: 'Master Administrator created successfully', user: newAdmin };
    });
  },

  // Login handler with role authentication
  async login(email, password, role) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const cleanEmail = email.trim().toLowerCase();

      const user = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        throw new Error('Account not found. Please contact your Hospital Administrator.');
      }

      if (user.password !== password) {
        throw new Error('Invalid email or password.');
      }

      if (user.status !== 'Active') {
        throw new Error('Account is inactive. Please contact Hospital Administration.');
      }

      // Role check - allow Admin to login via Admin portal or specify matching role
      if (role && user.role !== role && user.role !== 'ADMIN') {
        throw new Error(`This account is registered as ${user.role}, not ${role}.`);
      }

      const token = `jwt_token_${user.id}_${Date.now()}`;
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'N/A',
        profileId: user.profileId || null,
        status: user.status
      };

      setItem(STORAGE_KEYS.CURRENT_USER, userSession);
      setItem(STORAGE_KEYS.TOKEN, token);

      logAuditEvent('USER_LOGIN', `User logged in as ${user.role}`, user.id, user.name);

      return { user: userSession, token };
    });
  },

  // Patient registration (self-registration flow if allowed)
  async registerPatient(patientData) {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const cleanEmail = patientData.email.trim().toLowerCase();

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email address already exists.');
      }

      const newId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
      const userId = `usr-pat-${Date.now()}`;

      const newPatientProfile = {
        id: newId,
        userId: userId,
        name: patientData.name,
        email: cleanEmail,
        phone: patientData.phone,
        gender: patientData.gender,
        dateOfBirth: patientData.dateOfBirth,
        bloodGroup: patientData.bloodGroup || 'Not Specified',
        address: patientData.address || '',
        emergencyContact: patientData.emergencyContact || '',
        allergies: patientData.allergies ? patientData.allergies.split(',').map(a => a.trim()) : [],
        chronicConditions: patientData.chronicConditions ? patientData.chronicConditions.split(',').map(c => c.trim()) : [],
        status: 'Active',
        registeredAt: new Date().toISOString(),
      };

      const newUserAccount = {
        id: userId,
        profileId: newId,
        name: patientData.name,
        email: cleanEmail,
        password: patientData.password,
        role: 'PATIENT',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      patients.push(newPatientProfile);
      users.push(newUserAccount);

      setItem(STORAGE_KEYS.PATIENTS, patients);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('PATIENT_REGISTER', `New patient registered: ${patientData.name}`, userId, patientData.name);

      return { patient: newPatientProfile, user: newUserAccount };
    });
  },

  getCurrentUser() {
    return getItem(STORAGE_KEYS.CURRENT_USER, null);
  },

  logout() {
    const user = getItem(STORAGE_KEYS.CURRENT_USER, null);
    if (user) {
      logAuditEvent('USER_LOGOUT', `User logged out`, user.id, user.name);
    }
    removeItem(STORAGE_KEYS.CURRENT_USER);
    removeItem(STORAGE_KEYS.TOKEN);
  }
};
