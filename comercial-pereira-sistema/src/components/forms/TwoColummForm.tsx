import React from "react";

interface TwoColumnFormProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    actions?: React.ReactNode;
}

export const TwoColumnForm: React.FC<TwoColumnFormProps> = ({
                                                                title,
                                                                description,
                                                                children,
                                                                onSubmit,
                                                                actions
                                                            }) => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            {(title || description) && (
                <div className="mb-8">
                    {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
                    {description && <p className="text-gray-600 mt-2">{description}</p>}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {children}
                </div>

                {actions && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        {actions}
                    </div>
                )}
            </form>
        </div>
    );
};