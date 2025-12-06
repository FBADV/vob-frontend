import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'pulse'
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'text':
                return 'h-4 rounded';
            case 'circular':
                return 'rounded-full';
            case 'rectangular':
                return '';
            case 'rounded':
                return 'rounded-lg';
            default:
                return '';
        }
    };

    const getAnimationClass = () => {
        switch (animation) {
            case 'pulse':
                return 'animate-pulse';
            case 'wave':
                return 'animate-shimmer-skeleton';
            case 'none':
                return '';
            default:
                return 'animate-pulse';
        }
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`
                bg-gradient-to-r from-[rgb(var(--bg-tertiary))] via-[rgb(var(--border-subtle))] to-[rgb(var(--bg-tertiary))]
                ${getVariantClasses()}
                ${getAnimationClass()}
                ${className}
            `}
            style={style}
        />
    );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`card-premium p-6 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="40%" height={16} />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton width="100%" height={16} />
                <Skeleton width="90%" height={16} />
                <Skeleton width="80%" height={16} />
            </div>
        </div>
    );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
    return (
        <tr className="border-b border-[rgb(var(--border-subtle))]">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-6 py-4">
                    <Skeleton width="80%" height={16} />
                </td>
            ))}
        </tr>
    );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC<{ showAvatar?: boolean }> = ({ showAvatar = true }) => {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-[rgb(var(--border-subtle))]">
            {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
            <div className="flex-1 space-y-2">
                <Skeleton width="70%" height={18} />
                <Skeleton width="50%" height={14} />
            </div>
            <Skeleton variant="rounded" width={80} height={32} />
        </div>
    );
};

// Process Card Skeleton
export const ProcessCardSkeleton: React.FC = () => {
    return (
        <div className="card-premium p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-2">
                    <Skeleton width="40%" height={20} />
                    <Skeleton width="60%" height={16} />
                </div>
                <Skeleton variant="rounded" width={80} height={24} />
            </div>
            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton width="50%" height={14} />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton width="40%" height={14} />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton variant="rounded" width={100} height={36} />
                <Skeleton variant="rounded" width={100} height={36} />
            </div>
        </div>
    );
};

// Client Card Skeleton
export const ClientCardSkeleton: React.FC = () => {
    return (
        <div className="card-premium p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={56} height={56} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="40%" height={14} />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton width="70%" height={14} />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={16} height={16} />
                    <Skeleton width="60%" height={14} />
                </div>
            </div>
        </div>
    );
};

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card-premium p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton variant="circular" width={48} height={48} />
                        <Skeleton variant="rounded" width={60} height={24} />
                    </div>
                    <Skeleton width="40%" height={14} className="mb-2" />
                    <Skeleton width="60%" height={32} />
                </div>
            ))}
        </div>
    );
};

// Chart Skeleton
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
    return (
        <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
                <Skeleton width="30%" height={24} />
                <Skeleton variant="rounded" width={100} height={32} />
            </div>
            <Skeleton variant="rounded" width="100%" height={height} />
        </div>
    );
};

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => {
    return (
        <div className="space-y-6">
            {Array.from({ length: fields }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton width="30%" height={16} />
                    <Skeleton variant="rounded" width="100%" height={40} />
                </div>
            ))}
            <div className="flex gap-3 justify-end pt-4">
                <Skeleton variant="rounded" width={100} height={40} />
                <Skeleton variant="rounded" width={100} height={40} />
            </div>
        </div>
    );
};
