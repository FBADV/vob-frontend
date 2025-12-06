import React from 'react';
import logoImage from '../assets/logo_v2.png';

interface LogoProps {
    animated?: boolean;
    size?: 'small' | 'medium' | 'large';
}

interface LogoWithTextProps {
    collapsed?: boolean;
}

/**
 * VOB Logo - Large version for Login Screen
 * Only PNG image, no text, no background
 */
export const VOBLogoLarge: React.FC<LogoProps> = ({ animated = false }) => {
    return (
        <div className={`flex items-center justify-center ${animated ? 'animate-fade-in' : ''}`}>
            <img
                src={logoImage}
                alt="VOB"
                className="w-40 h-40 object-contain transition-all duration-300 
                           group-hover:scale-105"
                style={{
                    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.1))'
                }}
            />
        </div>
    );
};

/**
 * VOB Logo - For Sidebar
 * Only PNG image, no text
 */
export const VOBLogoWithText: React.FC<LogoWithTextProps> = ({ collapsed = false }) => {
    return (
        <div className="flex items-center justify-center w-full">
            <img
                src={logoImage}
                alt="VOB"
                className={`object-contain transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
                draggable="false"
                style={{
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))'
                }}
            />
        </div>
    );
};

/**
 * Compact Logo - For other uses
 */
export const VOBLogoCompact: React.FC<LogoProps> = ({ size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <img
            src={logoImage}
            alt="VOB"
            className={`${sizeClasses[size]} object-contain transition-all duration-300`}
            draggable="false"
            style={{
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.06))'
            }}
        />
    );
};
