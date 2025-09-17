// components/products/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProductImageUploader } from './ProductImageUploader';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/types/product';

interface ProductFormProps {
    product?: ProductResponse | null;
    onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void;
    onCancel: () => void;
    loading?: boolean;
    mode: 'create' | 'edit';
    categories: { value: number; label: string }[];
    suppliers: { value: number; label: string }[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
                                                            product,
                                                            onSubmit,
                                                            onCancel,
                                                            loading = false,
                                                            mode,
                                                            categories,
                                                            suppliers
                                                        }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        code: product?.code || '',
        barcode: product?.barcode || '',
        categoryId: product?.categoryId || 0,
        supplierId: product?.supplierId || null,
        isActive: product?.isActive ?? true,
        initialStock: product?.inventory?.quantity || 0,
        minStock: product?.inventory?.minStock || 10,
        maxStock: product?.inventory?.maxStock || null,
        location: product?.inventory?.location || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [autoSave, setAutoSave] = useState<NodeJS.Timeout | null>(null);

    // Auto-save draft a cada 30 segundos
    useEffect(() => {
        if (mode === 'create') {
            const timer = setTimeout(() => {
                console.log('Auto-saving draft...', formData);
            }, 30000);
            setAutoSave(timer);

            return () => {
                if (timer) clearTimeout(timer);
            };
        }
    }, [formData, mode]);

    // Formulário em steps ou tabs para organização
    const steps = [
        {
            id: 'basic',
            title: 'Informações Básicas',
            description: 'Nome, código, descrição e categoria',
            component: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Nome do Produto"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        error={errors.name}
                        placeholder="Digite o nome do produto"
                    />

                    <Input
                        label="Código do Produto"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        error={errors.code}
                        placeholder="PRD001"
                        helpText="Código único do produto"
                    />

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descrição detalhada do produto..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={4}
                        />
                    </div>

                    <Select
                        label="Categoria"
                        required
                        options={categories}
                        value={String(formData.categoryId)}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                        placeholder="Selecione uma categoria"
                    />

                    <Input
                        label="Código de Barras"
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        placeholder="7891234567890"
                        leftIcon={Barcode}
                    />
                </div>
            )
        },
        {
            id: 'pricing',
            title: 'Precificação',
            description: 'Custo, venda e margem calculada',
            component: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preço de Venda *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Margem Calculada
                        </label>
                        <div className="h-10 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg flex items-center">
                            <span className="text-gray-600">15%</span>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                            Produto ativo
                        </label>
                    </div>
                </div>
            )
        },
        {
            id: 'inventory',
            title: 'Estoque',
            description: 'Quantidade, mínimo, localização',
            component: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        label="Quantidade Inicial"
                        type="number"
                        value={String(formData.initialStock)}
                        onChange={(e) => setFormData(prev => ({ ...prev, initialStock: Number(e.target.value) }))}
                        placeholder="0"
                    />

                    <Input
                        label="Estoque Mínimo"
                        type="number"
                        value={String(formData.minStock)}
                        onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                        placeholder="10"
                    />

                    <Input
                        label="Estoque Máximo"
                        type="number"
                        value={String(formData.maxStock || '')}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value ? Number(e.target.value) : null }))}
                        placeholder="1000"
                    />

                    <div className="md:col-span-3">
                        <Input
                            label="Localização no Estoque"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Ex: Prateleira A-1, Depósito 2"
                        />
                    </div>
                </div>
            )
        },
        {
            id: 'images',
            title: 'Imagens',
            description: 'Upload drag-and-drop com preview',
            component: (
                <ProductImageUploader
                    onImagesChange={(images) => console.log('Images:', images)}
                    maxImages={5}
                    maxSizePerImage={5} // MB
                />
            )
        },
        {
            id: 'supplier',
            title: 'Fornecedor',
            description: 'Seleção e dados de compra',
            component: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Fornecedor"
                        options={[{ value: '', label: 'Nenhum fornecedor' }, ...suppliers]}
                        value={String(formData.supplierId || '')}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value ? Number(e.target.value) : null }))}
                        placeholder="Selecione um fornecedor"
                    />

                    <Input
                        label="Código do Fornecedor"
                        placeholder="Código do produto no fornecedor"
                        disabled={!formData.supplierId}
                    />
                </div>
            )
        }
    ];

    // Validação por step antes de avançar
    const isStepValid = (stepIndex: number) => {
        switch (stepIndex) {
            case 0: // Basic info
                return formData.name && formData.code && formData.categoryId;
            case 1: // Pricing
                return formData.price > 0;
            case 2: // Inventory
                return formData.initialStock >= 0 && formData.minStock >= 0;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (mode === 'create') {
            onSubmit(formData as CreateProductRequest);
        } else {
            const { initialStock, minStock, maxStock, location, ...updateData } = formData;
            onSubmit(updateData as UpdateProductRequest);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Novo Produto' : 'Editar Produto'}
                </h2>
                <p className="text-gray-600 mt-2">
                    {mode === 'create'
                        ? 'Preencha as informações para criar um novo produto'
                        : 'Atualize as informações do produto'
                    }
                </p>
            </div>

            {/* Steps Navigation */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                                    index <= currentStep
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-500'
                                }`}
                            >
                                {index < currentStep ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`w-16 h-1 mx-4 ${
                                    index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h3>
                    <p className="text-gray-600">{steps[currentStep].description}</p>
                </div>

                {steps[currentStep].component}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="secondary"
                    onClick={currentStep === 0 ? onCancel : handlePrevious}
                    disabled={loading}
                    leftIcon={currentStep === 0 ? undefined : ChevronLeft}
                >
                    {currentStep === 0 ? 'Cancelar' : 'Anterior'}
                </Button>

                <div className="text-center text-sm text-gray-500">
                    Passo {currentStep + 1} de {steps.length}
                </div>

                {currentStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!isStepValid(currentStep)}
                    >
                        {mode === 'create' ? 'Criar Produto' : 'Salvar Alterações'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        rightIcon={ChevronRight}
                    >
                        Próximo
                    </Button>
                )}
            </div>
        </div>
    );
};