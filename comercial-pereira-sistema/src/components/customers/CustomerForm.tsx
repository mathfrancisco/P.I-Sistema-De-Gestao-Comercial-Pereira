// components/customers/CustomerForm.tsx
import React, { useState, useEffect } from 'react';
import {
    User, Building, Mail, Phone, MapPin, FileText,
    ChevronDown, ChevronUp, AlertCircle, CheckCircle,
    Loader2, X, Save
} from 'lucide-react';
import {
    CustomerResponse,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerType,
    cleanDocument,
    formatCPF,
    formatCNPJ,
    isValidCPF,
    isValidCNPJ,
    BRAZIL_STATES
} from '@/types/customer';
import { useValidateDocument } from '@/lib/hooks/useCustomers';

interface CustomerFormProps {
    customer?: CustomerResponse;
    onSubmit: (data: CreateCustomerRequest | UpdateCustomerRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    mode: 'create' | 'edit';
}

interface FormErrors {
    [key: string]: string;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    document: string;
    type: CustomerType;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    isActive: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
                                                              customer,
                                                              onSubmit,
                                                              onCancel,
                                                              loading = false,
                                                              mode
                                                          }) => {
    const [formData, setFormData] = useState<FormData>({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        document: customer?.document || '',
        type: customer?.type || CustomerType.RETAIL,
        address: customer?.address || '',
        neighborhood: customer?.neighborhood || '',
        city: customer?.city || '',
        state: customer?.state || '',
        zipCode: customer?.zipCode || '',
        isActive: customer?.isActive ?? true
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [documentValidation, setDocumentValidation] = useState<{
        isValid: boolean;
        type: string;
        error?: string;
    } | null>(null);
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        contact: false,
        address: false,
        commercial: false
    });

    const { validateDocument, loading: validatingDocument } = useValidateDocument();

    // Auto-save do draft a cada 30 segundos (mock)
    useEffect(() => {
        const interval = setInterval(() => {
            if (mode === 'create' && formData.name) {
                // Implementar auto-save
                console.log('Auto-saving draft...');
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [formData, mode]);

    // Validação do documento
    useEffect(() => {
        const validateDoc = async () => {
            if (formData.document && formData.document.length >= 11) {
                try {
                    const result = await validateDocument(formData.document);
                    setDocumentValidation(result);

                    if (!result.isValid) {
                        setErrors(prev => ({ ...prev, document: result.error || 'Documento inválido' }));
                    } else {
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.document;
                            return newErrors;
                        });
                    }
                } catch (err) {
                    setDocumentValidation({ isValid: false, type: 'INVALID', error: 'Erro na validação' });
                }
            } else {
                setDocumentValidation(null);
            }
        };

        const timer = setTimeout(validateDoc, 500);
        return () => clearTimeout(timer);
    }, [formData.document, validateDocument]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Nome obrigatório
        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        }

        // Email (se fornecido)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Documento (se fornecido)
        if (formData.document) {
            const cleanDoc = cleanDocument(formData.document);
            if (cleanDoc.length === 11 && !isValidCPF(cleanDoc)) {
                newErrors.document = 'CPF inválido';
            } else if (cleanDoc.length === 14 && !isValidCNPJ(cleanDoc)) {
                newErrors.document = 'CNPJ inválido';
            } else if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
                newErrors.document = 'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos';
            }
        }

        // Validação cruzada tipo vs documento
        if (formData.document && formData.type) {
            const cleanDoc = cleanDocument(formData.document);
            if (formData.type === CustomerType.RETAIL && cleanDoc.length !== 11) {
                newErrors.document = 'Cliente pessoa física deve ter CPF (11 dígitos)';
            } else if (formData.type === CustomerType.WHOLESALE && cleanDoc.length !== 14) {
                newErrors.document = 'Cliente pessoa jurídica deve ter CNPJ (14 dígitos)';
            }
        }

        // CEP (se fornecido)
        if (formData.zipCode && !/^\d{5}-?\d{3}$/.test(formData.zipCode)) {
            newErrors.zipCode = 'CEP inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Limpar erro do campo específico
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleDocumentChange = (value: string) => {
        const cleaned = cleanDocument(value);
        let formatted = cleaned;

        // Formatação automática baseada no tamanho
        if (cleaned.length === 11) {
            formatted = formatCPF(cleaned);
        } else if (cleaned.length === 14) {
            formatted = formatCNPJ(cleaned);
        }

        handleInputChange('document', formatted);
    };

    // Lookup de CEP (mock)
    const handleZipCodeLookup = async (zipCode: string) => {
        if (!/^\d{5}-?\d{3}$/.test(zipCode)) return;

        try {
            // Simular lookup de CEP
            const response = await fetch(`https://viacep.com.br/ws/${cleanDocument(zipCode)}/json/`);
            if (response.ok) {
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        address: data.logradouro || prev.address,
                        neighborhood: data.bairro || prev.neighborhood,
                        city: data.localidade || prev.city,
                        state: data.uf || prev.state
                    }));
                }
            }
        } catch (err) {
            console.error('Erro no lookup de CEP:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Preparar dados para submissão
            const submitData = {
                ...formData,
                document: formData.document ? cleanDocument(formData.document) : null,
                email: formData.email || null,
                phone: formData.phone || null,
                address: formData.address || null,
                neighborhood: formData.neighborhood || null,
                city: formData.city || null,
                state: formData.state || null,
                zipCode: formData.zipCode || null
            };

            await onSubmit(submitData);
        } catch (err) {
            console.error('Erro ao salvar cliente:', err);
        }
    };

    const sectionStyle = "bg-white border border-gray-200 rounded-lg overflow-hidden";
    const sectionHeaderStyle = "px-6 py-4 border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors";
    const sectionContentStyle = "px-6 py-4 space-y-4";

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção 1: Dados Principais */}
                <div className={sectionStyle}>
                    <div
                        className={sectionHeaderStyle}
                        onClick={() => toggleSection('basic')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Dados Principais</h3>
                                    <p className="text-sm text-gray-500">Nome, documento e tipo de cliente</p>
                                </div>
                            </div>
                            {expandedSections.basic ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {expandedSections.basic && (
                        <div className={sectionContentStyle}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nome */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Digite o nome completo"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Tipo de Cliente */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Cliente <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('type', CustomerType.RETAIL)}
                                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                                                formData.type === CustomerType.RETAIL
                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <User className="w-4 h-4" />
                                            Varejo (PF)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('type', CustomerType.WHOLESALE)}
                                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                                                formData.type === CustomerType.WHOLESALE
                                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Building className="w-4 h-4" />
                                            Atacado (PJ)
                                        </button>
                                    </div>
                                </div>

                                {/* Documento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.type === CustomerType.RETAIL ? 'CPF' : 'CNPJ'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.document}
                                            onChange={(e) => handleDocumentChange(e.target.value)}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.document ? 'border-red-300' :
                                                    documentValidation?.isValid ? 'border-green-300' : 'border-gray-300'
                                            }`}
                                            placeholder={formData.type === CustomerType.RETAIL ? '000.000.000-00' : '00.000.000/0000-00'}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            {validatingDocument ? (
                                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                            ) : documentValidation?.isValid ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : formData.document && documentValidation?.isValid === false ? (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {errors.document && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.document}
                                        </p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Cliente ativo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Seção 2: Contatos */}
                <div className={sectionStyle}>
                    <div
                        className={sectionHeaderStyle}
                        onClick={() => toggleSection('contact')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Contatos</h3>
                                    <p className="text-sm text-gray-500">Email e telefone</p>
                                </div>
                            </div>
                            {expandedSections.contact ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {expandedSections.contact && (
                        <div className={sectionContentStyle}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="cliente@email.com"
                                        />
                                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Telefone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefone
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="(11) 99999-9999"
                                        />
                                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Seção 3: Endereço */}
                <div className={sectionStyle}>
                    <div
                        className={sectionHeaderStyle}
                        onClick={() => toggleSection('address')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <MapPin className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
                                    <p className="text-sm text-gray-500">Localização e entrega</p>
                                </div>
                            </div>
                            {expandedSections.address ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {expandedSections.address && (
                        <div className={sectionContentStyle}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CEP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CEP
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => {
                                            handleInputChange('zipCode', e.target.value);
                                            if (e.target.value.length === 9) {
                                                handleZipCodeLookup(e.target.value);
                                            }
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.zipCode ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="00000-000"
                                    />
                                    {errors.zipCode && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.zipCode}
                                        </p>
                                    )}
                                </div>

                                {/* Cidade */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nome da cidade"
                                    />
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Selecione</option>
                                        {BRAZIL_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Endereço */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Endereço
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Rua, Avenida, etc"
                                    />
                                </div>

                                {/* Bairro */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bairro
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.neighborhood}
                                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nome do bairro"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botões de ação (sticky) */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <X className="w-4 h-4 inline mr-2" />
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading || Object.keys(errors).length > 0}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};