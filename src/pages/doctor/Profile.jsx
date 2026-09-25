import React from 'react';
import { User, Stethoscope, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const DoctorProfile = () => {
  const { currentUser } = useAuth();
  const { doctors } = useData();

  const doctor = doctors.find(d => d.userId === currentUser?.id || d.id === currentUser?.profileId) || {
    name: currentUser?.name || 'Dr. Physician',
    email: currentUser?.email || '',
    department: currentUser?.department || 'General Healthcare',
    specialization: 'General Medicine',
    qualification: 'MD, MBBS',
    experienceYears: 5,
    consultationFee: 100,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-hospital-600 text-white flex items-center justify-center font-bold text-2xl shadow-card">
            {doctor.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{doctor.name}</h2>
            <p className="text-xs text-hospital-600 font-bold mt-0.5">{doctor.specialization} &bull; {doctor.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 font-medium">Qualification</span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{doctor.qualification}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 font-medium">Experience</span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{doctor.experienceYears} Years Practice</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 font-medium">Consultation Fee</span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">${doctor.consultationFee}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-400 font-medium">Email Address</span>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{doctor.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
