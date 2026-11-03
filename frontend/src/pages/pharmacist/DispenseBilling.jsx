import React, { useMemo, useState } from 'react';
import { Search, Pill, ReceiptText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { billingService } from '../../services/billingService';
import { pharmacyService } from '../../services/pharmacyService';
import { prescriptionService } from '../../services/prescriptionService';
import { formatCurrency } from '../../utils/formatters';
import BillInvoice from '../../components/common/BillInvoice';
import RefreshButton from '../../components/common/RefreshButton';

const clean = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const DispenseBilling = () => {
  const { currentUser } = useAuth();
  const { patients, prescriptions, medicines, refreshData } = useData();
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('');
  const [quantities, setQuantities] = useState({});
  const [invoice, setInvoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const matchingPatients = patients.filter(patient => {
    const term = clean(search);
    return !term || [patient.name, patient.patientId, patient.id, patient.phone].some(value => clean(value).includes(term));
  });
  const patient = patients.find(record => String(record.id) === String(patientId));
  const patientPrescriptions = prescriptions.filter(rx => String(rx.patientId) === String(patientId) && !['Dispensed', 'Cancelled'].includes(rx.status));
  const selectedPrescription = patientPrescriptions.find(rx => String(rx.id) === String(prescriptionId));
  const lines = useMemo(() => {
    const items = selectedPrescription?.medicines || selectedPrescription?.items || [];
    return items.map((item, index) => {
      const name = item.name || item.medicine_name || item.medicineName || '';
      const medicine = medicines.find(stock => clean(stock.name) === clean(name) || clean(stock.genericName) === clean(name));
      const quantity = Math.max(1, Number(quantities[index] || 1));
      return { index, name, dosage: item.dosage || '', medicine, quantity, unitPrice: Number(medicine?.unitPrice || 0), amount: quantity * Number(medicine?.unitPrice || 0) };
    });
  }, [medicines, quantities, selectedPrescription]);
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  const choosePatient = selected => {
    setPatientId(String(selected.id));
    setPrescriptionId('');
    setInvoice(null);
    setError('');
  };

  const handleCreateInvoice = async () => {
    setError('');
    if (!patient || !selectedPrescription || !lines.length) return setError('Select a patient and an active prescription.');
    if (lines.some(line => !line.medicine)) return setError('Add every prescribed medicine to inventory before dispensing.');
    if (lines.some(line => line.quantity > Number(line.medicine.stockQuantity || 0))) return setError('Requested quantity exceeds available stock.');

    setBusy(true);
    try {
      const createdInvoice = await billingService.createBill({
        patientId: patient.id,
        description: `Medicine Dispense — Prescription ${selectedPrescription.prescriptionNumber || selectedPrescription.id}`,
        items: lines.map(line => ({
          description: `${line.name}${line.dosage ? ` (${line.dosage})` : ''}`,
          medicine_name: line.name,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          amount: line.amount,
        })),
      }, currentUser);
      setInvoice(createdInvoice);

      for (const line of lines) {
        await pharmacyService.issueMedicine({
          medicineId: line.medicine.id,
          patientId: patient.id,
          prescriptionId: selectedPrescription.id,
          quantity: line.quantity,
        }, currentUser);
      }
      await prescriptionService.updateStatus(selectedPrescription.id, 'Dispensed', currentUser);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Could not complete the dispense and invoice flow.');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async bill => {
    setBusy(true);
    setError('');
    try {
      const result = await billingService.processPayment(bill.id, { paymentMethod: 'Cash' }, currentUser);
      setInvoice(result.bill);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Could not update invoice payment status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dispense / Billing</h2><p className="text-xs text-slate-400">Find the patient, verify their prescription, dispense, and issue an invoice.</p></div>
        <RefreshButton onRefresh={refreshData} />
      </header>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <label className="mb-2 block text-xs font-bold">Search patient by name, patient ID, or phone</label>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Type patient name, ID, or 10-digit phone" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></div>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {matchingPatients.slice(0, 30).map(candidate => <button key={candidate.id} type="button" onClick={() => choosePatient(candidate)} className={`w-full rounded-xl border p-3 text-left text-sm ${String(patientId) === String(candidate.id) ? 'border-hospital-500 bg-hospital-50 dark:bg-hospital-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
              <span className="font-bold">{candidate.name || candidate.full_name}</span><span className="ml-2 text-xs text-slate-500">{candidate.patientId || `PAT-${candidate.id}`} · {candidate.phone || 'No phone'}</span>
            </button>)}
            {!matchingPatients.length && <p className="py-4 text-center text-xs text-slate-400">No matching patients.</p>}
          </div>
          {patient && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900"><p><strong>{patient.name || patient.full_name}</strong></p><p>{patient.patientId || `PAT-${patient.id}`} · {patient.phone || 'No phone'} · {patient.gender || 'N/A'}</p><p>{patient.dateOfBirth ? `DOB: ${patient.dateOfBirth}` : ''} {patient.bloodGroup ? `· Blood group: ${patient.bloodGroup}` : ''}</p></div>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <label className="mb-2 block text-xs font-bold">Active prescription</label>
          <select value={prescriptionId} onChange={event => setPrescriptionId(event.target.value)} disabled={!patient} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
            <option value="">Choose a prescription</option>
            {patientPrescriptions.map(rx => <option key={rx.id} value={rx.id}>{rx.prescriptionNumber || `RX-${rx.id}`} · {rx.diagnosis || rx.notes || 'Prescription'}</option>)}
          </select>
          {selectedPrescription && <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-500">Prescribed by {selectedPrescription.doctorName || 'Attending doctor'} · {selectedPrescription.diagnosis}</p>
            {lines.map(line => <div key={line.index} className="grid grid-cols-[1fr_70px_auto] items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700">
              <div><p className="font-bold"><Pill className="mr-1 inline h-3.5 w-3.5" />{line.name}</p><p className="text-slate-500">{line.dosage} · {line.medicine ? `Stock ${line.medicine.stockQuantity}` : 'Not in inventory'}</p></div>
              <input type="number" min="1" max={line.medicine?.stockQuantity || 1} value={quantities[line.index] || 1} onChange={event => setQuantities({ ...quantities, [line.index]: event.target.value })} aria-label={`Quantity for ${line.name}`} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900" />
              <span className="text-right font-bold">{formatCurrency(line.amount)}</span>
            </div>)}
            <div className="flex items-center justify-between border-t pt-3 text-sm font-bold"><span>Medicine subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <p className="text-[11px] text-slate-400">5% tax is added to the stored invoice.</p>
            <button type="button" disabled={busy || !lines.length} onClick={handleCreateInvoice} className="w-full rounded-xl bg-hospital-600 py-3 text-sm font-bold text-white disabled:opacity-50"><ReceiptText className="mr-2 inline h-4 w-4" />{busy ? 'Processing…' : 'Dispense & Generate Invoice'}</button>
          </div>}
          {patient && !patientPrescriptions.length && <p className="mt-4 text-xs text-slate-500">No active prescriptions found for this patient.</p>}
        </div>
      </section>

      {invoice && <BillInvoice bill={invoice} onMarkPaid={handleMarkPaid} busy={busy} />}
    </div>
  );
};

export default DispenseBilling;
