import React from 'react';
import { Stethoscope, HeartPulse, Pill, FileText, CreditCard, Shield } from 'lucide-react';
import PublicPageHeader from '../../components/common/PublicPageHeader';

const Services = () => {
  const servicesList = [
    { title: 'Emergency & Trauma Care', desc: '24/7 immediate trauma triage, critical care stabilization, and rapid response ambulance coordination.', icon: HeartPulse },
    { title: 'Outpatient Consultations', desc: 'Comprehensive specialist outpatient clinics across Cardiology, Neurology, Pediatrics, Orthopedics, and Internal Medicine.', icon: Stethoscope },
    { title: 'Pharmacy & Drug Administration', desc: 'Real-time drug inventory tracking, electronic prescription verification, and dosage administration logging.', icon: Pill },
    { title: 'Electronic Health Records (EHR)', desc: 'Secure clinical documentation, diagnostic history, lab report attachments, and vital sign monitoring.', icon: FileText },
    { title: 'Automated Billing & Revenue Cycle', desc: 'Itemized invoice generation, insurance claim processing simulation, and digital receipt delivery.', icon: CreditCard },
    { title: 'System Administration & Auditing', desc: 'Centralized account management, role permissions control, department tracking, and immutable audit logs.', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <PublicPageHeader />

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-hospital-600 bg-hospital-50 dark:bg-hospital-950/60 dark:text-hospital-400 px-3 py-1 rounded-full uppercase">Healthcare Services</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">Clinical &amp; Operational Modules</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200">
                <div className="p-4 bg-hospital-50 dark:bg-hospital-950/60 text-hospital-600 dark:text-hospital-400 rounded-2xl w-fit mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-2">{srv.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{srv.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Services;
