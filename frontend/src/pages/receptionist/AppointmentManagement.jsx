import React, { useState } from 'react';
import { Calendar, Plus, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { appointmentService } from '../../services/appointmentService';
import { formatDate } from '../../utils/formatters';

const AppointmentManagement = () => {
  const { currentUser } = useAuth();
  const { appointments, patients, doctors, refreshData } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!patientId || !doctorId || !appointmentDate) return alert('Fill required fields');

    setLoading(true);
    try {
      const pat = patients.find(p => p.id === patientId);
      const doc = doctors.find(d => d.id === doctorId);

      await appointmentService.bookAppointment({
        patientId: pat.id,
        patientName: pat.name,
        patientPhone: pat.phone,
        doctorId: doc.id,
        doctorName: doc.name,
        department: doc.department,
        appointmentDate,
        timeSlot,
        appointmentType: 'Walk-in Intake',
        reason,
      }, currentUser);

      refreshData();
      alert('Walk-in appointment booked successfully.');
      setIsOpen(false);
    } catch (err) {
      alert(err.message || 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Doctor', accessor: 'doctorName' },
    { header: 'Department', accessor: 'department' },
    { header: 'Date', render: (r) => formatDate(r.appointmentDate) },
    { header: 'Time', accessor: 'timeSlot' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Appointment Desk Management</h2>
          <p className="text-xs text-slate-400">Manage, schedule, and check-in patient appointments</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-hospital-600 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Book Walk-in Appointment
        </button>
      </div>

      <Table
        columns={columns}
        data={appointments}
        emptyTitle="No appointments scheduled."
        emptyDescription="Appointments created in the hospital platform will appear here."
      />

      {/* Book Walk-in Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Book Walk-in Patient Appointment">
        <form onSubmit={handleBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
            <select
              required
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Doctor</label>
            <select
              required
              value={doctorId}
              onChange={e => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
              <input
                type="text"
                required
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
          >
            {loading ? 'Booking...' : 'Book Walk-in Appointment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
