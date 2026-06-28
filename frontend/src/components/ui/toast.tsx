import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ type, title, description, duration = 3000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const success = React.useCallback((title: string, description?: string) => toast({ type: "success", title, description }), [toast]);
  const error = React.useCallback((title: string, description?: string) => toast({ type: "error", title, description }), [toast]);
  const info = React.useCallback((title: string, description?: string) => toast({ type: "info", title, description }), [toast]);
  const warning = React.useCallback((title: string, description?: string) => toast({ type: "warning", title, description }), [toast]);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              layout
              className="bg-white rounded-xl border border-border shadow-elevation p-4 flex gap-3 pointer-events-auto items-start overflow-hidden"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {t.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
                {t.type === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#0f172a]">{t.title}</h4>
                {t.description && (
                  <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{t.description}</p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => remove(t.id)}
                className="text-[#cbd5e1] hover:text-[#64748b] transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
