import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/*
        Mobile:  bottom-sheet (slides up, full width, rounded top corners)
        Tablet+: centred card with maxWidth cap
      */}
      <div
        className={`
          bg-white dark:bg-slate-800
          shadow-2xl border border-slate-100 dark:border-slate-700
          w-full flex flex-col overflow-hidden
          transform transition-all duration-300
          /* Mobile bottom-sheet */
          rounded-t-2xl max-h-[92vh]
          /* Tablet/desktop centred card */
          sm:rounded-2xl sm:mx-4 sm:max-h-[90vh] sm:${maxWidth}
          pb-safe
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          {/* Drag handle (mobile hint) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 sm:hidden" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 -webkit-overflow-scrolling-touch">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
