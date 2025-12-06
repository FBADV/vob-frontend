import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ModuleHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({ icon: Icon, title, subtitle, action }) => {
    return (
        <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div className="flex items-center gap-4">
                {/* Icon with gradient background */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-gradient-start))] to-[rgb(var(--accent-gradient-end))] opacity-10 rounded-2xl blur-xl" />
                    <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent-primary))]/10 to-[rgb(var(--accent-secondary))]/10 border border-[rgb(var(--accent-primary))]/20">
                        <Icon
                            size={28}
                            className="text-[rgb(var(--accent-primary))]"
                            strokeWidth={2.5}
                        />
                    </div>
                </div>

                {/* Title and subtitle */}
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Optional action button/element */}
            {action && (
                <div className="animate-slide-in-right">
                    {action}
                </div>
            )}
        </div>
    );
};
