import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface GlobalError {
    title: string;
    message: string;
    stack?: string;
}

interface GlobalErrorContextType {
    error: GlobalError | null;
    showError: (title: string, message: string, stack?: string) => void;
    clearError: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

export const GlobalErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [error, setError] = useState<GlobalError | null>(null);

    const showError = useCallback((title: string, message: string, stack?: string) => {
        setError({ title, message, stack });
        // Log to console as well
        console.error(`[Global Error] ${title}: ${message}`, stack);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Global Error Listeners
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            showError('Erro de Execução', event.message, event.error?.stack);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            showError('Erro de Promessa', event.reason?.message || 'Rejeição de promessa não tratada', event.reason?.stack);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [showError]);

    return (
        <GlobalErrorContext.Provider value={{ error, showError, clearError }}>
            {children}
        </GlobalErrorContext.Provider>
    );
};

export const useGlobalError = () => {
    const context = useContext(GlobalErrorContext);
    if (context === undefined) {
        throw new Error('useGlobalError must be used within a GlobalErrorProvider');
    }
    return context;
};
