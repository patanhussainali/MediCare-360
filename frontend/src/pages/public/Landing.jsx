import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, PhoneCall, Sun, Moon, CheckCircle2,
  ArrowRight, Menu, X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import HeroSection from '../../components/landing/HeroSection';

const Landing = () => {
  const { departments } = useData();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100svh] min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-x-hidden">

      {/* ── Emergency Alert Banner ── */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 animate-bounce flex-shrink-0" />
            <span>24/7 Emergency &amp; Ambulance Helpline: <strong>9182281940</strong></span>
          </div>
          <span className="hidden sm:inline bg-rose-800/60 px-3 py-1 rounded-full border border-rose-400/30 whitespace-nowrap">
            Immediate Care Available
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="p-2 bg-gradient-to-tr from-hospital-600 to-hospital-400 rounded-xl text-white shadow-card">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                MediCare<span className="text-hospital-600 font-extrabold">360</span>
              </h1>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hospital Management</p>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center gap-6 font-medium text-sm text-slate-600 dark:text-slate-300">
            <Link to="/" className="text-hospital-600 font-bold">Home</Link>
            <Link to="/about" className="hover:text-hospital-600 transition-colors">About Hospital</Link>
            <Link to="/services" className="hover:text-hospital-600 transition-colors">Services</Link>
            <Link to="/departments" className="hover:text-hospital-600 transition-colors">Departments</Link>
            <Link to="/contact" className="hover:text-hospital-600 transition-colors">Contact</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex-shrink-0"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-hospital-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex px-4 py-1.5 text-sm font-semibold text-white bg-hospital-600 hover:bg-deep-forest rounded-xl shadow-soft transition-all hover:-translate-y-0.5"
            >
              Patient Portal
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            >
              {mobileMenuOpen
                ? <X className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                : <Menu className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-1">
            {[
              { to: '/', label: 'Home', active: true },
              { to: '/about', label: 'About Hospital' },
              { to: '/services', label: 'Services' },
              { to: '/departments', label: 'Departments' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label, active }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'text-hospital-600 bg-hospital-50 dark:bg-hospital-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-3 py-2 text-sm font-semibold text-white bg-hospital-600 rounded-xl hover:bg-deep-forest transition-all"
              >
                Patient Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <HeroSection />

      {/* ── Connected Digital Health Showcase Banner ── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Content Column */}
            <div className="p-6 sm:p-8 lg:p-12 lg:col-span-5 flex flex-col justify-between space-y-6">
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
                  {[
                    { title: 'Real-Time Vitals', sub: 'Bedside sensor telemetry' },
                    { title: 'Instant Rx Sync', sub: 'Direct dispensary dispatch' },
                    { title: 'Encrypted EHR', sub: 'HIPAA & HL7 certified' },
                    { title: 'Multi-Device Ready', sub: 'Laptops, tablets, wards' },
                  ].map(({ title, sub }) => (
                    <div key={title} className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</p>
                      </div>
                    </div>
                  ))}
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
            <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[440px] overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src="/images/landing-hero-stethoscope.png"
                alt="Digital Clinical Workstation with Stethoscope and Laptop"
                className="w-full h-full object-cover object-right hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/95 via-transparent to-transparent dark:from-slate-800/95 dark:via-transparent dark:to-transparent pointer-events-none" />

              {/* Floating chip */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                  Stethoscope Workstation: Online
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Telemetry: 20Hz – 2000Hz (Diagnostic)
                </div>
              </div>

              {/* Floating status badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-3 border border-white/20 shadow-xl max-w-[200px] sm:max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-extrabold text-xs flex-shrink-0">
                    360°
                  </div>
                  <div>
                    <div className="text-xs font-bold">Connected Clinical Hub</div>
                    <div className="text-[11px] text-slate-300">6 Hospital Roles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clinical Departments Section ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clinical Departments</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Specialized healthcare units staffed by certified medical specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {departments.map((dep) => (
            <div key={dep.id} className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-hospital-600 bg-hospital-50 dark:bg-hospital-950/60 dark:text-hospital-400 px-3 py-1 rounded-lg border border-hospital-200">{dep.code}</span>
                <span className="text-xs text-hospital-600 font-semibold">{dep.status}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">{dep.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{dep.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-deep-forest dark:bg-slate-950 text-slate-300 py-10 sm:py-12 px-4 sm:px-6 border-t border-deep-forest-700 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-extrabold text-base mb-3">MediCare360</h4>
            <p className="text-xs leading-relaxed text-slate-300">Full-stack multi-role hospital management solution built for reliability, efficiency, and clinical accuracy.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Clinical Services</Link></li>
              <li><Link to="/departments" className="hover:text-white transition-colors">Departments</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact & Support</Link></li>
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
