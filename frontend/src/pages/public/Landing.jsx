import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, PhoneCall, Sun, Moon, CheckCircle2, Laptop, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import HeroSection from '../../components/landing/HeroSection';

const Landing = () => {
  const { departments } = useData();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-2xl text-white shadow-card">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              MediCare<span className="text-hospital-600 font-extrabold">360</span>
            </h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital Management Platform</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
          <Link to="/" className="text-hospital-600 font-bold">Home</Link>
          <Link to="/about" className="hover:text-hospital-600 transition-colors">About Hospital</Link>
          <Link to="/services" className="hover:text-hospital-600 transition-colors">Services</Link>
          <Link to="/departments" className="hover:text-hospital-600 transition-colors">Departments</Link>
          <Link to="/contact" className="hover:text-hospital-600 transition-colors">Contact</Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* 🌗 Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
          >
            {theme === 'dark'
              ? <Sun className="w-5 h-5 text-yellow-400" />
              : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-hospital-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-hospital-600 hover:bg-deep-forest rounded-xl shadow-soft transition-all transform hover:-translate-y-0.5"
          >
            Patient Portal
          </Link>
        </div>
      </header>

      {/* ── Emergency Alert Banner ── */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-6 py-2.5 text-xs font-semibold shadow-inner">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>24/7 Emergency Trauma &amp; Ambulance Helpline: <strong>9182281940</strong></span>
          </div>
          <span className="hidden sm:inline bg-rose-800/60 px-3 py-1 rounded-full border border-rose-400/30">Immediate Care Available</span>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <HeroSection />

      {/* ── Connected Digital Health Showcase Banner ── */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Content Column */}
            <div className="p-8 sm:p-10 lg:p-12 lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Smart Clinical Workstation
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  Precision Medicine Meets Digital Diagnostics
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bridge physical examination and electronic health records seamlessly. Clinicians can capture real-time vitals, audio auscultation records, and diagnostics directly synchronized with hospital departments.
                </p>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Real-Time Vitals</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Bedside sensor telemetry</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant Rx Sync</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct dispensary dispatch</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Encrypted EHR</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">HIPAA &amp; HL7 certified</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Multi-Device Ready</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Laptops, tablets, wards</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#087f8c] hover:bg-[#066a75] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Access Workstation Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/services"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Explore Clinical Services &rarr;
                </Link>
              </div>
            </div>

            {/* Right Image Banner Column */}
            <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src="/images/landing-hero-stethoscope.png"
                alt="Digital Clinical Workstation with Stethoscope and Laptop"
                className="w-full h-full object-cover object-right hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/95 via-transparent to-transparent dark:from-slate-800/95 dark:via-transparent dark:to-transparent pointer-events-none" />

              {/* Floating diagnostic telemetry chip */}
              <div className="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                  Stethoscope Workstation: Online
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Telemetry Frequency: 20Hz – 2000Hz (Diagnostic)
                </div>
              </div>

              {/* Floating status badge at bottom right */}
              <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-3.5 border border-white/20 shadow-xl max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-extrabold text-sm">
                    360°
                  </div>
                  <div>
                    <div className="text-xs font-bold">Connected Clinical Hub</div>
                    <div className="text-[11px] text-slate-300">Synchronized for All 6 Hospital Roles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clinical Departments Section ── */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clinical Departments</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Specialized healthcare units staffed by certified medical specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dep) => (
            <div key={dep.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-hospital-600 bg-hospital-50 dark:bg-hospital-950/60 dark:text-hospital-400 px-3 py-1 rounded-lg border border-hospital-200">{dep.code}</span>
                <span className="text-xs text-hospital-600 font-semibold">{dep.status}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{dep.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dep.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-deep-forest dark:bg-slate-950 text-slate-300 py-12 px-6 border-t border-deep-forest-700 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <h4 className="text-white font-extrabold text-base mb-3">MediCare360</h4>
            <p className="text-xs leading-relaxed text-slate-300">Full-stack multi-role hospital management solution built for reliability, efficiency, and clinical accuracy.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Clinical Services</Link></li>
              <li><Link to="/departments" className="hover:text-white transition-colors">Departments</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact &amp; Support</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase">Portals</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Patient Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Doctor Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Staff Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase">Emergency Contact</h5>
            <p className="text-xs text-white font-semibold mb-1">9182281940</p>
            <p className="text-xs text-slate-300 mb-1">Kalasalingam Hospital</p>
            <p className="text-xs text-slate-400">hussainalipatan@gmail.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-deep-forest-700 dark:border-slate-800 text-center text-xs text-slate-400">
          &copy; 2026 MediCare360 Hospital Management Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
