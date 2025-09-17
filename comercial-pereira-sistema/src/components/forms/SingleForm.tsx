// 1. SINGLE COLUMN FORM
import React from "react";

interface SingleColumnFormProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    actions?: React.ReactNode;
    maxWidth?: string;
}

export const SingleColumnForm: React.FC<SingleColumnFormProps> = ({
                                                                      title,
                                                                      description,
                                                                      children,
                                                                      onSubmit,
                                                                      actions,
                                                                      maxWidth = 'max-w-2xl'
                                                                  }) => {
    return (
        <div className={`mx-auto ${maxWidth} p-6`}>
            {(title || description) && (
                <div className="mb-8">
                    {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
                    {description && <p className="text-gray-600 mt-2">{description}</p>}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                {children}

                {actions && (
                    <div className="pt-6 border-t border-gray-200">
                        {actions}
                    </div>
                )}
            </form>
        </div>
    );
};