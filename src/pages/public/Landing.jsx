import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, PhoneCall, Sun, Moon } from 'lucide-react';
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
            <span>24/7 Emergency Trauma &amp; Ambulance Helpline: <strong>+1 (800) 911-3600</strong></span>
          </div>
          <span className="hidden sm:inline bg-rose-800/60 px-3 py-1 rounded-full border border-rose-400/30">Immediate Care Available</span>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <HeroSection />

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
            <p className="text-xs text-white font-semibold mb-1">+1 (800) 911-3600</p>
            <p className="text-xs text-slate-300">742 Evergreen Health Boulevard, Medical District</p>
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
