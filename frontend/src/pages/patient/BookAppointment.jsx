import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { appointmentService } from '../../services/appointmentService';

const BookAppointment = () => {
  const { currentUser } = useAuth();
  const { doctors, departments, refreshData } = useData();
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState('In-Person Consultation');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Filter available doctors by selected department
  const filteredDoctors = doctors.filter(d => d.status === 'Active' && (!selectedDepartment || d.department === selectedDepartment));

  const availableSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }
    if (!appointmentDate) {
      setError('Please select an appointment date');
      return;
    }
    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const selectedDoc = doctors.find(d => d.id === selectedDoctorId);

      const res = await appointmentService.bookAppointment({
        doctorId: selectedDoc.id,
        doctorName: selectedDoc.name,
        department: selectedDoc.department,
        appointmentDate,
        timeSlot,
        appointmentType,
        reason,
      }, currentUser);

      if (res.success) {
        setSuccess(true);
        refreshData();
      } else {
        setError(res.error || 'Booking failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-hospital-50 text-hospital-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Book Doctor Appointment</h2>
            <p className="text-xs text-slate-400">Select department, specialist doctor, date, and time slot</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl mb-6 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Appointment Scheduled</h3>
            <p className="text-xs text-slate-500 mb-6">Your appointment request has been recorded in system state and sent to the attending doctor.</p>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="px-6 py-3 bg-hospital-600 text-white font-bold text-sm rounded-xl shadow-soft"
            >
              View My Appointments
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">1. Select Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedDoctorId('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-hospital-500"
                >
                  <option value="">All Clinical Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">2. Select Doctor</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-hospital-500"
                >
                  <option value="">-- Choose Doctor --</option>
                  {filteredDoctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialization}) - Fee: ${d.consultationFee}</option>
                  ))}
                </select>
                {filteredDoctors.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">No active doctors registered in this department yet.</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">3. Preferred Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-hospital-500"
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">4. Appointment Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-hospital-500"
                >
                  <option value="In-Person Consultation">In-Person Consultation</option>
                  <option value="Follow-up Visit">Follow-up Visit</option>
                  <option value="Routine Checkup">Routine Checkup</option>
                  <option value="Emergency Consultation">Emergency Consultation</option>
                </select>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">5. Available Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      timeSlot === slot
                        ? 'bg-hospital-600 text-white border-hospital-600 shadow-soft'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-hospital-400'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">6. Reason for Visit / Symptoms</label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your health symptoms or consultation purpose..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-hospital-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-sm rounded-2xl shadow-card transition-all disabled:opacity-50"
            >
              {loading ? 'Processing Appointment...' : 'Confirm Appointment Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
