import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const MAX_WIDTHS = {
  'max-w-sm': 'max-w-sm',
  'max-w-md': 'max-w-md',
  'max-w-lg': 'max-w-lg',
  'max-w-xl': 'max-w-xl',
  'max-w-2xl': 'max-w-2xl',
  'max-w-3xl': 'max-w-3xl',
  'max-w-4xl': 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, description, children, footer, formLayout = false, onSubmit, maxWidth = 'max-w-xl' }) => {
  const modalRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      (firstFocusable || modalRef.current)?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
        .filter(element => element.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActive?.isConnected) previousActive.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass = MAX_WIDTHS[maxWidth] || maxWidth || 'max-w-xl';
  const layoutClass = formLayout
    ? 'flex h-[min(800px,calc(100dvh-2rem))] flex-col'
    : `grid grid-rows-[auto_minmax(0,1fr)_auto] ${footer ? 'h-[95dvh] sm:h-[90vh]' : 'h-fit'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overscroll-contain animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`bg-white dark:bg-slate-800 shadow-2xl border border-slate-200/90 dark:border-slate-700 w-full ${widthClass} rounded-2xl sm:rounded-3xl ${layoutClass} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/80 shrink-0">
          <div className="min-w-0 pr-3">
            <h3 id={titleId} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
            {description && <p id={descriptionId} className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formLayout ? (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
              {children}
            </main>
            <footer className="relative z-10 flex min-h-[76px] shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800 sm:px-6">
              {footer}
            </footer>
          </form>
        ) : (
          <>
            <main className="min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
              {children}
            </main>
            {footer && (
              <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-700/80 dark:bg-slate-800/95 sm:px-6">
                {footer}
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
