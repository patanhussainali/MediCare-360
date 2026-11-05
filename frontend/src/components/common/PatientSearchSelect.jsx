import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { patientService } from '../../services/patientService';

const patientKey = patient => String(patient?.dbId || patient?.id || '');
const patientLabel = patient => patient?.userCode || patient?.patientId || patient?.id || 'No ID';

export default function PatientSearchSelect({
  patients = [],
  value = '',
  onChange,
  placeholder = 'Search by patient name, ID, or mobile…',
  required = true,
  disabled = false,
  inputId,
  ariaInvalid,
  ariaDescribedBy,
  className = '',
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const selectedPatient = useMemo(() => {
    const id = String(value || '');
    if (!id) return null;
    return patients.find(patient => patientKey(patient) === id)
      || (patientKey(selectedOption) === id ? selectedOption : null)
      || remoteResults.find(patient => patientKey(patient) === id)
      || null;
  }, [patients, remoteResults, selectedOption, value]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setRemoteResults([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await patientService.searchPatients(term);
        if (active) setRemoteResults(response.data || []);
      } catch {
        if (active) setRemoteResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const term = query.trim().toLowerCase();
  const combinedPatients = useMemo(() => {
    const unique = new Map();
    [...remoteResults, ...patients].forEach(patient => {
      const key = patientKey(patient);
      if (key) unique.set(key, patient);
    });
    return [...unique.values()];
  }, [patients, remoteResults]);
  const filteredPatients = useMemo(() => {
    if (!term) return combinedPatients.slice(0, 12);
    return combinedPatients.filter(patient => [
      patient?.name,
      patient?.full_name,
      patient?.userCode,
      patient?.patientId,
      patient?.phone,
      patient?.email,
    ].some(field => String(field || '').toLowerCase().includes(term))).slice(0, 20);
  }, [combinedPatients, term]);

  const selectPatient = patient => {
    setSelectedOption(patient);
    onChange?.(patientKey(patient));
    setQuery('');
    setOpen(false);
  };

  const clearSelection = () => {
    setSelectedOption(null);
    onChange?.('');
    setQuery('');
    setOpen(true);
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-label="Search patients by name, ID, or mobile number"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={event => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) {
              setSelectedOption(null);
              onChange?.('');
            }
          }}
          placeholder={selectedPatient ? `${selectedPatient.name || selectedPatient.full_name} · ${patientLabel(selectedPatient)}` : placeholder}
          required={required && !value}
          disabled={disabled}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-hospital-500 focus:ring-2 focus:ring-hospital-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${className}`}
        />
        {value && (
          <button type="button" onClick={clearSelection} disabled={disabled} aria-label="Clear selected patient" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {selectedPatient && !open && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
          <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
          Selected: {selectedPatient.name || selectedPatient.full_name} · {patientLabel(selectedPatient)} · {selectedPatient.phone || 'No mobile'}
        </div>
      )}

      {open && !disabled && (
        <div id={listId} role="listbox" className="absolute left-0 right-0 top-full z-[70] mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {loading && <p className="px-3 py-2.5 text-xs text-slate-500">Searching patients…</p>}
          {!loading && filteredPatients.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-slate-500">{term.length < 2 ? 'Type at least 2 characters to search.' : 'No matching patients found.'}</p>
          )}
          {!loading && filteredPatients.map(patient => {
            const id = patientKey(patient);
            return (
              <button key={id} type="button" role="option" aria-selected={String(value) === id} onMouseDown={event => event.preventDefault()} onClick={() => selectPatient(patient)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-hospital-50 dark:hover:bg-slate-700">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800 dark:text-white">{patient.name || patient.full_name || 'Unnamed patient'}</span>
                  <span className="block truncate text-[11px] text-slate-500">{patientLabel(patient)} · {patient.phone || 'No mobile'}</span>
                </span>
                {String(value) === id && <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
