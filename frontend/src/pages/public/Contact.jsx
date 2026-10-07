import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import PublicPageHeader from '../../components/common/PublicPageHeader';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col">
      <PublicPageHeader />

      <main className="max-w-5xl mx-auto px-6 py-16 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-hospital-600 bg-hospital-50 dark:bg-hospital-950/60 dark:text-hospital-400 px-3 py-1 rounded-full uppercase">Contact Us</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">Get in Touch with MediCare360</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Hospital Location &amp; Help Desk</h2>
            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-hospital-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Main Hospital Address</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">742 Evergreen Health Boulevard, Medical District, Suite 300</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-hospital-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Phone &amp; Emergency Triage</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">General Inquiries: +1 (800) 555-3600</p>
                  <p className="text-rose-600 text-xs font-bold mt-0.5">Emergency Helpline: +1 (800) 911-3600</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-hospital-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Email Communications</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">contact@medicare360.org</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-hospital-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Operating Hours</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">24/7 Emergency &amp; Inpatient Care | Outpatient: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-hospital-600 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Thank you for reaching out to MediCare360. Our hospital desk will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Send a Direct Message</h2>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Your Full Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="John Doe" className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="john@example.com" className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Subject</label>
                  <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                    placeholder="Inquiry subject" className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Message</label>
                  <textarea rows="4" required value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="How can we assist you?" className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 dark:text-white" />
                </div>
                <button type="submit"
                  className="w-full py-3 bg-hospital-600 hover:bg-deep-forest text-white font-bold text-sm rounded-xl shadow-soft transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
