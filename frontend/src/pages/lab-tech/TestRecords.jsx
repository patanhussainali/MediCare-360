import React, { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import RefreshButton from '../../components/common/RefreshButton';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/formatters';

const TestRecords = () => {
  const { currentUser } = useAuth();
  const { medicalRecords, medicalRecordError, refreshMedicalRecords } = useData();
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('In Progress');
  const [results, setResults] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const referrals = medicalRecords.filter(record => record.labReferral);

  useEffect(() => {
    refreshMedicalRecords();
    const intervalId = window.setInterval(refreshMedicalRecords, 20000);
    return () => window.clearInterval(intervalId);
  }, [refreshMedicalRecords]);

  const openReferral = record => {
    setSelected(record);
    setStatus(record.labReferral.status || 'Requested');
    setResults(record.labReferral.results || '');
    setError('');
  };

  const saveResult = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await medicalRecordService.updateRecord(selected.id, {
        labReferral: { ...selected.labReferral, status, results },
      }, currentUser);
      await refreshMedicalRecords();
      setSelected(null);
    } catch (err) {
      setError(err.message || 'Could not save test results.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Referral ID', accessor: 'recordNumber' },
    { header: 'Patient', accessor: 'patientName' },
    { header: 'Patient ID', render: row => row.patientCode || `PAT-${row.patientId}` },
    { header: 'Test Type(s)', render: row => row.labReferral.tests?.join(', ') || '—' },
    { header: 'Referring Doctor', render: row => row.doctorName || '—' },
    { header: 'Referral Date', render: row => formatDate(row.visitDate || row.createdAt) },
    { header: 'Clinical Notes', render: row => row.labReferral.notes || '—' },
    { header: 'Status', render: row => row.labReferral.status || 'Requested' },
    { header: 'Results', render: row => row.labReferral.results || 'Awaiting results' },
    { header: 'Actions', render: row => <button type="button" onClick={() => openReferral(row)} className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white">Update Test</button> },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white"><FlaskConical className="h-7 w-7 text-cyan-600" />Test Referrals</h2><p className="mt-1 text-xs text-slate-400">Doctor-assigned blood tests, X-rays, and other diagnostics.</p></div>
        <RefreshButton onRefresh={refreshMedicalRecords} />
      </header>
      {medicalRecordError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">{medicalRecordError}</div>}
      <Table columns={columns} data={referrals} emptyTitle={medicalRecordError ? 'Unable to load laboratory referrals.' : 'No pending laboratory referrals available.'} emptyDescription={medicalRecordError ? 'Check your connection and use Refresh to try again.' : 'Doctor referrals will appear here automatically.'} />
      {selected && <Modal isOpen onClose={() => setSelected(null)} title={`Update tests · ${selected.patientName}`} maxWidth="max-w-xl">
        <form onSubmit={saveResult} className="space-y-4">
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900"><p className="font-bold">{selected.labReferral.tests?.join(', ')}</p><p className="mt-1 text-slate-500">{selected.labReferral.notes || 'No special notes'}</p></div>
          <div><label className="mb-1 block text-xs font-bold">Status</label><select value={status} onChange={event => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"><option>Requested</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></div>
          <div><label className="mb-1 block text-xs font-bold">Results / report</label><textarea rows="5" value={results} onChange={event => setResults(event.target.value)} placeholder="Enter findings and measurements..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></div>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-cyan-700 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Test Update'}</button>
        </form>
      </Modal>}
    </div>
  );
};

export default TestRecords;
