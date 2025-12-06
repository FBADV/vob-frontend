import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, HelpCircle, Trash2, X } from 'lucide-react';

export type ConfirmationType = 'danger' | 'warning' | 'info';

export interface ConfirmationOptions {
    title: string;
    message: string;
    type?: ConfirmationType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

interface ConfirmationContextType {
    confirm: (options: ConfirmationOptions) => void;
    confirmDelete: (itemName: string, onConfirm: () => void | Promise<void>) => void;
    confirmArchive: (itemName: string, onConfirm: () => void | Promise<void>) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within ConfirmationProvider');
    }
    return context;
};

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmationOptions | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const confirm = useCallback((opts: ConfirmationOptions) => {
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const confirmDelete = useCallback((itemName: string, onConfirm: () => void | Promise<void>) => {
        confirm({
            title: 'Confirmar Exclusão',
            message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
            type: 'danger',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm
        });
    }, [confirm]);

    const confirmArchive = useCallback((itemName: string, onConfirm: () => void | Promise<void>) => {
        confirm({
            title: 'Confirmar Arquivamento',
            message: `Deseja arquivar "${itemName}"? Você poderá restaurá-lo posteriormente.`,
            type: 'warning',
            confirmText: 'Arquivar',
            cancelText: 'Cancelar',
            onConfirm
        });
    }, [confirm]);

    const handleConfirm = async () => {
        if (!options) return;

        setIsLoading(true);
        try {
            await options.onConfirm();
            setIsOpen(false);
            setOptions(null);
        } catch (error) {
            console.error('Error in confirmation action:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (options?.onCancel) {
            options.onCancel();
        }
        setIsOpen(false);
        setOptions(null);
    };

    return (
        <ConfirmationContext.Provider value={{ confirm, confirmDelete, confirmArchive }}>
            {children}
            {isOpen && options && (
                <ConfirmationDialog
                    {...options}
                    isLoading={isLoading}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmationContext.Provider>
    );
};

interface ConfirmationDialogProps extends ConfirmationOptions {
    isLoading: boolean;
    onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading,
    onConfirm,
    onCancel
}) => {
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 className="w-12 h-12 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-12 h-12 text-amber-500" />;
            case 'info':
                return <HelpCircle className="w-12 h-12 text-blue-500" />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger':
                return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white';
            case 'warning':
                return 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white';
            case 'info':
                return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white';
        }
    };

    const getBackgroundClass = () => {
        switch (type) {
            case 'danger':
                return 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/10 dark:via-rose-900/10 dark:to-pink-900/10';
            case 'warning':
                return 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10';
            case 'info':
                return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-violet-900/10';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fade-in"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    className={`
                        ${getBackgroundClass()}
                        max-w-md w-full rounded-2xl shadow-2xl
                        border border-[rgb(var(--border-subtle))]
                        animate-scale-in
                        relative overflow-hidden
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                    </button>

                    <div className="p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-white/50 dark:bg-black/20">
                                {getIcon()}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-3">
                                {title}
                            </h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="
                                    flex-1 px-4 py-3 rounded-xl font-semibold
                                    bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))]
                                    hover:bg-[rgb(var(--bg-tertiary))]/80
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    border border-[rgb(var(--border-default))]
                                "
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`
                                    flex-1 px-4 py-3 rounded-xl font-semibold
                                    ${getConfirmButtonClass()}
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    shadow-lg hover:shadow-xl
                                    flex items-center justify-center gap-2
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
