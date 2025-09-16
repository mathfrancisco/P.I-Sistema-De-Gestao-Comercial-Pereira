import React from 'react';
import {
    Package,
    AlertCircle, Info, CheckCircle
    , Loader2, X
} from 'lucide-react';
import {cn} from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";


// Toast Component (usando Sonner internamente, aqui é só a estrutura)
interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const Toast: React.FC<ToastProps> = ({
                                                type,
                                                title,
                                                description,
                                                action
                                            }) => {
    const icons = {
        success: CheckCircle,
        error: X,
        warning: AlertCircle,
        info: Info
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const Icon = icons[type];

    return (
        <div className={cn('p-4 rounded-lg border', colors[type])}>
            <div className="flex items-start">
                <Icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-medium">{title}</h4>
                    {description && (
                        <p className="text-sm mt-1 opacity-90">{description}</p>
                    )}
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="text-sm font-medium underline mt-2 hover:no-underline"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// Loading Spinner Component
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
                                                    size = 'md',
                                                    className
                                                }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
    );
};

// Empty State Component
interface EmptyStateProps {
    icon?: React.ComponentType;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          icon: Icon = Package,
                                                          title,
                                                          description,
                                                          action
                                                      }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 max-w-md mb-6">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};