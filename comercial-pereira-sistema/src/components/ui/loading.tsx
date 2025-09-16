import React from 'react';

interface SkeletonProps {
    className?: string;
    lines?: number;
    width?: string;
    height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
                                                      className,
                                                      lines = 1,
                                                      width = '100%',
                                                      height = '1rem'
                                                  }) => {
    return (
        <div className={className}>
            {[...Array(lines)].map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded"
                    style={{
                        width: i === lines - 1 ? '75%' : width,
                        height,
                        marginBottom: i < lines - 1 ? '0.5rem' : 0
                    }}
                />
            ))}
        </div>
    );
};