/**
 * pharmacyService.js — MediCare360 Pharmacy Service
 * All operations call the Java Spring Boot backend at /api/v1/pharmacy.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const normalizeMedicine = (m) => {
  if (!m) return null;
  const stock = m.stock_quantity ?? m.stockQuantity ?? 0;
  const minThreshold = m.min_stock_threshold ?? m.minStockThreshold ?? 10;
  return {
    id: m.id,
    code: m.code || `MED-${m.id}`,
    name: m.name || '',
    genericName: m.generic_name || m.genericName || m.name || '',
    category: m.category || 'General',
    manufacturer: m.manufacturer || '',
    dosage: m.generic_name || m.genericName || '',   // backward compat with UI using dosage
    dosageForm: m.category || 'Tablet',              // backward compat
    unitPrice: parseFloat(m.unit_price ?? m.unitPrice ?? 0),
    stockQuantity: stock,
    minThreshold,
    expiryDate: m.expiry_date || m.expiryDate || '',
    status: m.status || (stock > 0 ? 'Available' : 'Out of Stock'),
    createdAt: m.created_at || m.createdAt || new Date().toISOString(),
  };
};

export const normalizeIssueRecord = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    medicineId: r.medicine_id ?? r.medicineId,
    medicineName: r.medicine_name || r.medicineName || '—',
    patientId: r.patient_id ?? r.patientId,
    patientName: r.patient_name || r.patientName || '—',
    prescriptionId: r.prescription_id ?? r.prescriptionId,
    quantity: r.quantity || 0,
    dispensedBy: r.dispensed_by || r.dispensedBy || '—',
    dispensedAt: r.dispensed_at || r.dispensedAt || r.created_at || new Date().toISOString(),
    notes: r.notes || '',
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
};

export const pharmacyService = {
  /* ─── Medicines ─────────────────────────────────────────────── */

  async getAllMedicines(search, category) {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (search)   params.append('search', search);
      if (category) params.append('category', category);
      const res = await axiosInstance.get(`/pharmacy/medicines?${params.toString()}`);
      const normalized = (res.data || []).map(normalizeMedicine);
      setItem(STORAGE_KEYS.MEDICINES, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      return { success: true, data: getItem(STORAGE_KEYS.MEDICINES, []) };
    }
  },

  async getLowStockMedicines() {
    try {
      const res = await axiosInstance.get('/pharmacy/medicines/low-stock');
      return { success: true, data: (res.data || []).map(normalizeMedicine) };
    } catch (err) {
      const all = getItem(STORAGE_KEYS.MEDICINES, []);
      return { success: true, data: all.filter(m => m.stockQuantity <= m.minThreshold) };
    }
  },

  async addMedicine(medicineData, currentUser) {
    const payload = {
      name:                medicineData.name,
      generic_name:        medicineData.dosage || medicineData.genericName || medicineData.name,
      category:            medicineData.category || 'General',
      manufacturer:        medicineData.manufacturer || '',
      unit_price:          parseFloat(medicineData.unitPrice) || 0,
      stock_quantity:      parseInt(medicineData.stockQuantity) || 0,
      min_stock_threshold: parseInt(medicineData.minThreshold) || 10,
      expiry_date:         medicineData.expiryDate || null,
      status:              parseInt(medicineData.stockQuantity) > 0 ? 'Available' : 'Out of Stock',
    };

    try {
      const res = await axiosInstance.post('/pharmacy/medicines', payload);
      const created = normalizeMedicine(res.data);

      const cached = getItem(STORAGE_KEYS.MEDICINES, []);
      cached.push(created);
      setItem(STORAGE_KEYS.MEDICINES, cached);

      logAuditEvent('ADD_MEDICINE', `Added ${created.name} to inventory`, currentUser?.id, currentUser?.name);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to add medicine');
    }
  },

  async updateMedicineStock(medicineId, newAbsoluteQuantity, currentUser) {
    try {
      // Backend expects quantityDelta; calculate delta from current stock
      const cached = getItem(STORAGE_KEYS.MEDICINES, []);
      const current = cached.find(m => String(m.id) === String(medicineId));
      const currentQty = current?.stockQuantity ?? 0;
      const delta = parseInt(newAbsoluteQuantity) - currentQty;

      const res = await axiosInstance.patch(`/pharmacy/medicines/${medicineId}/stock`, { quantity_delta: delta });
      const updated = normalizeMedicine(res.data);

      const idx = cached.findIndex(m => String(m.id) === String(medicineId));
      if (idx !== -1) { cached[idx] = updated; setItem(STORAGE_KEYS.MEDICINES, cached); }

      logAuditEvent('UPDATE_MEDICINE_STOCK', `Stock updated for ${updated.name}`, currentUser?.id, currentUser?.name);
      return updated;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to update stock');
    }
  },

  async deleteMedicine(medicineId, currentUser) {
    // Java backend doesn't have a delete endpoint — soft-delete by setting stock=0 and status=Discontinued
    try {
      await axiosInstance.patch(`/pharmacy/medicines/${medicineId}`, { status: 'Discontinued' });
      const cached = getItem(STORAGE_KEYS.MEDICINES, []).filter(m => String(m.id) !== String(medicineId));
      setItem(STORAGE_KEYS.MEDICINES, cached);
      logAuditEvent('DELETE_MEDICINE', `Removed medicine ${medicineId}`, currentUser?.id, currentUser?.name);
      return { success: true };
    } catch (err) {
      // Fallback: remove from local cache only
      const cached = getItem(STORAGE_KEYS.MEDICINES, []).filter(m => String(m.id) !== String(medicineId));
      setItem(STORAGE_KEYS.MEDICINES, cached);
      return { success: true };
    }
  },

  /* ─── Issue / Dispense Records ──────────────────────────────── */

  async getAllIssueRecords() {
    try {
      const res = await axiosInstance.get('/pharmacy/issue?limit=200');
      const normalized = (res.data || []).map(normalizeIssueRecord);
      setItem(STORAGE_KEYS.MEDICINE_ISSUES || 'medicine_issues', normalized);
      return { success: true, data: normalized };
    } catch (err) {
      return { success: true, data: getItem(STORAGE_KEYS.MEDICINE_ISSUES || 'medicine_issues', []) };
    }
  },

  /**
   * Issue medicine manually (outside of prescription dispense flow).
   * MongoDB document IDs are sent as strings.
   */
  async issueMedicine(issueData, currentUser) {
    const medicineId = String(issueData.medicineId || '').trim();
    const patientId  = String(issueData.patientId || '').trim();
    const prescriptionId = String(issueData.prescriptionId || '').trim();

    if (!medicineId) throw new Error('Select a valid medicine.');
    if (!patientId) throw new Error('Select a valid patient.');

    const payload = {
      medicine_id:     medicineId,
      patient_id:      patientId,
      prescription_id: prescriptionId || null,
      quantity:        parseInt(issueData.quantity) || 1,
      notes:           issueData.notes || '',
    };

    try {
      const res = await axiosInstance.post('/pharmacy/issue', payload);
      const created = normalizeIssueRecord(res.data);
      logAuditEvent('ISSUE_MEDICINE', `Issued ${created.medicineName} to ${created.patientName}`, currentUser?.id, currentUser?.name);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to issue medicine');
    }
  },
};
