import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Activity, Users, Calendar,
  FlaskConical, Stethoscope, HeartPulse, Clock, CheckCircle2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

/* ─────────── animated counter hook ─────────── */
const useCounter = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

/* ─────────── stat card ─────────── */
const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${color} bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm`}>
    <div className="p-1.5 rounded-xl bg-white dark:bg-slate-700 shadow-sm">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-none">{label}</p>
      <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
    </div>
  </div>
);

/* ─────────── feature badge ─────────── */
const FeatureBadge = ({ icon: Icon, text }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
    <Icon className="w-3.5 h-3.5 text-hospital-500" /> {text}
  </span>
);

/* ─────────── mock dashboard card ─────────── */
const DashboardCard = ({ label, value, sub, accent }) => (
  <div className={`p-4 rounded-2xl border ${accent} bg-white dark:bg-slate-800 shadow-soft`}>
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
    {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

/* ─────────── main component ─────────── */
const HeroSection = () => {
  const { stats } = useData();
  const [activeTab, setActiveTab] = useState('workstation');

  const doctors = useCounter(stats?.totalDoctors ?? 42);
  const patients = useCounter(stats?.totalPatients ?? 1248);
  const appointments = useCounter(stats?.totalAppointments ?? 326);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-hospital-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">

      {/* ── decorative blobs ── */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-hospital-400/15 dark:bg-hospital-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-muted-teal/15 dark:bg-muted-teal/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-soft-sage/15 dark:bg-hospital-900/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <div className="space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-hospital-50 dark:bg-hospital-950/60 text-hospital-700 dark:text-hospital-400 border border-hospital-200 dark:border-hospital-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-hospital-500 animate-pulse" />
            Next-Generation Hospital Management Platform
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl lg:text-[64px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
              Unified{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-hospital-600">Digital</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-hospital-200/60 dark:bg-hospital-800/40 rounded-full -z-0" />
              </span>{' '}
              Healthcare
            </h1>
            <h2 className="text-5xl md:text-6xl lg:text-[64px] font-black text-slate-700 dark:text-slate-300 tracking-tight leading-[1.08]">
              Management.
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            MediCare360 unifies clinical operations, patient records, appointments, pharmacy, billing, and
            multi-role staff management into one seamless, secure platform.
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2">
            <FeatureBadge icon={Shield} text="HIPAA Compliant" />
            <FeatureBadge icon={HeartPulse} text="Live Patient Monitoring" />
            <FeatureBadge icon={FlaskConical} text="Pharmacy Integrated" />
            <FeatureBadge icon={Calendar} text="Smart Scheduling" />
            <FeatureBadge icon={Stethoscope} text="Multi-Role Access" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-hospital-500/30 transition-all transform hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 font-bold text-base rounded-2xl shadow-sm transition-all"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: CheckCircle2, text: 'All 6 roles included' },
              { icon: CheckCircle2, text: 'Real-time data' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Icon className="w-4 h-4 text-hospital-600" /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════ RIGHT COLUMN – Dashboard Preview ══════════════════ */}
        <div className="relative">

          {/* Floating live indicator */}
          <div className="absolute -top-4 left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-hospital-600 text-white text-xs font-bold rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {activeTab === 'workstation' ? 'Connected Workstation' : 'Live Dashboard'}
          </div>

          {/* Main card */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">

            {/* Card header bar with view toggle tabs */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-deep-forest to-hospital-600 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5" />
                <span className="font-bold text-sm">MediCare360 Overview</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('workstation')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'workstation'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Clinical Station
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Live Metrics
                </button>
              </div>
            </div>

            {/* Conditional Tab Body */}
            {activeTab === 'workstation' ? (
              <div className="p-4 sm:p-5 space-y-4">
                {/* Image Card Container */}
                <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 group">
                  <img
                    src="/images/landing-hero-stethoscope.png"
                    alt="Clinical Workstation - MediCare360"
                    className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Subtle gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid telemetry chip */}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-hospital-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white">Digital Stethoscope: Synced</span>
                  </div>

                  {/* Bottom banner info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/85 backdrop-blur-md rounded-xl px-3.5 py-2 border border-white/10 text-white">
                    <div>
                      <p className="text-xs font-bold">Diagnostic Workstation Terminal</p>
                      <p className="text-[10px] text-slate-300">Auscultation &amp; Telemetry streaming ready</p>
                    </div>
                    <Link
                      to="/login"
                      className="px-3 py-1 text-[11px] font-bold bg-hospital-500 hover:bg-hospital-600 text-black rounded-lg transition-colors"
                    >
                      Launch
                    </Link>
                  </div>
                </div>

                {/* Sub features grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sensor Frequency</p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">20Hz – 2000Hz</p>
                    <p className="text-[10px] text-hospital-600 dark:text-hospital-400 font-semibold mt-0.5">Cardiac / Pulmonary</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">EHR Latency</p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">&lt; 50ms Real-time</p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">HL7 / FHIR Compliant</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Stats grid */}
                <div className="p-5 grid grid-cols-2 gap-3">
                  <DashboardCard
                    label="Total Doctors"
                    value={doctors.toLocaleString()}
                    sub="All specializations"
                    accent="border-hospital-200 dark:border-hospital-800"
                  />
                  <DashboardCard
                    label="Registered Patients"
                    value={patients.toLocaleString()}
                    sub="Active records"
                    accent="border-muted-teal/30 dark:border-muted-teal/40"
                  />
                  <DashboardCard
                    label="Appointments"
                    value={appointments.toLocaleString()}
                    sub={`${stats?.todayAppointments ?? 18} today`}
                    accent="border-soft-sage dark:border-soft-sage/30"
                  />
                  <DashboardCard
                    label="Pharmacy Items"
                    value={(stats?.totalMedicines ?? 214).toLocaleString()}
                    sub={`${stats?.lowStockMedicines ?? 3} low stock`}
                    accent="border-hospital-300 dark:border-hospital-700"
                  />
                </div>

                {/* Activity bar */}
                <div className="mx-5 mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Weekly Appointment Trend</p>
                  <div className="flex items-end gap-2 h-16">
                    {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-hospital-600 to-hospital-400 opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* Quick role pills */}
            <div className="px-5 pb-5 flex flex-wrap gap-2">
              {[
                { label: 'Patient', color: 'bg-muted-teal/15 text-muted-teal dark:bg-muted-teal/25 dark:text-soft-sage' },
                { label: 'Doctor', color: 'bg-hospital-100 text-hospital-700 dark:bg-hospital-950/60 dark:text-hospital-400' },
                { label: 'Nurse', color: 'bg-soft-sage/40 text-deep-forest dark:bg-soft-sage/20 dark:text-soft-sage' },
                { label: 'Receptionist', color: 'bg-hospital-200/50 text-hospital-800 dark:bg-hospital-800/40 dark:text-hospital-300' },
                { label: 'Pharmacist', color: 'bg-muted-teal/20 text-muted-teal-700 dark:bg-muted-teal/30 dark:text-soft-sage' },
                { label: 'Admin', color: 'bg-deep-forest/15 text-deep-forest dark:bg-deep-forest/40 dark:text-light-gray' },
              ].map(({ label, color }) => (
                <span key={label} className={`px-3 py-1 text-[11px] font-bold rounded-full ${color}`}>{label}</span>
              ))}
            </div>
          </div>

          {/* Floating stat pills */}
          <div className="absolute -right-6 top-24 hidden xl:block">
            <StatPill icon={Clock} label="Avg. Wait Time" value="< 12 min" color="border-muted-teal/30 text-muted-teal" />
          </div>
          <div className="absolute -left-6 bottom-20 hidden xl:block">
            <StatPill icon={Users} label="Staff Online" value="24 Active" color="border-hospital-300 text-hospital-700" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
