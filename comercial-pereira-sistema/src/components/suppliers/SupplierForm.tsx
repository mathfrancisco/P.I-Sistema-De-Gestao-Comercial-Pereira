// components/suppliers/supplier-form.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    ChevronDown,
    ChevronUp,
    Save,
    X,
    Building2,
    User,
    MapPin,
    Globe,
    FileText
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    CreateSupplierRequest,
    UpdateSupplierRequest,
    SupplierResponse,
    BRAZIL_STATES,
    STATE_NAMES,
    SUPPLIER_CONSTRAINTS
} from '@/types/supplier'
import {useSuppliers} from "@/lib/hooks/useSuppliers";
import {formatCEP, formatCNPJ, formatPhone} from "@/lib/validations/suppliers";


// Schema de validação
const supplierFormSchema = z.object({
    name: z.string()
        .min(SUPPLIER_CONSTRAINTS.NAME_MIN_LENGTH, 'Nome deve ter no mínimo 3 caracteres')
        .max(SUPPLIER_CONSTRAINTS.NAME_MAX_LENGTH, 'Nome muito longo'),
    contactPerson: z.string().optional().nullable(),
    email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    cnpj: z.string().optional().nullable(),
    website: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
    notes: z.string().max(SUPPLIER_CONSTRAINTS.NOTES_MAX_LENGTH, 'Notas muito longas').optional().nullable(),
    isActive: z.boolean().default(true)
})

type SupplierFormData = z.infer<typeof supplierFormSchema>

interface SupplierFormProps {
    supplier?: SupplierResponse | null
    mode: 'create' | 'edit'
    onSuccess?: () => void
    onCancel?: () => void
}

export function SupplierForm({
                                 supplier,
                                 mode = 'create',
                                 onSuccess,
                                 onCancel
                             }: SupplierFormProps) {
    const router = useRouter()
    const { createSupplier, updateSupplier, isCreating, isUpdating } = useSuppliers()
    const [openSections, setOpenSections] = useState({
        business: true,
        contact: true,
        address: false,
        commercial: false,
        notes: false
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        watch,
        reset
    } = useForm<SupplierFormData>({
        resolver: zodResolver(supplierFormSchema),
        defaultValues: {
            name: '',
            contactPerson: null,
            email: null,
            phone: null,
            address: null,
            city: null,
            state: null,
            zipCode: null,
            cnpj: null,
            website: null,
            notes: null,
            isActive: true
        }
    })

    const isActive = watch('isActive')

    useEffect(() => {
        if (supplier && mode === 'edit') {
            reset({
                name: supplier.name,
                contactPerson: supplier.contactPerson,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                city: supplier.city,
                state: supplier.state,
                zipCode: supplier.zipCode,
                cnpj: supplier.cnpj,
                website: supplier.website,
                notes: supplier.notes,
                isActive: supplier.isActive
            })
        }
    }, [supplier, mode, reset])

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const onSubmit = async (data: SupplierFormData) => {
        const supplierData = {
            ...data,
            email: data.email || null,
            phone: data.phone || null,
            website: data.website || null,
            cnpj: data.cnpj || null
        }

        if (mode === 'create') {
            createSupplier(supplierData as CreateSupplierRequest, {
                onSuccess: () => {
                    onSuccess?.()
                    router.push('/suppliers')
                }
            })
        } else if (supplier) {
            updateSupplier(
                { id: supplier.id, data: supplierData as UpdateSupplierRequest },
                {
                    onSuccess: () => {
                        onSuccess?.()
                        router.push('/suppliers')
                    }
                }
            )
        }
    }

    const handleCancel = () => {
        onCancel?.()
        router.push('/suppliers')
    }

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        const formatted = formatCNPJ(value)
        setValue('cnpj', formatted, { shouldValidate: true })
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        const formatted = formatPhone(value)
        setValue('phone', formatted, { shouldValidate: true })
    }

    const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        const formatted = formatCEP(value)
        setValue('zipCode', formatted, { shouldValidate: true })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>
                                    {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
                                </CardTitle>
                                <CardDescription>
                                    {mode === 'create'
                                        ? 'Preencha as informações do novo fornecedor'
                                        : 'Atualize as informações do fornecedor'
                                    }
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Section 1: Dados Empresariais */}
            <Card>
                <Collapsible open={openSections.business} onOpenChange={() => toggleSection('business')}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    <CardTitle className="text-lg">Dados Empresariais</CardTitle>
                                </div>
                                {openSections.business ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome da Empresa *</Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="Nome do fornecedor"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input
                                        id="cnpj"
                                        value={watch('cnpj') || ''}
                                        onChange={handleCNPJChange}
                                        placeholder="00.000.000/0000-00"
                                        maxLength={18}
                                    />
                                    {errors.cnpj && (
                                        <p className="text-sm text-red-500 mt-1">{errors.cnpj.message}</p>
                                    )}
                                </div>

                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="isActive">Status do Fornecedor</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Fornecedor {isActive ? 'ativo' : 'inativo'}
                                        </p>
                                    </div>
                                    <Switch
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setValue('isActive', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Section 2: Contatos */}
            <Card>
                <Collapsible open={openSections.contact} onOpenChange={() => toggleSection('contact')}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <CardTitle className="text-lg">Informações de Contato</CardTitle>
                                </div>
                                {openSections.contact ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="contactPerson">Pessoa de Contato</Label>
                                <Input
                                    id="contactPerson"
                                    {...register('contactPerson')}
                                    placeholder="Nome do responsável"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={watch('phone') || ''}
                                        onChange={handlePhoneChange}
                                        placeholder="(00) 0000-0000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        placeholder="email@empresa.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Section 3: Endereço */}
            <Card>
                <Collapsible open={openSections.address} onOpenChange={() => toggleSection('address')}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    <CardTitle className="text-lg">Endereço</CardTitle>
                                </div>
                                {openSections.address ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="address">Endereço</Label>
                                <Input
                                    id="address"
                                    {...register('address')}
                                    placeholder="Rua, número, complemento"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        {...register('city')}
                                        placeholder="Cidade"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="state">Estado</Label>
                                    <Select
                                        value={watch('state') || ''}
                                        onValueChange={(value) => setValue('state', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BRAZIL_STATES.map(state => (
                                                <SelectItem key={state} value={state}>
                                                    {STATE_NAMES[state]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="zipCode">CEP</Label>
                                    <Input
                                        id="zipCode"
                                        value={watch('zipCode') || ''}
                                        onChange={handleCEPChange}
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Section 4: Informações Comerciais */}
            <Card>
                <Collapsible open={openSections.commercial} onOpenChange={() => toggleSection('commercial')}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    <CardTitle className="text-lg">Informações Comerciais</CardTitle>
                                </div>
                                {openSections.commercial ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    {...register('website')}
                                    placeholder="https://www.empresa.com"
                                />
                                {errors.website && (
                                    <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Section 5: Observações */}
            <Card>
                <Collapsible open={openSections.notes} onOpenChange={() => toggleSection('notes')}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    <CardTitle className="text-lg">Observações</CardTitle>
                                </div>
                                {openSections.notes ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <Textarea
                                {...register('notes')}
                                placeholder="Observações sobre o fornecedor..."
                                rows={4}
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isCreating || isUpdating || !isDirty}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Criar Fornecedor' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    )
}