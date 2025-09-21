// components/suppliers/supplier-contact-card.tsx
'use client'

import { useState } from 'react'
import {
    Phone,
    Mail,
    Globe,
    MapPin,
    User,
    Edit2,
    Save,
    X,
    MessageSquare,
    ExternalLink,
    Building2,
    FileText
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SupplierResponse } from '@/types/supplier'
import {formatCEP, formatPhone} from "@/lib/validations/suppliers";
import {formatCNPJ} from "@/types/customer";


interface SupplierContactCardProps {
    supplier: SupplierResponse
    onUpdate?: (data: any) => void
    editable?: boolean
}

export function SupplierContactCard({
                                        supplier,
                                        onUpdate,
                                        editable = false
                                    }: SupplierContactCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || ''
    })

    const handleEdit = () => {
        setIsEditing(true)
        setEditData({
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            website: supplier.website || ''
        })
    }

    const handleSave = () => {
        onUpdate?.(editData)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditData({
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            website: supplier.website || ''
        })
    }

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhone(value.replace(/\D/g, ''))
        setEditData({ ...editData, phone: formatted })
    }

    const openWhatsApp = () => {
        if (supplier.phone) {
            const number = supplier.phone.replace(/\D/g, '')
            window.open(`https://wa.me/55${number}`, '_blank')
        }
    }

    const openEmail = () => {
        if (supplier.email) {
            window.location.href = `mailto:${supplier.email}`
        }
    }

    const openWebsite = () => {
        if (supplier.website) {
            window.open(supplier.website, '_blank')
        }
    }

    return (
        <div className="space-y-4">
            {/* Card Principal de Contato */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Informações de Contato</CardTitle>
                                <CardDescription>Dados de contato do fornecedor</CardDescription>
                            </div>
                        </div>
                        {editable && !isEditing && (
                            <Button size="sm" variant="outline" onClick={handleEdit}>
                                <Edit2 className="mr-2 h-3 w-3" />
                                Editar
                            </Button>
                        )}
                        {isEditing && (
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSave}>
                                    <Save className="mr-2 h-3 w-3" />
                                    Salvar
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                    <X className="mr-2 h-3 w-3" />
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Pessoa de Contato */}
                    {(supplier.contactPerson || isEditing) && (
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                                <div className="flex-1">
                                    <Label htmlFor="contactPerson" className="sr-only">
                                        Pessoa de Contato
                                    </Label>
                                    <Input
                                        id="contactPerson"
                                        value={editData.contactPerson}
                                        onChange={(e) => setEditData({ ...editData, contactPerson: e.target.value })}
                                        placeholder="Nome do contato principal"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Contato Principal</p>
                                    <p className="font-medium">{supplier.contactPerson}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    {(supplier.email || isEditing) && (
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                                <div className="flex-1">
                                    <Label htmlFor="email" className="sr-only">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        placeholder="email@empresa.com"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{supplier.email}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={openEmail}
                                    >
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Telefone */}
                    {(supplier.phone || isEditing) && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                                <div className="flex-1">
                                    <Label htmlFor="phone" className="sr-only">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={editData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="(00) 0000-0000"
                                        maxLength={15}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telefone</p>
                                        <p className="font-medium">{formatPhone(supplier.phone)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.location.href = `tel:${supplier.phone}`}
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={openWhatsApp}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Website */}
                    {(supplier.website || isEditing) && (
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {isEditing ? (
                                <div className="flex-1">
                                    <Label htmlFor="website" className="sr-only">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={editData.website}
                                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                        placeholder="https://www.empresa.com"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Website</p>
                                        <p className="font-medium truncate">{supplier.website}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={openWebsite}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {!supplier.contactPerson && !supplier.email && !supplier.phone && !supplier.website && !isEditing && (
                        <p className="text-center text-muted-foreground py-4">
                            Nenhuma informação de contato cadastrada
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Card de Endereço */}
            {(supplier.address || supplier.city || supplier.state || supplier.zipCode) && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Endereço</CardTitle>
                                <CardDescription>Localização do fornecedor</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {supplier.address && (
                            <div>
                                <p className="text-sm text-muted-foreground">Endereço</p>
                                <p className="font-medium">{supplier.address}</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {supplier.city && (
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Cidade</p>
                                    <p className="font-medium">{supplier.city}</p>
                                </div>
                            )}

                            {supplier.state && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Estado</p>
                                    <p className="font-medium">{supplier.state}</p>
                                </div>
                            )}
                        </div>

                        {supplier.zipCode && (
                            <div>
                                <p className="text-sm text-muted-foreground">CEP</p>
                                <p className="font-medium">{formatCEP(supplier.zipCode)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Card de Informações Empresariais */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Informações Empresariais</CardTitle>
                            <CardDescription>Dados da empresa</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Razão Social</p>
                            <p className="font-medium">{supplier.name}</p>
                        </div>
                        <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                            {supplier.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>

                    {supplier.cnpj && (
                        <div>
                            <p className="text-sm text-muted-foreground">CNPJ</p>
                            <p className="font-medium">{formatCNPJ(supplier.cnpj)}</p>
                        </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Cadastrado em</p>
                            <p className="font-medium">
                                {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Última atualização</p>
                            <p className="font-medium">
                                {new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card de Observações */}
            {supplier.notes && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Observações</CardTitle>
                                <CardDescription>Notas sobre o fornecedor</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}