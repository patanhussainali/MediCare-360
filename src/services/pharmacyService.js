import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';

export const pharmacyService = {
  async getAllMedicines() {
    return mockApiCall(() => getItem(STORAGE_KEYS.MEDICINES, []));
  },

  async addMedicine(medicineData, user) {
    return mockApiCall(() => {
      const medicines = getItem(STORAGE_KEYS.MEDICINES, []);
      const medId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;

      const newMedicine = {
        id: medId,
        name: medicineData.name,
        category: medicineData.category || 'General Therapeutics',
        dosageForm: medicineData.dosageForm || 'Tablet', // Tablet, Syrup, Injection, Ointment
        dosage: medicineData.dosage || '500mg',
        unitPrice: parseFloat(medicineData.unitPrice) || 0.00,
        stockQuantity: parseInt(medicineData.stockQuantity, 10) || 0,
        minThreshold: parseInt(medicineData.minThreshold, 10) || 10,
        manufacturer: medicineData.manufacturer || 'Pharma Corp',
        batchNumber: medicineData.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
        expiryDate: medicineData.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        status: parseInt(medicineData.stockQuantity, 10) > 0 ? 'Available' : 'Out of Stock',
        addedAt: new Date().toISOString(),
      };

      medicines.push(newMedicine);
      setItem(STORAGE_KEYS.MEDICINES, medicines);

      logAuditEvent('ADD_MEDICINE', `Added new medicine to inventory: ${newMedicine.name} (${medId})`, user?.id, user?.name);

      return newMedicine;
    });
  },

  async updateMedicineStock(id, newQuantity, user) {
    return mockApiCall(() => {
      const medicines = getItem(STORAGE_KEYS.MEDICINES, []);
      const index = medicines.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Medicine item not found in inventory');

      const updatedQty = parseInt(newQuantity, 10);
      medicines[index].stockQuantity = updatedQty;
      medicines[index].status = updatedQty > 0 ? 'Available' : 'Out of Stock';
      medicines[index].updatedAt = new Date().toISOString();

      setItem(STORAGE_KEYS.MEDICINES, medicines);

      logAuditEvent('UPDATE_MEDICINE_STOCK', `Updated stock for ${medicines[index].name} to ${updatedQty}`, user?.id, user?.name);
      return medicines[index];
    });
  },

  async deleteMedicine(id, user) {
    return mockApiCall(() => {
      let medicines = getItem(STORAGE_KEYS.MEDICINES, []);
      const item = medicines.find(m => m.id === id);
      if (!item) throw new Error('Medicine not found');

      medicines = medicines.filter(m => m.id !== id);
      setItem(STORAGE_KEYS.MEDICINES, medicines);

      logAuditEvent('DELETE_MEDICINE', `Removed medicine from inventory: ${item.name}`, user?.id, user?.name);
      return { success: true };
    });
  }
};
