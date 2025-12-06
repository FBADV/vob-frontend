import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Scale,
    Calendar,
    FileText,
    DollarSign,
    Briefcase,
    Gavel,
    BarChart3,
    Target,
    MessageSquare,
    Settings
} from 'lucide-react';
import { useGlobalData } from '../context/GlobalDataContext';
import clsx from 'clsx';

interface DockItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    isActive: boolean;
    onClick: () => void;
    mouseX: number | null;
    dockRef: React.RefObject<HTMLDivElement | null>;
}

const DockItem: React.FC<DockItemProps> = ({ icon: Icon, label, isActive, onClick, mouseX, dockRef }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const { dockStyle, dockAnimations } = useGlobalData();
    const [isHovered, setIsHovered] = useState(false);

    // Calculate scale for Zoom effect
    let scale = 1;
    if (dockAnimations.zoom && mouseX !== null && itemRef.current && dockRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const distanceFromMouse = Math.abs(mouseX - itemCenterX);

        // macOS Dock effect logic
        const baseScale = 1;
        const maxScale = 1.5;
        const influenceRadius = 150;

        if (distanceFromMouse < influenceRadius) {
            const scaleAmount = (1 - distanceFromMouse / influenceRadius) * (maxScale - baseScale);
            scale = baseScale + scaleAmount;
        }
    }

    const size = dockAnimations.zoom ? `${52 * scale}px` : '52px';

    return (
        <div
            ref={itemRef}
            className="relative group flex flex-col items-center justify-center transition-all duration-75 ease-out"
            style={{
                width: size,
                height: size,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Tooltip */}
            {isHovered && (
                <div
                    className={clsx(
                        "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-50 animate-fade-in-up",
                        dockStyle === 'futurist'
                            ? "bg-black/90 text-[rgb(var(--accent-primary))] border border-[rgb(var(--accent-primary))]"
                            : "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] shadow-xl"
                    )}
                >
                    {label}
                </div>
            )}

            {/* Icon Container */}
            <button
                onClick={onClick}
                className={clsx(
                    "relative flex items-center justify-center transition-all duration-300 group",
                    // Style-specific classes
                    dockStyle === 'premium' && "rounded-xl",
                    dockStyle === 'minimal' && "rounded-full",
                    dockStyle === 'futurist' && "rounded-none skew-x-[-10deg] border-r border-[rgb(var(--accent-primary))]/30 last:border-r-0",

                    // Active/Hover states
                    isActive
                        ? (dockStyle === 'futurist'
                            ? "bg-[rgb(var(--accent-primary))]/20 text-[rgb(var(--accent-primary))] shadow-[0_0_15px_rgba(var(--accent-primary),0.4)]"
                            : "bg-[rgb(var(--accent-primary))]/15 text-[rgb(var(--accent-primary))] shadow-lg shadow-[rgb(var(--accent-primary))]/10 scale-110 ring-1 ring-[rgb(var(--accent-primary))]/30")
                        : (dockStyle === 'futurist'
                            ? "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/10"
                            : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--text-primary))] hover:scale-105"),

                    // Bounce Animation
                    dockAnimations.bounce && isActive && "animate-bounce-short"
                )}
                style={{
                    // Glow Animation
                    boxShadow: (dockAnimations.glow && isHovered && dockStyle !== 'futurist')
                        ? '0 0 20px -5px rgba(var(--accent-primary), 0.5)'
                        : undefined
                }}
            >
                <Icon
                    size={dockAnimations.zoom ? 30 * (scale > 1.2 ? 1.2 : 1) : 30}
                    strokeWidth={isActive ? 2.2 : 2}
                    className={clsx(
                        "transition-transform duration-200",
                        dockStyle === 'futurist' && isActive && "animate-pulse-slow"
                    )}
                />

                {/* Active Indicator Dot (for Minimal/Premium) */}
                {isActive && dockStyle !== 'futurist' && (
                    <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-[rgb(var(--accent-primary))]"></div>
                )}
            </button>
        </div>
    );
};

export const DockNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dockRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX] = useState<number | null>(null);
    const { dockStyle } = useGlobalData();

    // SYNC WITH SIDEBAR - EXACT SAME ORDER AND NAMES
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Scale, label: 'Processos', path: '/processes' },
        { icon: Users, label: 'Clientes', path: '/clients' },
        { icon: Calendar, label: 'Agenda', path: '/agenda' },
        { icon: Briefcase, label: 'Atendimento', path: '/services' },
        { icon: Gavel, label: 'Jurisprudência', path: '/jurisprudence' },
        { icon: BarChart3, label: 'Relatórios', path: '/reports' },
        { icon: Target, label: 'CRM', path: '/crm' },
        { icon: FileText, label: 'Documentos', path: '/documents' },
        { icon: DollarSign, label: 'Financeiro', path: '/financial' },
        { icon: MessageSquare, label: 'Chat Interno', path: '/chat' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    // Mobile: Only 5 essential items for bottom bar
    const mobileMenuItems = [
        { icon: LayoutDashboard, label: 'Início', path: '/' },
        { icon: Scale, label: 'Processos', path: '/processes' },
        { icon: Users, label: 'Clientes', path: '/clients' },
        { icon: Calendar, label: 'Agenda', path: '/agenda' },
        { icon: Settings, label: 'Mais', path: '/settings' },
    ];

    return (
        <>
            {/* Desktop Dock - Hidden on mobile */}
            <div className="hidden lg:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div
                    ref={dockRef}
                    onMouseMove={(e) => setMouseX(e.clientX)}
                    onMouseLeave={() => setMouseX(null)}
                    className={clsx(
                        "flex items-center gap-3 px-4 py-3 transition-all duration-300 mx-auto",
                        // Dock Styles
                        dockStyle === 'premium' && "rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20",
                        dockStyle === 'minimal' && "rounded-full border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-secondary))] shadow-lg px-6 py-3 gap-3",
                        dockStyle === 'futurist' && "rounded-none border-x border-t border-[rgb(var(--accent-primary))] bg-black/90 shadow-[0_0_20px_-5px_rgba(var(--accent-primary),0.5)] backdrop-blur-md clip-path-trapezoid px-8"
                    )}
                    style={{
                        boxShadow: dockStyle === 'premium' ? '0 15px 35px -5px rgba(0,0,0,0.2)' : undefined
                    }}
                >
                    {menuItems.map((item) => (
                        <DockItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            isActive={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            mouseX={mouseX}
                            dockRef={dockRef}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Bottom Tab Bar - Only on mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgb(var(--bg-secondary))]/95 backdrop-blur-lg border-t border-[rgb(var(--border-subtle))] safe-area-pb">
                <nav className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
                    {mobileMenuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-h-[44px] min-w-[44px]",
                                    isActive
                                        ? "text-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10"
                                        : "text-[rgb(var(--text-secondary))] active:bg-[rgb(var(--bg-tertiary))]"
                                )}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium leading-none">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
};
