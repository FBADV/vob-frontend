import React from 'react';
import { Outlet } from 'react-router-dom';
import { VOBLogoCompact } from '../components/Logo';

export const PortalLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex flex-col">
            {/* Simple Header */}
            <header className="h-16 border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))]/50 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
                <div className="h-full container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <VOBLogoCompact size="medium" />
                        <div className="h-4 w-px bg-[rgb(var(--border-primary))]" />
                        <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                            Portal do Cliente
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="py-6 border-t border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))]">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-[rgb(var(--text-tertiary))]">
                        &copy; {new Date().getFullYear()} Virtual Office Brazil. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};
