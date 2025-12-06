import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Scale,
    Calendar,
    Briefcase,
    Settings,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    BarChart3,
    FileText,
    DollarSign,
    Target,
    MessageSquare
} from 'lucide-react';
import clsx from 'clsx';
import { useGlobalData } from '../context/GlobalDataContext';
import { VOBLogoWithText } from './Logo';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Scale, label: 'Processos', path: '/processes' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Briefcase, label: 'Atendimentos', path: '/services' },
    { icon: BookOpen, label: 'Jurisprudência', path: '/jurisprudence' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Target, label: 'CRM', path: '/crm' },
    { icon: FileText, label: 'Documentos', path: '/documents' },
    { icon: DollarSign, label: 'Financeiro', path: '/financial' },
    { icon: MessageSquare, label: 'Chat Interno', path: '/chat' },
    // Settings moved to bottom manually in render
];

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { isSidebarCollapsed, toggleSidebar } = useGlobalData();

    const handleToggle = () => {
        console.log('Toggling sidebar. Current state:', isSidebarCollapsed);
        toggleSidebar();
    };

    // Listen for mobile toggle event
    React.useEffect(() => {
        const handleMobileToggle = () => {
            toggleSidebar();
        };
        document.addEventListener('toggle-sidebar', handleMobileToggle);
        return () => document.removeEventListener('toggle-sidebar', handleMobileToggle);
    }, [toggleSidebar]);

    return (
        <aside
            className={clsx(
                "bg-[rgb(var(--bg-secondary))] h-screen fixed left-0 top-0 flex flex-col z-[60] transition-all duration-500 ease-out border-r border-[rgb(var(--border-subtle))]",
                // Mobile behavior: slide in/out
                "lg:translate-x-0", // Always visible on desktop (width controlled by style)
                isSidebarCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
            )}
            style={{
                width: window.innerWidth >= 1024 ? (isSidebarCollapsed ? '5rem' : '16rem') : '16rem', // Fixed width on mobile when open
                boxShadow: '4px 0 24px -8px rgba(0, 0, 0, 0.08)'
            }}
        >
            {/* Logo Header - No borders, just spacing */}
            <div className="p-6 flex items-center justify-between h-20 overflow-hidden">
                <div className={clsx(
                    "transition-all duration-500 overflow-hidden whitespace-nowrap",
                    isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"
                )}>
                    <VOBLogoWithText collapsed={isSidebarCollapsed} />
                </div>
                <button
                    onClick={handleToggle}
                    className={clsx(
                        "p-2.5 rounded-2xl transition-all duration-300",
                        "hover:bg-[rgb(var(--bg-tertiary))]",
                        "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--accent-primary))]",
                        "transform hover:scale-110 active:scale-95",
                        isSidebarCollapsed && "mx-auto"
                    )}
                    title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Subtle gradient divider instead of border */}
            <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--border-subtle))] to-transparent mx-4 opacity-50" />

            {/* Menu Items - No scrollbar visible */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide custom-scrollbar">
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl",
                                "transition-all duration-300 ease-out",
                                "animate-slide-in-left",
                                isActive
                                    ? "bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white shadow-lg shadow-[rgb(var(--accent-primary))]/20"
                                    : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--accent-primary))]"
                            )}
                            style={{
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            {/* Glow effect on active */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] opacity-20 blur-xl" />
                            )}

                            {/* Icon with smooth animation */}
                            <div className={clsx(
                                "relative z-10 transition-all duration-300",
                                !isActive && "group-hover:scale-110 group-hover:rotate-3"
                            )}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {/* Label with fade */}
                            {!isSidebarCollapsed && (
                                <span className={clsx(
                                    "relative z-10 font-bold text-sm transition-all duration-300",
                                    isActive ? "font-bold" : "group-hover:translate-x-0.5"
                                )}>
                                    {item.label}
                                </span>
                            )}

                            {/* Premium tooltip for collapsed state */}
                            {isSidebarCollapsed && (
                                <div className={clsx(
                                    "absolute left-full ml-4 px-4 py-2.5",
                                    "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]",
                                    "text-sm font-bold rounded-2xl shadow-2xl",
                                    "opacity-0 group-hover:opacity-100",
                                    "pointer-events-none transition-all duration-300",
                                    "whitespace-nowrap border border-[rgb(var(--border-subtle))]",
                                    "transform -translate-x-2 group-hover:translate-x-0 z-50"
                                )}>
                                    {item.label}
                                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[rgb(var(--bg-secondary))] border-l border-b border-[rgb(var(--border-subtle))]" />
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Subtle gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--border-subtle))] to-transparent mx-4 opacity-50" />

            {/* Settings at Bottom - Premium style */}
            <div className="p-4">
                <Link
                    to="/settings"
                    className={clsx(
                        "group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl",
                        "transition-all duration-300 ease-out",
                        location.pathname === '/settings'
                            ? "bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white shadow-lg shadow-[rgb(var(--accent-primary))]/20"
                            : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--accent-primary))]"
                    )}
                >
                    {location.pathname === '/settings' && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] opacity-20 blur-xl" />
                    )}

                    <div className={clsx(
                        "relative z-10 transition-all duration-500",
                        location.pathname !== '/settings' && "group-hover:rotate-90"
                    )}>
                        <Settings size={20} strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
                    </div>

                    {!isSidebarCollapsed && (
                        <span className={clsx(
                            "relative z-10 font-bold text-sm transition-all duration-300",
                            location.pathname === '/settings' ? "font-bold" : "group-hover:translate-x-0.5"
                        )}>
                            Configurações
                        </span>
                    )}

                    {isSidebarCollapsed && (
                        <div className={clsx(
                            "absolute left-full ml-4 px-4 py-2.5",
                            "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]",
                            "text-sm font-bold rounded-2xl shadow-2xl",
                            "opacity-0 group-hover:opacity-100",
                            "pointer-events-none transition-all duration-300",
                            "whitespace-nowrap border border-[rgb(var(--border-subtle))]",
                            "transform -translate-x-2 group-hover:translate-x-0 z-50"
                        )}>
                            Configurações
                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[rgb(var(--bg-secondary))] border-l border-b border-[rgb(var(--border-subtle))]" />
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    );
};
