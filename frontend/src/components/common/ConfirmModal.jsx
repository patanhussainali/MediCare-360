import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className={`p-4 rounded-full mb-4 ${type === 'danger' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 ring-8 ring-rose-50/50' : 'bg-amber-50 text-amber-600 ring-8 ring-amber-50/50'}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl shadow-soft transition-all ${type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-hospital-600 hover:bg-hospital-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
