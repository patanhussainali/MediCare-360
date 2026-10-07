import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage.js';
import { mockApiCall } from './apiClient.js';
import { logAuditEvent } from './auditService.js';
import { hashPassword, verifyPassword } from '../utils/security.js';

const INVALID_CREDENTIALS_MSG = 'Invalid credentials or unauthorized role.';

export const authService = {
  // Check if system has any registered admin
  async checkAdminStatus() {
    return mockApiCall(() => {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const hasAdmin = users.some(u => u.role === 'ADMIN' && u.status === 'Active');
      return { hasAdmin, totalUsers: users.length };
    });
  },

  // Initial setup routine for establishing the primary Admin account
  async setupMasterAdmin(adminData) {
    const passwordHash = await hashPassword(adminData.password);
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
        password: passwordHash,
        password_hash: passwordHash,
        role: 'ADMIN',
        department: 'Executive Administration',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newAdmin);
      setItem(STORAGE_KEYS.USERS, users);

      logAuditEvent('INITIAL_SYSTEM_SETUP', 'System Administrator account created', newAdmin.id, newAdmin.name);

      return { message: 'Master Administrator created successfully', user: newAdmin };
    });
  },

  // Centralized Login handler validating Email, Password, and Role strictly against the Database
  async login(email, password, selectedRole) {
    if (!email || !password) {
      throw new Error(INVALID_CREDENTIALS_MSG);
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getItem(STORAGE_KEYS.USERS, []);

    // 1. Find user by email in central user database
    const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (!user) {
      // Do not reveal whether email exists
      throw new Error(INVALID_CREDENTIALS_MSG);
    }

    // 2. Verify Password using cryptographic verification
    const storedHashOrPlain = user.password_hash || user.password;
    const isPasswordValid = await verifyPassword(password, storedHashOrPlain);
    if (!isPasswordValid) {
      // Do not reveal whether password was incorrect
      throw new Error(INVALID_CREDENTIALS_MSG);
    }

    // 3. Verify Database Role matches the Selected Login Role (Prevent Role Switching)
    // The role stored in the backend/database is ALWAYS the single source of truth.
    // Neither Doctor, Nurse, Admin, nor any role can log in through an unauthorized role entry point.
    const normalizedSelectedRole = (selectedRole || '').toUpperCase();
    const normalizedUserRole = (user.role || '').toUpperCase();

    if (!normalizedSelectedRole || normalizedUserRole !== normalizedSelectedRole) {
      // Do not reveal whether role was wrong vs bad password
      throw new Error(INVALID_CREDENTIALS_MSG);
    }

    // 4. Validate Account Status
    if (user.status !== 'Active') {
      throw new Error('Account is deactivated. Please contact Hospital Administration.');
    }

    // 5. Upgrade legacy plain-text password to hash in background if needed
    if (!user.password_hash || !user.password_hash.startsWith('$sha256$')) {
      hashPassword(password).then(newHash => {
        const currentUsers = getItem(STORAGE_KEYS.USERS, []);
        const idx = currentUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          currentUsers[idx].password_hash = newHash;
          currentUsers[idx].password = newHash;
          setItem(STORAGE_KEYS.USERS, currentUsers);
        }
      }).catch(() => {});
    }

    // 6. Generate secure session & token using database-defined role (never user-input role)
    const token = `jwt_${user.id}_${user.role}_${Date.now()}`;
    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // Database role is strictly enforced
      department: user.department || 'N/A',
      profileId: user.profileId || null,
      status: user.status,
    };

    setItem(STORAGE_KEYS.CURRENT_USER, userSession);
    setItem(STORAGE_KEYS.TOKEN, token);

    logAuditEvent('USER_LOGIN', `User authenticated successfully via ${user.role} Portal`, user.id, user.name);

    return { success: true, data: { user: userSession, token } };
  },

  // Patient registration (self-registration)
  async registerPatient(patientData) {
    const passwordHash = await hashPassword(patientData.password);
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
        password: passwordHash,
        password_hash: passwordHash,
        role: 'PATIENT',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
