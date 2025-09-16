import React, {  InputHTMLAttributes } from 'react';
import {
  AlertCircle
} from 'lucide-react';
import {cn} from "@/lib/utils/utils";

// Input Component
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ComponentType;
    rightIcon?: React.ComponentType;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                error,
                                                helpText,
                                                required,
                                                size = 'md',
                                                leftIcon: LeftIcon,
                                                rightIcon: RightIcon,
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
                {LeftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LeftIcon />
                    </div>
                )}

                <input
                    className={cn(
                        'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                        sizeClasses[size],
                        LeftIcon && 'pl-10',
                        RightIcon && 'pr-10',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />

                {RightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <RightIcon />
                    </div>
                )}
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

// Money Input Component
interface MoneyInputProps extends Omit<InputProps, 'type'> {
    currency?: string;
    decimalPlaces?: number;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
                                                          currency = 'R$',
                                                          decimalPlaces = 2,
                                                          value,
                                                          onChange,
                                                          ...props
                                                      }) => {
    const formatMoney = (val: string) => {
        const number = val.replace(/\D/g, '');
        const decimal = number.slice(-decimalPlaces);
        const integer = number.slice(0, -decimalPlaces);

        if (number.length <= decimalPlaces) {
            return `0,${'0'.repeat(decimalPlaces - number.length)}${number}`;
        }

        return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatMoney(e.target.value);
        if (onChange) {
            onChange({
                ...e,
                target: {
                    ...e.target,
                    value: formatted
                }
            });
        }
    };

    return (
        <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        {currency}
      </span>
            <Input
                {...props}
                value={value}
                onChange={handleChange}
                className="pl-10"
            />
        </div>
    );
};



