import React, { useState } from 'react';
import { ClipboardList, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const NursingTasks = () => {
  const { patients } = useData();
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [patientName, setPatientName] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskName) return;
    const newTask = {
      id: `task-${Date.now()}`,
      taskName,
      patientName: patientName || 'General Ward Task',
      completed: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTasks([newTask, ...tasks]);
    setTaskName('');
    setPatientName('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Nursing Task Checklist</h2>
        <p className="text-xs text-slate-400">Shift task checklist, medication administration, and bed rounds</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <form onSubmit={handleAddTask} className="flex gap-3 mb-6">
          <input
            type="text"
            required
            placeholder="Task description (e.g., Administer IV antibiotic, Check BP)"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
          <input
            type="text"
            placeholder="Patient Name (Optional)"
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            className="w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
          <button type="submit" className="px-5 py-2.5 bg-hospital-600 text-white font-bold text-xs rounded-xl flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </form>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            No tasks in shift checklist. Add a task above to begin tracking.
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {tasks.map(t => (
              <div key={t.id} className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${t.completed ? 'bg-emerald-50/40 border-emerald-200 line-through text-slate-400' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    className="w-4 h-4 text-hospital-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{t.taskName}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({t.patientName} &bull; {t.time})</span>
                  </div>
                </div>
                <button onClick={() => deleteTask(t.id)} className="text-rose-500 hover:text-rose-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NursingTasks;
