import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = crypto.randomUUID();
        const duration = toast.duration ?? 5000;

        setToasts(prev => [...prev, { ...toast, id }]);

        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
    }, [hideToast]);

    const success = useCallback((title: string, message?: string) => {
        showToast({ type: 'success', title, message });
    }, [showToast]);

    const error = useCallback((title: string, message?: string) => {
        showToast({ type: 'error', title, message });
    }, [showToast]);

    const warning = useCallback((title: string, message?: string) => {
        showToast({ type: 'warning', title, message });
    }, [showToast]);

    const info = useCallback((title: string, message?: string) => {
        showToast({ type: 'info', title, message });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, hideToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onClose={hideToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none items-center">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800';
            case 'info':
                return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div
            className={`
                ${getStyles()}
                border rounded-xl shadow-lg p-4 pr-12 
                pointer-events-auto
                animate-scale-in
                backdrop-blur-sm
                hover:shadow-xl transition-all duration-300
                relative overflow-hidden
            `}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

            <div className="flex items-start gap-3 relative z-10">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1">
                        {toast.title}
                    </h4>
                    {toast.message && (
                        <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">
                            {toast.message}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={() => onClose(toast.id)}
                className="absolute top-3 right-3 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Fechar notificação"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
