'use client';

import { useCart } from '@/app/store/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useCart();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Determine styles based on toast type
          let bgColor = 'bg-primary-deep text-cream';
          let borderColor = 'border-accent';
          let Icon = Info;
          let iconColor = 'text-accent';

          if (toast.type === 'success') {
            bgColor = 'bg-white text-primary-deep';
            borderColor = 'border-accent';
            Icon = CheckCircle2;
            iconColor = 'text-primary';
          } else if (toast.type === 'error') {
            bgColor = 'bg-[#ffebee] text-primary-deep';
            borderColor = 'border-red-400';
            Icon = AlertCircle;
            iconColor = 'text-red-600';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto border rounded-lg shadow-elevated p-3.5 flex items-center justify-between space-x-3 ${bgColor} ${borderColor}`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
                <p className="text-xs font-body font-semibold truncate leading-tight">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-brown hover:text-primary-deep p-0.5 rounded transition-colors duration-150"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
