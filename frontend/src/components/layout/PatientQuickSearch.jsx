import React, { useEffect, useRef, useState } from 'react';
import { Search, UserRound, X } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';

const searchableRoles = new Set([
  'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN',
]);

export default function PatientQuickSearch() {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const role = String(currentUser?.role || '').toUpperCase();

  useEffect(() => {
    const value = query.trim();
    setSelectedPatient(null);
    if (value.length < 2) {
      setResults([]);
      setError('');
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await patientService.searchPatients(value);
        if (active) {
          setResults(response.data || []);
          setError('');
        }
      } catch (searchError) {
        if (active) {
          setResults([]);
          setError(searchError.message || 'Could not search patients.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  useEffect(() => {
    const close = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!searchableRoles.has(role)) return null;

  const selectPatient = patient => setSelectedPatient(patient);

  return (
    <div ref={rootRef} className="relative w-full max-w-md px-3 py-2 md:px-0 md:py-0">
      <label className="sr-only" htmlFor="patient-quick-search">Search patients by name, user ID, or mobile number</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="patient-quick-search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={event => { setQuery(event.target.value); setOpen(true); }}
          placeholder="Search patients by name, ID, or mobile"
          className="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {query && <button type="button" aria-label="Clear patient search" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute left-3 right-3 top-full z-50 mt-1 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl md:left-0 md:right-0 dark:border-slate-700 dark:bg-slate-800">
          {loading && <p className="px-3 py-3 text-xs text-slate-500">Searching…</p>}
          {!loading && error && <p role="alert" className="px-3 py-3 text-xs text-rose-600">{error}</p>}
          {!loading && !error && results.length === 0 && <p className="px-3 py-3 text-xs text-slate-500">No patients found.</p>}
          {!loading && results.map(patient => (
            <button key={patient.id} type="button" onClick={() => selectPatient(patient)} className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-hospital-50 dark:hover:bg-slate-700">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-hospital-600" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-800 dark:text-white">{patient.name}</span>
                <span className="block truncate text-[10px] text-slate-500">{patient.userCode || 'User ID pending'} · {patient.phone || 'No mobile'}</span>
              </span>
            </button>
          ))}
          {selectedPatient && (
            <div className="m-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] dark:border-slate-700 dark:bg-slate-900">
              <p className="font-bold text-slate-800 dark:text-white">{selectedPatient.name}</p>
              <p className="mt-1 text-slate-500">User ID: {selectedPatient.userCode || 'Pending assignment'} · Patient ID: {selectedPatient.patientId}</p>
              <p className="text-slate-500">Mobile: {selectedPatient.phone || 'Not provided'} · Blood group: {selectedPatient.bloodGroup || 'Not recorded'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
