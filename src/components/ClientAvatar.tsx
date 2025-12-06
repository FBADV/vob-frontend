import React from 'react';
import { getAvatarInitials, getAvatarGradient } from '../utils/avatarUtils';
import type { Client } from '../types';

interface ClientAvatarProps {
    client?: Client | null;
    name?: string;
    photoUrl?: string;
    type?: 'individual' | 'company';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    representativeName?: string;
    representativePhotoUrl?: string;
}

export const ClientAvatar: React.FC<ClientAvatarProps> = ({
    client,
    name,
    photoUrl,
    type,
    size = 'md',
    className = '',
    representativeName,
    representativePhotoUrl
}) => {
    // Resolve props: prefer direct props, fallback to client object
    const resolvedName = name || client?.name || 'Cliente Desconhecido';
    const resolvedPhotoUrl = photoUrl || client?.photoUrl;
    const resolvedType = type || client?.type || 'individual';

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-14 h-14 text-lg'
    };

    const baseClasses = `rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm overflow-hidden ${sizeClasses[size]} ${className}`;

    const renderMainAvatar = () => {
        if (resolvedPhotoUrl) {
            return (
                <div className={`${baseClasses} bg-gray-100 dark:bg-gray-800 border border-[rgb(var(--border-subtle))] relative`}>
                    <img
                        src={resolvedPhotoUrl}
                        alt={resolvedName}
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }

        return (
            <div className={`${baseClasses} bg-gradient-to-br ${getAvatarGradient(resolvedType)} relative`}>
                {getAvatarInitials(resolvedName)}
            </div>
        );
    };

    // If there is a representative, render nested avatar
    if (representativeName || representativePhotoUrl) {
        return (
            <div className="relative inline-block">
                {renderMainAvatar()}
                <div className="absolute -bottom-1 -right-1 w-[45%] h-[45%] rounded-full border-2 border-[rgb(var(--bg-secondary))] overflow-hidden shadow-sm z-10 bg-white dark:bg-gray-800 flex items-center justify-center">
                    {representativePhotoUrl ? (
                        <img
                            src={representativePhotoUrl}
                            alt={representativeName || 'Representante'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-[6px] font-bold text-white bg-gradient-to-br ${getAvatarGradient('individual')}`}>
                            {getAvatarInitials(representativeName || 'R')}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return renderMainAvatar();
};
