/**
 * billingService.js — MediCare360 Billing / Invoice Service
 * All operations call the Java Spring Boot backend.
 */

import { axiosInstance } from './apiClient.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';
import { logAuditEvent } from './auditService.js';

export const normalizeBill = (b) => {
  if (!b) return null;
  const items = (() => {
    if (Array.isArray(b.items)) return b.items;
    try { return JSON.parse(b.items_json || '[]'); } catch { return []; }
  })();
  return {
    id: b.id,
    invoiceNumber: b.invoice_number || b.invoiceNumber || `INV-${b.id}`,
    patientId: b.patient_id ?? b.patientId,
    patientName: b.patient_name || b.patientName || 'Unknown Patient',
    appointmentId: b.appointment_id ?? b.appointmentId ?? null,
    description: b.description || '',
    items,
    subtotal: parseFloat(b.subtotal || 0),
    tax: parseFloat(b.tax || 0),
    discount: parseFloat(b.discount || 0),
    totalAmount: parseFloat(b.total_amount ?? b.totalAmount ?? 0),
    status: b.payment_status || b.paymentStatus || b.status || 'Pending',
    paymentStatus: b.payment_status || b.paymentStatus || b.status || 'Pending',
    paymentMethod: b.payment_method || b.paymentMethod || null,
    paidAt: b.paid_at || b.paidAt || null,
    notes: b.notes || '',
    createdAt: b.created_at || b.createdAt || new Date().toISOString(),
    updatedAt: b.updated_at || b.updatedAt || null,
  };
};

export const billingService = {
  async getAllBills(patientId, paymentStatus) {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (patientId)     params.append('patient_id', patientId);
      if (paymentStatus) params.append('payment_status', paymentStatus);
      const response = await axiosInstance.get(`/billing?${params.toString()}`);
      const normalized = (response.data || []).map(normalizeBill);
      setItem(STORAGE_KEYS.BILLS, normalized);
      return { success: true, data: normalized };
    } catch (err) {
      return { success: true, data: getItem(STORAGE_KEYS.BILLS, []) };
    }
  },

  async getBillsByPatient(patientId) {
    return this.getAllBills(patientId, null);
  },

  /**
   * Create a new invoice.
   * MongoDB document IDs are passed as strings.
   */
  async createBill(billData, currentUser) {
    const patientId = String(billData.patientId || '').trim();
    if (!patientId) throw new Error('Please select a valid patient.');

    const lineItems = billData.items || [
      { description: billData.description || 'Consultation Fee', amount: parseFloat(billData.amount) || 150 }
    ];
    const subtotal    = lineItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const tax         = parseFloat(billData.tax ?? subtotal * 0.05);
    const discount    = parseFloat(billData.discount ?? 0);
    const totalAmount = subtotal + tax - discount;

    const payload = {
      patient_id:     patientId,
      appointment_id: billData.appointmentId ? String(billData.appointmentId) : null,
      description:    billData.description || '',
      items:          lineItems,
      subtotal,
      tax,
      discount,
      total_amount:   totalAmount,
      payment_status: 'Pending',
      notes:          billData.notes || '',
    };

    try {
      const response = await axiosInstance.post('/billing', payload);
      const created = normalizeBill(response.data);

      const cached = getItem(STORAGE_KEYS.BILLS, []);
      cached.unshift(created);
      setItem(STORAGE_KEYS.BILLS, cached);

      logAuditEvent('GENERATE_BILL', `Invoice ${created.invoiceNumber} created`, currentUser?.id, currentUser?.name);
      return created;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to create invoice');
    }
  },

  /**
   * Mark invoice as Paid (or other status).
   */
  async processPayment(billId, paymentDetails, currentUser) {
    try {
      const payload = {
        payment_status: 'Paid',
        payment_method: paymentDetails.paymentMethod || 'Cash',
      };
      const response = await axiosInstance.patch(`/billing/${billId}/status`, payload);
      const updated = normalizeBill(response.data);

      const cached = getItem(STORAGE_KEYS.BILLS, []);
      const idx = cached.findIndex(b => String(b.id) === String(billId));
      if (idx !== -1) { cached[idx] = updated; setItem(STORAGE_KEYS.BILLS, cached); }

      logAuditEvent('PAYMENT_PROCESSED', `Invoice #${billId} marked as Paid`, currentUser?.id, currentUser?.name);
      return { bill: updated };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to process payment');
    }
  },

  async updateBillStatus(billId, status, currentUser) {
    try {
      const response = await axiosInstance.patch(`/billing/${billId}/status`, { payment_status: status });
      const updated = normalizeBill(response.data);

      const cached = getItem(STORAGE_KEYS.BILLS, []);
      const idx = cached.findIndex(b => String(b.id) === String(billId));
      if (idx !== -1) { cached[idx] = updated; setItem(STORAGE_KEYS.BILLS, cached); }

      return updated;
    } catch (err) {
      throw new Error(err?.response?.data?.detail || err.message || 'Failed to update invoice');
    }
  },
};
