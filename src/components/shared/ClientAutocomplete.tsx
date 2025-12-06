import React, { useState, useRef, useEffect } from 'react';
import type { Client } from '../../types';
import { useClientAutocomplete } from '../../hooks/useClientAutocomplete';
import { Search, Plus, X, Loader2, User } from 'lucide-react';

interface ClientAutocompleteProps {
    value?: Client | null;
    onChange: (client: Client | null) => void;
    onCreateNew?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Componente de autocompletar clientes com busca fuzzy
 * 
 * Features:
 * - Busca incremental com fuzzy match
 * - Opção "Novo Cliente"
 * - Teclado navegável (↑↓ Enter Esc)
 * - Loading e estados de erro
 * - Responsivo
 * 
 * @example
 * <ClientAutocomplete
 *   value={selectedClient}
 *   onChange={setSelectedClient}
 *   onCreateNew={() => setShowModal(true)}
 *   placeholder="Buscar cliente..."
 * />
 */
export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
    value,
    onChange,
    onCreateNew,
    placeholder = 'Buscar cliente por nome, CPF ou e-mail',
    disabled = false,
    className = ''
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { suggestions, loading, error, search, clear } = useClientAutocomplete({
        minChars: 2,
        debounceMs: 300,
        limit: 8,
        threshold: 0.3
    });

    // Atualizar input quando value muda externamente
    useEffect(() => {
        if (value) {
            setInputValue(value.name);
            setIsOpen(false);
        }
    }, [value]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        search(newValue);
        setIsOpen(true);
        setSelectedIndex(-1);

        // Limpar seleção se input estiver vazio
        if (!newValue && value) {
            onChange(null);
            clear();
        }
    };

    const handleSelectClient = (client: Client) => {
        setInputValue(client.name);
        onChange(client);
        setIsOpen(false);
        clear();
    };

    const handleCreateNew = () => {
        setIsOpen(false);
        onCreateNew?.();
    };

    const handleClear = () => {
        setInputValue('');
        onChange(null);
        clear();
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
            }
            return;
        }

        const totalItems = suggestions.length + (onCreateNew ? 1 : 0);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectClient(suggestions[selectedIndex]);
                } else if (selectedIndex === suggestions.length && onCreateNew) {
                    handleCreateNew();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const showDropdown = isOpen && (suggestions.length > 0 || loading || error || onCreateNew);

    return (
        <div className={`relative ${className}`}>
            {/* Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => inputValue && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full pl-10 pr-10 py-2 
                        border border-gray-300 dark:border-gray-600 
                        rounded-lg
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors
                    `}
                />
                {inputValue && !disabled && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                >
                    {/* Loading */}
                    {loading && (
                        <div className="p-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Buscando...
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="p-4 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Sugestões */}
                    {!loading && !error && suggestions.length > 0 && (
                        <ul className="py-1">
                            {suggestions.map((client, index) => (
                                <li key={client.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectClient(client)}
                                        className={`
                                            w-full px-4 py-2 text-left flex items-center gap-3
                                            hover:bg-gray-100 dark:hover:bg-gray-700
                                            ${selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}
                                            transition-colors
                                        `}
                                    >
                                        <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                {client.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {client.cpfCnpj} • {client.email}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Opção Novo Cliente */}
                    {onCreateNew && !loading && (
                        <>
                            {suggestions.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700" />}
                            <button
                                type="button"
                                onClick={handleCreateNew}
                                className={`
                                    w-full px-4 py-2 text-left flex items-center gap-3
                                    hover:bg-blue-50 dark:hover:bg-blue-900/20
                                    ${selectedIndex === suggestions.length ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                    text-blue-600 dark:text-blue-400 font-medium
                                    transition-colors
                                `}
                            >
                                <Plus className="w-5 h-5 flex-shrink-0" />
                                <span>Criar novo cliente</span>
                            </button>
                        </>
                    )}

                    {/* Empty State */}
                    {!loading && !error && suggestions.length === 0 && !onCreateNew && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Nenhum cliente encontrado
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
