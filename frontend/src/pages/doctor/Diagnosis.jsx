import React, { useEffect, useRef, useState } from 'react';
import { PlusCircle, FlaskConical, Save, LoaderCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PatientSearchSelect from '../../components/common/PatientSearchSelect';
import { medicalRecordService } from '../../services/medicalRecordService';
import { formatDate } from '../../utils/formatters';

const Diagnosis = () => {
  const { currentUser } = useAuth();
  const { patients, medicalRecords, refreshMedicalRecords } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referral, setReferral] = useState({ patientId: '', tests: [], notes: '' });
  const [referralError, setReferralError] = useState('');
  const [referralSuccess, setReferralSuccess] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    treatmentPlan: '',
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    temperature: '98.6 °F',
    spo2: '99%',
    labNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const savingRef = useRef(false);

  useEffect(() => {
    const intervalId = window.setInterval(refreshMedicalRecords, 20000);
    return () => window.clearInterval(intervalId);
  }, [refreshMedicalRecords]);

  const labReferrals = medicalRecords.filter(record => record.labReferral);

  const handleCreateReferral = async (event) => {
    event.preventDefault();
    setReferralError('');
    setReferralSuccess('');
    if (!referral.patientId || !referral.tests.length) {
      setReferralError('Select a patient and at least one test.');
      return;
    }
    setReferralLoading(true);
    try {
      await medicalRecordService.createRecord({
        recordType: 'LAB_REFERRAL',
        patientId: referral.patientId,
        tests: referral.tests,
        labNotes: referral.notes,
      }, currentUser);
      await refreshMedicalRecords();
      setReferralSuccess('Laboratory referral created successfully.');
      setReferralOpen(false);
      setReferral({ patientId: '', tests: [], notes: '' });
    } catch (err) {
      setReferralError(err.message || 'Could not create the lab referral.');
    } finally {
      setReferralLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (savingRef.current) return;
    const errors = {};
    if (!form.patientId) errors.patientId = 'Select a registered patient.';
    if (!form.diagnosis.trim()) errors.diagnosis = 'Enter a diagnosis title.';
    if (form.symptoms.trim().length > 500) errors.symptoms = 'Symptoms must be 500 characters or fewer.';
    setFormErrors(errors);
    setFormError('');
    if (Object.keys(errors).length) return;

    savingRef.current = true;
    setLoading(true);
    try {
      await medicalRecordService.createRecord({
        patientId: form.patientId,
        diagnosis: form.diagnosis.trim(),
        symptoms: form.symptoms.trim(),
        treatmentPlan: [form.treatmentPlan.trim(), form.labNotes.trim() ? `Clinical Notes: ${form.labNotes.trim()}` : ''].filter(Boolean).join('\n\n'),
        vitals: {
          bloodPressure: form.bloodPressure,
          heartRate: form.heartRate,
          temperature: form.temperature,
          spo2: form.spo2,
        },
        labNotes: form.labNotes
      }, currentUser);

      await refreshMedicalRecords();
      setForm({ patientId: '', diagnosis: '', symptoms: '', treatmentPlan: '', bloodPressure: '120/80 mmHg', heartRate: '72 bpm', temperature: '98.6 °F', spo2: '99%', labNotes: '' });
      alert('Medical record and diagnosis entry recorded.');
      setIsOpen(false);
    } catch (err) {
      setFormError(err.message || 'Could not save the diagnosis record. Please try again.');
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Symptoms', accessor: 'symptoms' },
    { header: 'Attending Doctor', accessor: 'doctorName' },
    { header: 'Date', render: (r) => formatDate(r.date) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Clinical Diagnosis & Medical Records</h2>
          <p className="text-xs text-slate-400">Issue diagnostic assessments, treatment plans, and vital sign logs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setReferralOpen(true)} className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Refer to Lab</button>
          <button onClick={() => setIsOpen(true)} className="px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Add Clinical Record</button>
        </div>
      </div>

      {referralSuccess && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">{referralSuccess}</div>}

      <Table
        columns={columns}
        data={medicalRecords}
        emptyTitle="No medical records available."
        emptyDescription="Logged clinical diagnoses will appear here."
      />

      <section className="space-y-3">
        <div><h3 className="text-lg font-bold text-slate-800 dark:text-white">Lab Referrals</h3><p className="text-xs text-slate-400">Referral status and results from the laboratory team.</p></div>
        <Table columns={[
          { header: 'Patient', accessor: 'patientName' },
          { header: 'Tests', render: row => row.labReferral.tests?.join(', ') || '—' },
          { header: 'Status', render: row => row.labReferral.status || 'Requested' },
          { header: 'Results', render: row => row.labReferral.results || 'Awaiting results' },
          { header: 'Notes', render: row => row.labReferral.notes || '—' },
        ]} data={labReferrals} emptyTitle="No lab referrals yet." emptyDescription="Use Refer to Lab to send tests to the technician queue." />
      </section>

      <Modal isOpen={referralOpen} onClose={() => setReferralOpen(false)} title="Assign Patient to Lab" maxWidth="max-w-xl">
        <form onSubmit={handleCreateReferral} className="space-y-4 text-sm">
          {referralError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{referralError}</div>}
          <div><label htmlFor="lab-referral-patient" className="mb-1 block text-xs font-bold">Patient</label><PatientSearchSelect inputId="lab-referral-patient" patients={patients} value={referral.patientId} onChange={patientId => setReferral({ ...referral, patientId })} placeholder="Search patient by name, ID, or mobile…" /></div>
          <fieldset><legend className="mb-2 text-xs font-bold">Tests to perform</legend><div className="grid grid-cols-2 gap-2">{['Blood Test', 'Complete Blood Count (CBC)', 'Blood Glucose', 'Urine Test', 'X-ray', 'ECG', 'Lipid Profile', 'Liver Function Test'].map(test => <label key={test} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700"><input type="checkbox" checked={referral.tests.includes(test)} onChange={event => setReferral({ ...referral, tests: event.target.checked ? [...referral.tests, test] : referral.tests.filter(item => item !== test) })} />{test}</label>)}</div></fieldset>
          <div><label className="mb-1 block text-xs font-bold">Clinical notes</label><textarea rows="3" value={referral.notes} onChange={event => setReferral({ ...referral, notes: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></div>
          <button type="submit" disabled={referralLoading} className="w-full rounded-xl bg-cyan-700 py-3 text-sm font-bold text-white disabled:opacity-50">{referralLoading ? 'Sending referral…' : 'Send to Lab Technician'}</button>
        </form>
      </Modal>

      {/* New Diagnosis Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New Clinical Diagnosis Entry"
        description="Enter patient diagnosis and treatment information."
        maxWidth="max-w-[820px]"
        formLayout
        onSubmit={handleSubmit}
        footer={(
          <div className="flex w-full items-center justify-between gap-3">
            <button type="button" onClick={() => { setIsOpen(false); setFormError(''); setFormErrors({}); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 sm:px-4">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex min-h-[46px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-hospital-800 px-3 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-hospital-900 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hospital-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-44 sm:flex-none sm:px-5">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              {loading ? 'Saving…' : 'Save Diagnosis'}
            </button>
          </div>
        )}
      >
        <div className="space-y-5 text-xs">
          {formError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">{formError}</div>}
          <section className="space-y-2" aria-labelledby="patient-info-heading">
            <h4 id="patient-info-heading" className="text-sm font-bold text-slate-800 dark:text-white">Patient Information</h4>
            <label htmlFor="diagnosis-patient" className="block font-semibold text-slate-700 dark:text-slate-300">Select Registered Patient <span className="text-rose-600">*</span></label>
            <PatientSearchSelect
              inputId="diagnosis-patient"
              patients={patients}
              value={form.patientId}
              onChange={patientId => { setForm({ ...form, patientId }); setFormErrors({ ...formErrors, patientId: '' }); }}
              ariaInvalid={Boolean(formErrors.patientId)}
              ariaDescribedBy={formErrors.patientId ? 'diagnosis-patient-error' : undefined}
              placeholder="Search patient by name, ID, or mobile…"
              className={formErrors.patientId ? 'border-rose-500' : 'px-4 py-3'}
            />
            {formErrors.patientId && <p id="diagnosis-patient-error" className="text-xs text-rose-600">{formErrors.patientId}</p>}
          </section>

          <section className="space-y-2" aria-labelledby="diagnosis-info-heading">
            <h4 id="diagnosis-info-heading" className="text-sm font-bold text-slate-800 dark:text-white">Diagnosis Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="diagnosis-title" className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Diagnosis Title <span className="text-rose-600">*</span></label>
              <input
                id="diagnosis-title"
                type="text"
                aria-invalid={Boolean(formErrors.diagnosis)}
                aria-describedby={formErrors.diagnosis ? 'diagnosis-title-error' : undefined}
                placeholder="e.g. Acute Bronchitis"
                value={form.diagnosis}
                onChange={e => { setForm({ ...form, diagnosis: e.target.value }); setFormErrors({ ...formErrors, diagnosis: '' }); }}
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900 ${formErrors.diagnosis ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
              />
              {formErrors.diagnosis && <p id="diagnosis-title-error" className="mt-1 text-xs text-rose-600">{formErrors.diagnosis}</p>}
            </div>

            <div>
              <label htmlFor="diagnosis-symptoms" className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Symptoms <span className="font-normal text-slate-400">(optional)</span></label>
              <input
                id="diagnosis-symptoms"
                type="text"
                maxLength={500}
                aria-invalid={Boolean(formErrors.symptoms)}
                aria-describedby={formErrors.symptoms ? 'diagnosis-symptoms-error' : undefined}
                placeholder="e.g. Cough, Fever, Fatigue"
                value={form.symptoms}
                onChange={e => { setForm({ ...form, symptoms: e.target.value }); setFormErrors({ ...formErrors, symptoms: '' }); }}
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900 ${formErrors.symptoms ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
              />
              {formErrors.symptoms && <p id="diagnosis-symptoms-error" className="mt-1 text-xs text-rose-600">{formErrors.symptoms}</p>}
            </div>
          </div>
          </section>

          {/* Vitals */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60" aria-labelledby="patient-vitals-heading">
            <h4 id="patient-vitals-heading" className="mb-3 text-sm font-bold text-slate-800 dark:text-white">Patient Vitals</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[10px] text-slate-400">BP (mmHg)</label>
                <input
                  type="text"
                  value={form.bloodPressure}
                  onChange={e => setForm({ ...form, bloodPressure: e.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Heart Rate</label>
                <input
                  type="text"
                  value={form.heartRate}
                  onChange={e => setForm({ ...form, heartRate: e.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">Temp (°F)</label>
                <input
                  type="text"
                  value={form.temperature}
                  onChange={e => setForm({ ...form, temperature: e.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400">SpO2 (%)</label>
                <input
                  type="text"
                  value={form.spo2}
                  onChange={e => setForm({ ...form, spo2: e.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="treatment-info-heading">
            <h4 id="treatment-info-heading" className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Treatment Information</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="diagnosis-treatment" className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Treatment Plan</label>
                <textarea id="diagnosis-treatment" rows="3" value={form.treatmentPlan} onChange={e => setForm({ ...form, treatmentPlan: e.target.value })} placeholder="Add the treatment plan and patient instructions..." className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </div>
              <div>
                <label htmlFor="diagnosis-notes" className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Clinical Notes <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea id="diagnosis-notes" rows="3" value={form.labNotes} onChange={e => setForm({ ...form, labNotes: e.target.value })} placeholder="Add additional clinical notes..." className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </div>
            </div>
          </section>

        </div>
      </Modal>
    </div>
  );
};

export default Diagnosis;
