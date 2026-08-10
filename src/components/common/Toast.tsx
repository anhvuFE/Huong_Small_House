/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';
import { cn } from '../../utils/cn';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  title: string;
  message?: string;
  variant: ToastVariant;
}

export interface ToastContextValue {
  showToast: (payload: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((payload: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...payload, id: Date.now() }]);
  }, []);

  // Schedule an auto-dismiss timer exactly once per toast. Re-running this
  // effect must not reset timers of toasts that are already counting down.
  useEffect(() => {
    const timers = timersRef.current;
    toasts.forEach((toast) => {
      if (timers.has(toast.id)) return;
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        timers.delete(toast.id);
      }, 2500);
      timers.set(toast.id, timer);
    });
  }, [toasts]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 space-y-3 w-80 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                'rounded-xl shadow-2xl px-4 py-3 text-sm text-white',
                'flex items-start gap-3 pointer-events-auto animate-in fade-in-0 slide-in-from-bottom-2',
                toast.variant === 'success' && 'bg-primary',
                toast.variant === 'error' && 'bg-red-600',
                toast.variant === 'info' && 'bg-blue-600',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 rounded-full p-2 bg-white/15 text-white',
                )}
              >
                {toast.variant === 'success' && <FiCheckCircle className="w-4 h-4" />}
                {toast.variant === 'error' && <FiXCircle className="w-4 h-4" />}
                {toast.variant === 'info' && <FiInfo className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-semibold leading-tight">{toast.title}</p>
                {toast.message && <p className="text-xs mt-1 text-white/90">{toast.message}</p>}
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};
