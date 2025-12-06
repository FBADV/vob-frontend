import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, X, User } from 'lucide-react';
import { useGlobalData } from '../context/GlobalDataContext';
import type { Client } from '../types';
import { findMatchingClients } from '../utils/fuzzyMatch';

interface ClientAutocompleteProps {
    value: string | null;
    onChange: (clientId: string | null) => void;
    onNewClient?: () => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
    value,
    onChange,
    onNewClient,
    placeholder = "Buscar cliente...",
    required = false,
    className = ""
}) => {
    const { clients } = useGlobalData();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Client[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize search term when value changes externally
    useEffect(() => {
        if (value) {
            const selectedClient = clients.find(c => c.id === value);
            if (selectedClient) {
                setSearchTerm(selectedClient.name);
            }
        } else {
            setSearchTerm('');
        }
    }, [value, clients]);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search term if no valid selection was made and we have a value
                if (value) {
                    const selectedClient = clients.find(c => c.id === value);
                    if (selectedClient && searchTerm !== selectedClient.name) {
                        setSearchTerm(selectedClient.name);
                    }
                } else if (!value && searchTerm) {
                    // Clear search term if no value selected
                    setSearchTerm('');
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [value, clients, searchTerm]);

    // Filter suggestions based on search term
    useEffect(() => {
        if (!searchTerm) {
            setSuggestions([]);
            return;
        }

        // Don't filter if the search term matches the selected client exactly (avoid reopening on selection)
        if (value) {
            const selectedClient = clients.find(c => c.id === value);
            if (selectedClient && searchTerm === selectedClient.name) {
                return;
            }
        }

        const matches = findMatchingClients(searchTerm, clients);
        // Map matches back to client objects
        setSuggestions(matches.map(m => m.client).slice(0, 5)); // Limit to 5 suggestions
        setIsOpen(true);
    }, [searchTerm, clients, value]);

    const handleSelect = (client: Client) => {
        onChange(client.id);
        setSearchTerm(client.name);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearchTerm('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-[rgb(var(--text-tertiary))]" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className={`input-premium w-full pl-10 pr-10 ${!value && required ? 'border-amber-300 dark:border-amber-600' : ''}`}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (value) onChange(null); // Clear selection on edit
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (searchTerm && !value) setIsOpen(true);
                    }}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && searchTerm && !value && (
                <div className="absolute z-50 w-full mt-1 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-lg max-h-60 overflow-auto animate-fade-in">
                    {suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((client) => (
                                <li
                                    key={client.id}
                                    onClick={() => handleSelect(client)}
                                    className="px-4 py-3 hover:bg-[rgb(var(--bg-tertiary))] cursor-pointer flex items-center gap-3 transition-colors border-b border-[rgb(var(--border-subtle))] last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent-primary))]/10 flex items-center justify-center text-[rgb(var(--accent-primary))] shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-[rgb(var(--text-primary))]">{client.name}</div>
                                        <div className="text-xs text-[rgb(var(--text-tertiary))]">
                                            {client.document || 'Sem documento'} • {client.email || 'Sem email'}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-[rgb(var(--text-tertiary))] text-center">
                            Nenhum cliente encontrado.
                        </div>
                    )}

                    {onNewClient && (
                        <div className="p-2 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onNewClient();
                                }}
                                className="w-full py-2 px-3 bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] rounded-lg hover:bg-[rgb(var(--accent-primary))]/20 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                            >
                                <UserPlus size={16} />
                                Cadastrar "{searchTerm}" como novo cliente
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
