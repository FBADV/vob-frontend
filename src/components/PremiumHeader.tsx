import React, { useState, useEffect } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import { useModal } from '../context/ModalContext';
import {
    Search,
    Bell,
    Settings,
    Sparkles,
    User,
    ChevronDown,
    Trophy,
    Clock,
    Calendar,
    Scale,
    Plus,
    RefreshCw,
    Palette,
    Moon,
    Sun,
    LogOut,
    Zap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { VOBLogoCompact } from './Logo';
import { VoiceCommandOverlay } from './VoiceCommandOverlay';
import { Mic } from 'lucide-react';

export const PremiumHeader: React.FC = () => {
    const {
        user,
        logout,
        layoutMode,
        isSidebarCollapsed,
        setTheme,
        notifications,
        syncAllProcesses,
        theme
    } = useGlobalData();
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);

    // Mock XP data
    const currentLevel = 12;
    const currentXP = 2450;
    const nextLevelXP = 3000;
    const progress = (currentXP / nextLevelXP) * 100;

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSystemUpdate = async () => {
        setIsSyncing(true);
        await syncAllProcesses();
        setIsSyncing(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className={clsx(
            "fixed top-0 right-0 h-14 md:h-16 z-40 bg-[rgb(var(--bg-secondary))]/80 backdrop-blur-md border-b border-[rgb(var(--border-subtle))] transition-all duration-300",
            layoutMode === 'sidebar'
                ? (isSidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64")
                : "left-0"
        )}>
            <div className="h-full mx-auto px-3 md:px-6 grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_auto_1fr] gap-4 items-center">

                {/* LEFT: Search + XP */}
                <div className="flex items-center gap-3">
                    {/* Logo (dock mode only, mobile) */}
                    {layoutMode === 'dock' && (
                        <div className="flex items-center gap-2 md:hidden">
                            <VOBLogoCompact size="medium" />
                        </div>
                    )}

                    {/* Search - hidden on mobile, shown on md+ */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="relative transition-all duration-300 ease-out group w-[280px] lg:w-[320px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[rgb(var(--text-secondary))]">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full h-9 pl-10 pr-4 bg-[rgb(var(--bg-tertiary))] border border-transparent rounded-lg text-sm text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-secondary))] focus:outline-none focus:bg-[rgb(var(--bg-primary))] focus:border-[rgb(var(--accent-primary))]/30 transition-all"
                            />
                        </div>

                        {/* XP Widget - compact */}
                        <div
                            onClick={() => navigate('/gamification')}
                            className="hidden xl:flex items-center gap-2 bg-[rgb(var(--bg-tertiary))]/50 px-2 py-1 rounded-lg border border-[rgb(var(--border-subtle))] cursor-pointer hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                        >
                            <div className="w-4 h-4 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <Trophy size={10} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[rgb(var(--text-primary))] leading-none">Lvl {currentLevel}</span>
                                <div className="w-10 h-0.5 bg-[rgb(var(--bg-primary))] rounded-full mt-0.5 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: Futuristic Clock */}
                <div className="hidden md:flex justify-center">
                    <div className="relative group">
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />

                        {/* Clock display */}
                        <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 px-3 py-1.5 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span className="font-mono text-xs font-bold tracking-wider text-blue-100">
                                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        {/* Pulse effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur-sm" />
                    </div>
                </div>

                {/* RIGHT: Actions + Profile */}
                <div className="flex items-center justify-end gap-2 md:gap-3">
                    {/* Quick Actions - Hidden on mobile, show only essential */}
                    <div className="hidden md:flex items-center gap-1 pr-3 border-r border-[rgb(var(--border-subtle))]">
                        <button onClick={() => { console.log('Header: Novo Atendimento clicked'); openModal('service'); }} className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-all" title="Novo Atendimento">
                            <Plus size={18} />
                        </button>
                        <button onClick={() => { console.log('Header: Novo Cliente clicked'); navigate('/clients'); }} className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-all" title="Novo Cliente">
                            <User size={18} />
                        </button>
                        <button onClick={() => { console.log('Header: Novo Processo clicked'); openModal('process'); }} className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-all" title="Novo Processo">
                            <Scale size={18} />
                        </button>
                        <button onClick={() => { console.log('Header: Nova Tarefa clicked'); openModal('event', { type: 'deadline' }); }} className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-all" title="Nova Tarefa">
                            <Clock size={18} />
                        </button>
                        <button onClick={() => { console.log('Header: Novo Agendamento clicked'); navigate('/agenda'); }} className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-all" title="Novo Agendamento">
                            <Calendar size={18} />
                        </button>
                    </div>

                    {/* System Actions - Show only essential on mobile */}
                    <div className="flex items-center gap-1 pr-2 md:pr-3 md:border-r border-[rgb(var(--border-subtle))]">{/* Mobile: only 3 essential buttons */}
                        <button
                            onClick={() => setIsVoiceOverlayOpen(true)}
                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-all relative group"
                            title="Comando de Voz"
                        >
                            <div className="absolute inset-0 bg-[rgb(var(--accent-primary))]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                            <Mic size={18} className="relative z-10" />
                        </button>


                        <button
                            onClick={handleSystemUpdate}
                            disabled={isSyncing}
                            className={`hidden md:block p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-all ${isSyncing ? 'animate-spin text-green-500 bg-green-500/10' : ''}`}
                            title="Atualizar Sistema"
                        >
                            <RefreshCw size={18} />
                        </button>

                        {/* Aparência Selector (formerly Theme) */}
                        <div className="relative">
                            <button
                                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-all"
                                title="Aparência"
                            >
                                <Palette size={18} />
                            </button>
                            {isThemeMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-2xl z-50 py-2 animate-fade-in-down overflow-hidden">
                                        <div className="px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
                                            Aparência
                                        </div>

                                        <button
                                            onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgb(var(--bg-tertiary))] flex items-center gap-3 transition-colors relative group"
                                        >
                                            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500 group-hover:scale-110 transition-transform">
                                                <Sun size={16} />
                                            </div>
                                            <span className={`flex-1 ${theme === 'light' ? 'font-bold text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>Light</span>
                                            {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-primary))]" />}
                                        </button>

                                        <button
                                            onClick={() => { setTheme('pink'); setIsThemeMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgb(var(--bg-tertiary))] flex items-center gap-3 transition-colors group"
                                        >
                                            <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-500 group-hover:scale-110 transition-transform">
                                                <Sparkles size={16} />
                                            </div>
                                            <span className={`flex-1 ${theme === 'pink' ? 'font-bold text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>Pink</span>
                                            {theme === 'pink' && <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-primary))]" />}
                                        </button>

                                        <button
                                            onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgb(var(--bg-tertiary))] flex items-center gap-3 transition-colors group"
                                        >
                                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500 group-hover:scale-110 transition-transform">
                                                <Moon size={16} />
                                            </div>
                                            <span className={`flex-1 ${theme === 'dark' ? 'font-bold text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>Blue Moon</span>
                                            {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-primary))]" />}
                                        </button>

                                        <button
                                            onClick={() => { setTheme('black'); setIsThemeMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgb(var(--bg-tertiary))] flex items-center gap-3 transition-colors group"
                                        >
                                            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                                <Zap size={16} />
                                            </div>
                                            <span className={`flex-1 ${theme === 'black' ? 'font-bold text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-primary))]'}`}>Black Hole</span>
                                            {theme === 'black' && <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-primary))]" />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/notifications')}
                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-all relative"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[rgb(var(--bg-secondary))] animate-pulse"></span>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-all"
                        >
                            <Settings size={18} />
                        </button>
                    </div>

                    {/* Cluster 3: Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-xl p-1.5 transition-all border border-transparent hover:border-[rgb(var(--border-subtle))]"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium shadow-sm overflow-hidden">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="text-left hidden xl:block">
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))] leading-none">{user?.name || 'Usuário'}</p>
                                <p className="text-[10px] text-[rgb(var(--text-secondary))] mt-0.5">Advogado Master</p>
                            </div>
                            <ChevronDown size={14} className={`text-[rgb(var(--text-secondary))] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-down">
                                    <div className="p-2 border-b border-[rgb(var(--border-subtle))]">
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{user?.name}</p>
                                            <p className="text-xs text-[rgb(var(--text-secondary))]">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="p-1">
                                        <Link to="/profile" className="w-full text-left px-3 py-2 text-sm text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg flex items-center gap-2">
                                            <User size={16} />
                                            Meu Perfil
                                        </Link>
                                        <Link to="/settings" className="w-full text-left px-3 py-2 text-sm text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg flex items-center gap-2">
                                            <Settings size={16} />
                                            Configurações
                                        </Link>
                                    </div>
                                    <div className="p-1 border-t border-[rgb(var(--border-subtle))]">
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <VoiceCommandOverlay
                isOpen={isVoiceOverlayOpen}
                onClose={() => setIsVoiceOverlayOpen(false)}
            />
        </header>
    );
};
