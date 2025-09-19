// components/sales/CustomerQuickSelect.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    User,
    Building,
    X,
    Plus,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/lib/hooks/useCustomers';
import type { CustomerResponse, CustomerType } from '@/types/customer';

interface CustomerQuickSelectProps {
    selectedCustomer?: CustomerResponse | null;
    onCustomerSelect: (customer: CustomerResponse) => void;
    onCustomerClear: () => void;
    onNewCustomerRequest?: () => void;
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
}

interface CustomerSearchResultProps {
    customer: CustomerResponse;
    onSelect: (customer: CustomerResponse) => void;
    searchTerm: string;
}

const CustomerSearchResult: React.FC<CustomerSearchResultProps> = ({
                                                                       customer,
                                                                       onSelect,
                                                                       searchTerm
                                                                   }) => {
    const highlightMatch = (text: string, term: string) => {
        if (!term) return text;

        const regex = new RegExp(`(${term})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
                regex.test(part) ? (
                    <span key={index} className="bg-yellow-200 font-medium">
          {part}
        </span>
                ) : part
        );
    };

    return (
        <button
            onClick={() => onSelect(customer)}
            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0',
                    customer.type === 'WHOLESALE' ? 'bg-blue-500' : 'bg-green-500'
                )}>
                    {customer.type === 'WHOLESALE' ? (
                        <Building className="w-4 h-4" />
                    ) : (
                        <User className="w-4 h-4" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                            {highlightMatch(customer.name, searchTerm)}
                        </h3>
                        <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            customer.type === 'WHOLESALE'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                        )}>
              {customer.type === 'WHOLESALE' ? 'Atacado' : 'Varejo'}
            </span>
                    </div>

                    {customer.document && (
                        <p className="text-sm text-gray-600">
                            {highlightMatch(customer.document, searchTerm)}
                        </p>
                    )}

                    {customer.address && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {customer.address.city}, {customer.address.state}
                        </p>
                    )}
                </div>

                {customer.creditLimit && customer.creditLimit > 0 && (
                    <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                            <CreditCard className="w-3 h-3" />
                            <span>Limite</span>
                        </div>
                        <p className="text-sm font-medium text-blue-600">
                            R$ {customer.creditLimit.toFixed(2)}
                        </p>
                    </div>
                )}
            </div>
        </button>
    );
};

const CustomerCard: React.FC<{
    customer: CustomerResponse;
    onEdit?: () => void;
    onRemove: () => void;
}> = ({ customer, onEdit, onRemove }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
                <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0',
                    customer.type === 'WHOLESALE' ? 'bg-blue-500' : 'bg-green-500'
                )}>
                    {customer.type === 'WHOLESALE' ? (
                        <Building className="w-5 h-5" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                            {customer.name}
                        </h3>
                        <button
                            onClick={onRemove}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1 mt-1">
                        {customer.document && (
                            <p className="text-sm text-gray-600">{customer.document}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className={cn(
                  'px-2 py-0.5 font-medium rounded-full',
                  customer.type === 'WHOLESALE'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
              )}>
                {customer.type === 'WHOLESALE' ? 'Atacado' : 'Varejo'}
              </span>

                            {customer.address && (
                                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                                    {customer.address.city}, {customer.address.state}
                </span>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            {customer.phone && (
                                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                                    {customer.phone}
                </span>
                            )}

                            {customer.email && (
                                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3" />
                                    {customer.email}
                </span>
                            )}
                        </div>

                        {/* Credit Info */}
                        {customer.creditLimit && customer.creditLimit > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                <span className="text-xs text-gray-600">Limite de crédito:</span>
                                <span className="text-sm font-medium text-blue-600">
                  R$ {customer.creditLimit.toFixed(2)}
                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CustomerQuickSelect: React.FC<CustomerQuickSelectProps> = ({
                                                                            selectedCustomer,
                                                                            onCustomerSelect,
                                                                            onCustomerClear,
                                                                            onNewCustomerRequest,
                                                                            className,
                                                                            placeholder = "Buscar cliente...",
                                                                            autoFocus = false
                                                                        }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<CustomerResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mock search - in real app, this would use a debounced API call
    useEffect(() => {
        const searchCustomers = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);

            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 300));

                // Mock results - replace with actual API call
                const mockResults: CustomerResponse[] = [
                    {
                        id: 1,
                        name: 'João Silva Santos',
                        document: '123.456.789-10',
                        email: 'joao@email.com',
                        phone: '(11) 99999-9999',
                        type: 'RETAIL' as CustomerType,
                        isActive: true,
                        address: {
                            street: 'Rua das Flores, 123',
                            city: 'São Paulo',
                            state: 'SP',
                            zipCode: '01234-567',
                            country: 'BR'
                        },
                        creditLimit: 1000,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: 2,
                        name: 'Empresa XYZ Ltda',
                        document: '12.345.678/0001-90',
                        email: 'contato@empresaxyz.com',
                        phone: '(11) 3333-4444',
                        type: 'WHOLESALE' as CustomerType,
                        isActive: true,
                        address: {
                            street: 'Av. Paulista, 1000',
                            city: 'São Paulo',
                            state: 'SP',
                            zipCode: '01310-100',
                            country: 'BR'
                        },
                        creditLimit: 5000,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ].filter(customer =>
                    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.document.includes(searchTerm)
                );

                setSearchResults(mockResults);
            } catch (error) {
                console.error('Error searching customers:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchCustomers, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCustomerSelect = (customer: CustomerResponse) => {
        onCustomerSelect(customer);
        setSearchTerm('');
        setSearchResults([]);
        setIsOpen(false);
    };

    const handleSearchFocus = () => {
        setIsOpen(true);
        if (autoFocus && searchRef.current) {
            searchRef.current.focus();
        }
    };

    const handleNewCustomer = () => {
        if (onNewCustomerRequest) {
            onNewCustomerRequest();
        } else {
            // Default behavior - could open a modal or navigate to customer form
            console.log('New customer requested');
        }
        setIsOpen(false);
    };

    if (selectedCustomer) {
        return (
            <div className={className}>
                <CustomerCard
                    customer={selectedCustomer}
                    onRemove={onCustomerClear}
                />
            </div>
        );
    }

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    ref={searchRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleSearchFocus}
                    className={cn(
                        'pl-10 pr-10',
                        isOpen && 'border-blue-500 ring-1 ring-blue-500'
                    )}
                    autoFocus={autoFocus}
                />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <ChevronDown className={cn(
                        'w-4 h-4 transition-transform',
                        isOpen && 'rotate-180'
                    )} />
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {isSearching ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Buscando clientes...</p>
                        </div>
                    ) : searchTerm.length < 2 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Digite pelo menos 2 caracteres para buscar
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-3">
                                Nenhum cliente encontrado
                            </p>
                            <Button
                                size="sm"
                                onClick={handleNewCustomer}
                                className="text-xs"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Cadastrar novo cliente
                            </Button>
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto">
                            {searchResults.map((customer) => (
                                <CustomerSearchResult
                                    key={customer.id}
                                    customer={customer}
                                    onSelect={handleCustomerSelect}
                                    searchTerm={searchTerm}
                                />
                            ))}

                            {/* Add new customer option */}
                            <div className="border-t border-gray-200 p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleNewCustomer}
                                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Cadastrar novo cliente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};