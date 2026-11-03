import React from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical, Activity, Users, FileText, ClipboardList, Clock,
  Microscope, TestTube, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';

const LabTechDashboard = () => {
  const { currentUser } = useAuth();
  const { patients, medicalRecords } = useData();

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  const recentRecords = [...medicalRecords]
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    .slice(0, 5);

  const labDepartments = ['Hematology', 'Biochemistry', 'Microbiology', 'Pathology', 'Radiology/Imaging'];
  const userDept = currentUser?.department || 'Laboratory';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-cyan-600 to-teal-700 text-white p-6 md:p-8 rounded-3xl shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
            Lab Technician Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
            {greeting}, {currentUser?.name}
          </h2>
          <p className="text-xs md:text-sm text-cyan-100 mt-1">
            Department: <strong>{userDept}</strong>
            &bull; Date: <strong>{now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl">
          <div className="p-2 bg-white/20 rounded-xl">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Lab Status</p>
            <p className="text-xs text-cyan-200">Operational &bull; On Duty</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          color="blue"
          subtext="Registered in system"
        />
        <StatCard
          title="Clinical Records"
          value={medicalRecords.length}
          icon={FileText}
          color="teal"
          subtext="Available for review"
        />
        <StatCard
          title="Lab Department"
          value={labDepartments.length}
          icon={TestTube}
          color="cyan"
          subtext="Active lab units"
        />
        <StatCard
          title="Shift Status"
          value="Active"
          icon={Clock}
          color="emerald"
          subtext="Currently on duty"
        />
      </div>

      {/* Lab Units Quick Overview */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <Microscope className="w-5 h-5 text-cyan-600" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Laboratory Units</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {labDepartments.map((dept) => {
            const isUserDept = dept === userDept;
            return (
              <div
                key={dept}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  isUserDept
                    ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${isUserDept ? 'bg-cyan-100 dark:bg-cyan-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <FlaskConical className={`w-4 h-4 ${isUserDept ? 'text-cyan-600' : 'text-slate-500'}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isUserDept ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dept}
                  </p>
                  {isUserDept && (
                    <p className="text-[10px] text-cyan-500 font-medium">Your Department</p>
                  )}
                </div>
                {isUserDept && (
                  <div className="ml-auto">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Medical Records */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Recent Clinical Records</h3>
          </div>
          <Link
            to="/lab-tech/test-records"
            className="text-xs font-bold text-hospital-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No clinical records available.</p>
            <p className="text-xs text-slate-400">Records created by doctors will appear here for lab reference.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {rec.recordNumber || rec.record_number || `REC-${rec.id}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Diagnosis: {rec.diagnosis || 'N/A'} &bull; {rec.visitDate || rec.visit_date || 'Unknown date'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/30 text-teal-600 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-800">
                  Lab Ref
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/lab-tech/test-records"
            className="flex items-center gap-3 p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-2xl hover:bg-cyan-100 dark:hover:bg-cyan-950/40 transition-colors"
          >
            <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl">
              <FlaskConical className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">View Test Records</p>
              <p className="text-[11px] text-slate-400">Browse patient clinical records</p>
            </div>
          </Link>

          <Link
            to="/lab-tech/patient-samples"
            className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-2xl hover:bg-teal-100 dark:hover:bg-teal-950/40 transition-colors"
          >
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/40 rounded-xl">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">Patient Samples</p>
              <p className="text-[11px] text-slate-400">View registered patients list</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LabTechDashboard;
