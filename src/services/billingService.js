import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';
import { logAuditEvent } from './auditService';
import { notificationService } from './notificationService';

export const billingService = {
  async getAllBills() {
    return mockApiCall(() => getItem(STORAGE_KEYS.BILLS, []));
  },

  async getBillsByPatient(patientId) {
    return mockApiCall(() => {
      const bills = getItem(STORAGE_KEYS.BILLS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);
      const patient = patients.find(p => p.id === patientId || p.userId === patientId);

      return bills.filter(b => b.patientId === patientId || (patient && b.patientId === patient.id));
    });
  },

  async createBill(billData, user) {
    return mockApiCall(() => {
      const bills = getItem(STORAGE_KEYS.BILLS, []);
      const patients = getItem(STORAGE_KEYS.PATIENTS, []);

      const patient = patients.find(p => p.id === billData.patientId || p.name === billData.patientName);
      if (!patient) throw new Error('Patient record not found');

      const invId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

      const lineItems = billData.items || [
        { description: billData.description || 'Consultation & Clinical Care Fee', amount: parseFloat(billData.amount) || 150.00 }
      ];

      const subtotal = lineItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
      const tax = subtotal * 0.05; // 5% healthcare tax
      const totalAmount = subtotal + tax;

      const newBill = {
        id: invId,
        patientId: patient.id,
        patientUserId: patient.userId,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        items: lineItems,
        subtotal,
        tax,
        totalAmount,
        status: billData.status || 'Pending', // 'Pending', 'Paid', 'Overdue'
        paymentMethod: null,
        dueDate: billData.dueDate || new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
        createdDate: new Date().toISOString(),
      };

      bills.unshift(newBill);
      setItem(STORAGE_KEYS.BILLS, bills);

      logAuditEvent('GENERATE_BILL', `Invoice ${invId} ($${totalAmount.toFixed(2)}) created for ${patient.name}`, user?.id, user?.name);

      notificationService.createNotification({
        userId: patient.userId,
        title: 'New Billing Invoice Generated',
        message: `Invoice ${invId} for $${totalAmount.toFixed(2)} is pending payment.`,
        type: 'BILLING',
      });

      return newBill;
    });
  },

  async processPayment(billId, paymentDetails, user) {
    return mockApiCall(() => {
      const bills = getItem(STORAGE_KEYS.BILLS, []);
      const payments = getItem(STORAGE_KEYS.PAYMENTS, []);

      const index = bills.findIndex(b => b.id === billId);
      if (index === -1) throw new Error('Invoice not found');

      const bill = bills[index];
      bill.status = 'Paid';
      bill.paidAt = new Date().toISOString();
      bill.paymentMethod = paymentDetails.paymentMethod || 'Credit Card (Simulated)';
      bill.transactionId = `TXN-${Date.now()}`;

      const paymentRecord = {
        id: `PAY-${Date.now()}`,
        billId: bill.id,
        patientName: bill.patientName,
        amount: bill.totalAmount,
        paymentMethod: bill.paymentMethod,
        transactionId: bill.transactionId,
        paidAt: bill.paidAt,
      };

      payments.unshift(paymentRecord);

      setItem(STORAGE_KEYS.BILLS, bills);
      setItem(STORAGE_KEYS.PAYMENTS, payments);

      logAuditEvent('PAYMENT_PROCESSED', `Payment of $${bill.totalAmount.toFixed(2)} received for Invoice ${bill.id}`, user?.id, user?.name);

      if (bill.patientUserId) {
        notificationService.createNotification({
          userId: bill.patientUserId,
          title: 'Payment Receipt Confirmed',
          message: `Your payment of $${bill.totalAmount.toFixed(2)} for invoice ${bill.id} was processed successfully.`,
          type: 'BILLING',
        });
      }

      return { bill, paymentRecord };
    });
  }
};
