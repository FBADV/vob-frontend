import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

import { useGlobalData } from '../context/GlobalDataContext';
import clsx from 'clsx';

import { DockNavigation } from '../components/DockNavigation';
import { PremiumHeader } from '../components/PremiumHeader';

export const MainLayout: React.FC = () => {
    const { isSidebarCollapsed, layoutMode } = useGlobalData();

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-primary))] transition-colors duration-300 overflow-x-hidden">
            {/* Desktop/Tablet Sidebar - Hidden on mobile */}
            {/* Sidebar - Visible on mobile when toggled, always on desktop if mode is sidebar */}
            {layoutMode === 'sidebar' && <Sidebar />}

            {/* Desktop Dock - Hidden on mobile */}
            <div className="hidden lg:block">
                {layoutMode === 'dock' && <DockNavigation />}
            </div>

            <PremiumHeader />

            <main
                className={clsx(
                    "pt-20 md:pt-24 transition-all duration-300 animate-fade-in min-h-screen",
                    // Mobile: full width, minimal padding
                    "px-4 pb-20",
                    // Tablet: more padding
                    "md:px-6 md:pb-8",
                    // Desktop: sidebar spacing
                    layoutMode === 'sidebar'
                        ? "lg:ml-20 lg:px-8 lg:pb-8" + (isSidebarCollapsed ? "" : " xl:ml-64")
                        : "lg:ml-0 lg:px-8 lg:pb-32"
                )}
            >
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation - Only on mobile when in dock mode */}
            {layoutMode === 'dock' && (
                <div className="lg:hidden">
                    <DockNavigation />
                </div>
            )}

            {/* Mobile Sidebar Toggle - Only on mobile when in sidebar mode */}
            {layoutMode === 'sidebar' && (
                <div className="lg:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
                        className="p-4 bg-[rgb(var(--accent-primary))] text-white rounded-full shadow-xl shadow-[rgb(var(--accent-primary))]/30 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
