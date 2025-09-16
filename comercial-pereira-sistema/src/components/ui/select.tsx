import React, { SelectHTMLAttributes} from "react";
import {cn} from "@/lib/utils/utils";
import {AlertCircle, ChevronDown} from "lucide-react";


interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    options: SelectOption[];
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
                                                  label,
                                                  error,
                                                  helpText,
                                                  required,
                                                  size = 'md',
                                                  options,
                                                  placeholder,
                                                  className,
                                                  ...props
                                              }) => {
    const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-4 text-lg'
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    className={cn(
                        'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white',
                        sizeClasses[size],
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}

            {helpText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helpText}</p>
            )}
        </div>
    );
};