import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, Search, Clock, User, LogOut, Settings, ChevronDown, Scale, X, CheckCircle, AlertTriangle, Info, Palette, Sparkles, Zap } from 'lucide-react';
import { useGlobalData } from '../context/GlobalDataContext';
import { useModal } from '../context/ModalContext';
import { Link, useNavigate } from 'react-router-dom';
import { VoiceButton } from './VoiceButton';
import clsx from 'clsx';
import { GamificationHUD } from './gamification/GamificationHUD';
import { VOBLogoCompact } from './Logo';





export const Header: React.FC = () => {
    const {
        theme,
        setTheme,
        user,
        logout,
        isSidebarCollapsed,
        layoutMode,
        clients,
        processes,
        services,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead
    } = useGlobalData();
    const { openModal } = useModal();
    const [time, setTime] = useState(new Date());
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ type: 'client' | 'process' | 'service', id: string, title: string, subtitle: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const themeMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
                setIsThemeMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const foundSuggestions: { type: 'client' | 'process' | 'service', id: string, title: string, subtitle: string }[] = [];

        // Search Clients
        clients.forEach(client => {
            if (
                client.name.toLowerCase().includes(lowerQuery) ||
                client.email.toLowerCase().includes(lowerQuery) ||
                client.document.includes(lowerQuery)
            ) {
                foundSuggestions.push({
                    type: 'client',
                    id: client.id,
                    title: client.name,
                    subtitle: client.document
                });
            }
        });

        // Search Processes
        processes.forEach(process => {
            if (
                process.number.includes(lowerQuery) ||
                process.title.toLowerCase().includes(lowerQuery) ||
                (process.clientName && process.clientName.toLowerCase().includes(lowerQuery))
            ) {
                foundSuggestions.push({
                    type: 'process',
                    id: process.id,
                    title: `Processo ${process.number}`,
                    subtitle: process.title
                });
            }
        });

        // Search Services
        services.forEach(service => {
            if (
                service.title.toLowerCase().includes(lowerQuery) ||
                service.description.toLowerCase().includes(lowerQuery) ||
                (service.clientName && service.clientName.toLowerCase().includes(lowerQuery))
            ) {
                foundSuggestions.push({
                    type: 'service',
                    id: service.id,
                    title: service.title,
                    subtitle: service.clientName || 'Sem cliente'
                });
            }
        });

        setSuggestions(foundSuggestions.slice(0, 8)); // Limit to 8 results
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion: { type: 'client' | 'process' | 'service', id: string }) => {
        if (suggestion.type === 'client') {
            navigate('/clients');
            // In a real app, we might want to open the client profile modal or filter the list
        } else if (suggestion.type === 'process') {
            navigate('/processes');
            // Similarly for processes
        } else if (suggestion.type === 'service') {
            navigate('/services');
        }
        setShowSuggestions(false);
        setSearchQuery('');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };



    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error': return <X size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <header
            className={clsx(
                "fixed top-0 right-0 h-20 bg-[rgb(var(--bg-secondary))]/90 z-10 flex items-center justify-between px-6 transition-all duration-300 border-b border-[rgb(var(--border-subtle))]",
                layoutMode === 'sidebar'
                    ? (isSidebarCollapsed ? "left-20" : "left-64")
                    : "left-0" // Dock mode: full width
            )}
            style={{
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            }}
        >
            <div className="flex items-center gap-4 flex-1">
                {/* Logo */}
                <div className="flex items-center gap-3 min-w-[180px]">
                    <VOBLogoCompact size="medium" />
                    {layoutMode === 'dock' && (
                        <span className="font-semibold text-lg text-[rgb(var(--text-primary))]">
                            VOB <span className="opacity-60">Brasil</span>
                        </span>
                    )}
                </div>

                {/* Search Bar - Aligned Left */}
                <div ref={searchRef} className="w-full max-w-xl relative">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] group-focus-within:text-[rgb(var(--accent-primary))] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar processos, clientes..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery && setShowSuggestions(true)}
                            className="w-full pl-12 pr-10 py-2.5 rounded-2xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setShowSuggestions(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-[rgb(var(--bg-secondary))] rounded-xl shadow-2xl border border-[rgb(var(--border-subtle))] py-2 animate-fade-in z-50 max-h-96 overflow-y-auto custom-scrollbar">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.id}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-4 py-3 hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-3 border-b border-[rgb(var(--border-subtle))] last:border-0"
                                >
                                    <div className={`p-2 rounded-lg ${suggestion.type === 'client' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                        {suggestion.type === 'client' ? <User size={16} /> : <Scale size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{suggestion.title}</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">{suggestion.subtitle}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Gamification HUD - Next to Search */}
                <GamificationHUD />
            </div>

            {/* Centered Clock */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-tertiary))]/50 px-4 py-2 rounded-xl border border-[rgb(var(--border-subtle))] shadow-sm backdrop-blur-md">
                    <Clock size={18} className="text-[rgb(var(--accent-primary))]" />
                    <span className="text-base font-mono font-bold tracking-wide">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Voice Command Button */}
                <VoiceButton
                    onOpenModal={(type) => {
                        if (type === 'process') openModal('process');
                        else if (type === 'client') navigate('/clients');
                        else if (type === 'service') openModal('service');
                        else if (type === 'event') openModal('event');
                    }}
                />

                {/* Theme Selector Dropdown */}
                <div className="relative" ref={themeMenuRef}>
                    <button
                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                        className="p-2.5 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors relative"
                        aria-label="Selecionar tema"
                        title="Modos de Exibição"
                    >
                        <Palette size={20} />
                        {/* Theme indicator dot */}
                        <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-[rgb(var(--bg-secondary))] ${theme === 'light' ? 'bg-blue-500' :
                            theme === 'dark' ? 'bg-indigo-500' :
                                theme === 'black' ? 'bg-purple-500' :
                                    'bg-pink-500'
                            }`} />
                    </button>

                    {isThemeMenuOpen && (
                        <div className="absolute right-0 top-full mt-4 w-72 bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] py-2 animate-scale-in z-50 origin-top-right">
                            <div className="px-5 py-4 border-b border-[rgb(var(--border-subtle))]">
                                <h3 className="text-sm font-bold text-[rgb(var(--text-primary))]">Modos de Exibição</h3>
                                <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">Escolha seu tema preferido</p>
                            </div>

                            <div className="py-2 px-2 space-y-1">
                                {/* Light Mode */}
                                <button
                                    onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'light'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                        : 'hover:bg-[rgb(var(--bg-tertiary))] border border-transparent'
                                        }`}
                                >
                                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm">
                                        <Sun size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">Light</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Azul petróleo clean</p>
                                    </div>
                                    {theme === 'light' && (
                                        <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>

                                {/* Pink Mode */}
                                <button
                                    onClick={() => { setTheme('pink'); setIsThemeMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'pink'
                                        ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800'
                                        : 'hover:bg-[rgb(var(--bg-tertiary))] border border-transparent'
                                        }`}
                                >
                                    <div className="p-2.5 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 shadow-sm">
                                        <Sparkles size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">Pink</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Elegante feminino</p>
                                    </div>
                                    {theme === 'pink' && (
                                        <CheckCircle size={18} className="text-pink-600 dark:text-pink-400" />
                                    )}
                                </button>

                                {/* Blue Moon (formerly Dark) */}
                                <button
                                    onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'dark'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                                        : 'hover:bg-[rgb(var(--bg-tertiary))] border border-transparent'
                                        }`}
                                >
                                    <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm">
                                        <Moon size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">Blue Moon</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Azul neon elegante</p>
                                    </div>
                                    {theme === 'dark' && (
                                        <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </button>

                                {/* Black Hole (formerly Black) */}
                                <button
                                    onClick={() => { setTheme('black'); setIsThemeMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'black'
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                                        : 'hover:bg-[rgb(var(--bg-tertiary))] border border-transparent'
                                        }`}
                                >
                                    <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm">
                                        <Zap size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">Black Hole</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Aparência sci-fi premium</p>
                                    </div>
                                    {theme === 'black' && (
                                        <CheckCircle size={18} className="text-purple-600 dark:text-purple-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-all relative"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[rgb(var(--bg-secondary))] animate-pulse"></span>
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 top-full mt-4 w-96 bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] py-2 animate-scale-in z-50 origin-top-right">
                            <div className="px-5 py-4 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center">
                                <h3 className="text-sm font-bold text-[rgb(var(--text-primary))]">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllNotificationsAsRead} className="text-xs font-medium text-[rgb(var(--accent-primary))] hover:underline">
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-12 text-center text-[rgb(var(--text-tertiary))] text-sm flex flex-col items-center gap-3">
                                        <Bell size={32} className="opacity-20" />
                                        Nenhuma notificação nova
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markNotificationAsRead(notification.id)}
                                            className={`px-5 py-4 hover:bg-[rgb(var(--bg-tertiary))] cursor-pointer transition-colors border-b border-[rgb(var(--border-subtle))] last:border-0 ${!notification.read ? 'bg-[rgb(var(--accent-primary))]/5' : ''}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!notification.read ? 'font-bold text-[rgb(var(--text-primary))]' : 'font-medium text-[rgb(var(--text-secondary))]'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-[rgb(var(--text-tertiary))] mt-2 uppercase tracking-wide">{notification.time}</p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2.5 h-2.5 bg-[rgb(var(--accent-primary))] rounded-full mt-2 shadow-sm shadow-[rgb(var(--accent-primary))]/50"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-4 py-3 border-t border-[rgb(var(--border-subtle))] text-center bg-[rgb(var(--bg-tertiary))]/30">
                                <Link to="/notifications" className="text-xs font-bold text-[rgb(var(--accent-primary))] hover:underline">
                                    Ver todas as notificações
                                </Link>
                            </div>
                        </div>
                    )}
                </div>



                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 hover:bg-[rgb(var(--bg-tertiary))] p-1.5 pr-3 rounded-xl transition-colors border border-transparent hover:border-[rgb(var(--border-subtle))]"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-bold text-[rgb(var(--text-primary))] leading-none">{user?.name}</p>
                            <p className="text-[10px] font-medium text-[rgb(var(--text-secondary))] mt-1 uppercase tracking-wide">Ver perfil</p>
                        </div>
                        <ChevronDown size={16} className="text-[rgb(var(--text-tertiary))]" />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-full mt-4 w-64 bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl border border-[rgb(var(--border-subtle))] py-2 animate-scale-in z-50 origin-top-right">
                            <div className="px-5 py-4 border-b border-[rgb(var(--border-subtle))]">
                                <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{user?.name}</p>
                                <p className="text-xs text-[rgb(var(--text-secondary))] truncate mt-0.5">{user?.email}</p>
                            </div>

                            <div className="py-2 px-2 space-y-1">
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors">
                                    <User size={18} /> Meu Perfil
                                </Link>
                                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors">
                                    <Settings size={18} /> Configurações
                                </Link>
                            </div>

                            <div className="border-t border-[rgb(var(--border-subtle))] pt-2 px-2 mt-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                    <LogOut size={18} /> Sair
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
