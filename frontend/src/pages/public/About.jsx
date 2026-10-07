import React from 'react';
import { ShieldCheck, Award, Heart } from 'lucide-react';
import PublicPageHeader from '../../components/common/PublicPageHeader';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <PublicPageHeader />

      <main className="max-w-5xl mx-auto px-6 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-hospital-600 bg-hospital-50 dark:bg-hospital-950/60 dark:text-hospital-400 px-3 py-1 rounded-full uppercase tracking-wider">About MediCare360</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">Dedicated to Clinical Excellence &amp; Patient Care</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            MediCare360 is an integrated hospital management solution engineered to unify inpatient and outpatient workflows, clinical diagnostics, pharmacy logistics, and financial management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <ShieldCheck className="w-8 h-8 text-hospital-600 mb-4" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Role-Based Security</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Multi-tier role access controls guaranteeing strict data privacy for Patients, Doctors, Nurses, Receptionists, Pharmacists, and Administrators.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <Heart className="w-8 h-8 text-rose-500 mb-4" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Patient-Centric Portal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Empowers patients to view their medical history, track prescriptions, book consultation slots, and manage billing transparently.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <Award className="w-8 h-8 text-amber-500 mb-4" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Real-Time Operations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Live statistics, stock alerts, consultation queue tracking, and immediate audit log tracking without hardcoded demo state.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
