import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X } from 'lucide-react';
import { InventoryResponse } from '@/types/inventory';
import { formatDateTime } from '@/lib/utils/formatDate';


interface StockTableProps {
    inventory: InventoryResponse[];
    onUpdate?: (id: number, quantity: number) => void;
    onAdjust?: (productId: number) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
                                                          inventory,
                                                          onUpdate,
                                                          onAdjust
                                                      }) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const getStatusBadge = (quantity: number, minStock: number) => {
        if (quantity === 0) {
            return <Badge variant="destructive">Sem Estoque</Badge>;
        }
        if (quantity <= minStock) {
            return <Badge variant="warning">Estoque Baixo</Badge>;
        }
        return <Badge variant="success">Normal</Badge>;
    };

    const getProgressColor = (quantity: number, minStock: number, maxStock?: number | null) => {
        if (quantity === 0) return 'bg-red-500';
        if (quantity <= minStock) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const calculateProgress = (quantity: number, maxStock?: number | null) => {
        if (!maxStock) return 0;
        return Math.min((quantity / maxStock) * 100, 100);
    };

    const handleEdit = (item: InventoryResponse) => {
        setEditingId(item.id);
        setEditValue(item.quantity.toString());
    };

    const handleSave = (id: number) => {
        const newQuantity = parseInt(editValue);
        if (!isNaN(newQuantity) && newQuantity >= 0 && onUpdate) {
            onUpdate(id, newQuantity);
        }
        setEditingId(null);
        setEditValue('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Mín/Máx</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead>Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inventory.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.product.code}</TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>
                            {editingId === item.id ? (
                                <div className="flex items-center gap-2 max-w-[120px]">
                                    <Input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-8"
                                        min="0"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => handleSave(item.id)}
                                    >
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={handleCancel}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>{item.quantity}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                        <TableCell>
              <span className="text-sm text-muted-foreground">
                {item.minStock}/{item.maxStock || '-'}
              </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.quantity, item.minStock)}</TableCell>
                        <TableCell className="w-[200px]">
                            <div className="space-y-1">
                                <Progress
                                    value={calculateProgress(item.quantity, item.maxStock)}
                                    className="h-2"
                                />
                                <span className="text-xs text-muted-foreground">
                  {item.maxStock ? `${calculateProgress(item.quantity, item.maxStock).toFixed(0)}%` : 'N/A'}
                </span>
                            </div>
                        </TableCell>
                        <TableCell>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(item.lastUpdate)}
              </span>
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAdjust?.(item.productId)}
                            >
                                Ajustar
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};