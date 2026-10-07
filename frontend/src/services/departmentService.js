import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const departmentService = {
  async getAllDepartments() {
    return mockApiCall(() => getItem(STORAGE_KEYS.DEPARTMENTS, []));
  },

  async addDepartment(depData, user) {
    return mockApiCall(() => {
      const departments = getItem(STORAGE_KEYS.DEPARTMENTS, []);
      const newId = `dep-${Date.now()}`;

      const newDepartment = {
        id: newId,
        name: depData.name,
        code: depData.code.toUpperCase(),
        description: depData.description || '',
        headOfDepartment: depData.headOfDepartment || 'To Be Assigned',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      departments.push(newDepartment);
      setItem(STORAGE_KEYS.DEPARTMENTS, departments);

      logAuditEvent('ADD_DEPARTMENT', `New department added: ${newDepartment.name} (${newDepartment.code})`, user?.id, user?.name);

      return newDepartment;
    });
  },

  async updateDepartment(id, updateData, user) {
    return mockApiCall(() => {
      const departments = getItem(STORAGE_KEYS.DEPARTMENTS, []);
      const index = departments.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Department not found');

      departments[index] = { ...departments[index], ...updateData };
      setItem(STORAGE_KEYS.DEPARTMENTS, departments);

      logAuditEvent('UPDATE_DEPARTMENT', `Updated department: ${departments[index].name}`, user?.id, user?.name);
      return departments[index];
    });
  }
};
