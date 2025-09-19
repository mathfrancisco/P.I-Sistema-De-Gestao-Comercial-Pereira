import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { StockAdjustmentRequest } from '@/types/inventory';

const adjustmentReasons = [
    { value: 'INVENTORY_COUNT', label: 'Contagem de Inventário' },
    { value: 'DAMAGE', label: 'Produto Danificado' },
    { value: 'EXPIRY', label: 'Produto Vencido' },
    { value: 'RETURN', label: 'Devolução' },
    { value: 'CORRECTION', label: 'Correção de Sistema' },
    { value: 'OTHER', label: 'Outro' }
];

const formSchema = z.object({
    productId: z.number().min(1, 'Selecione um produto'),
    quantity: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
    reason: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres'),
    notes: z.string().optional()
});

interface StockAdjustmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: StockAdjustmentRequest) => void;
    productId?: number | null;
    currentStock?: number;
    productName?: string;
}

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSubmit,
                                                                            productId,
                                                                            currentStock = 0,
                                                                            productName
                                                                        }) => {
    const [confirmStep, setConfirmStep] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productId: productId || 0,
            quantity: currentStock,
            reason: '',
            notes: ''
        }
    });

    React.useEffect(() => {
        if (productId) {
            form.setValue('productId', productId);
        }
    }, [productId, form]);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!confirmStep) {
            setConfirmStep(true);
            return;
        }

        const adjustmentData: StockAdjustmentRequest = {
            productId: values.productId,
            quantity: values.quantity,
            reason: values.notes ? `${values.reason}: ${values.notes}` : values.reason
        };

        onSubmit(adjustmentData);
        handleClose();
    };

    const handleClose = () => {
        form.reset();
        setConfirmStep(false);
        onClose();
    };

    const quantityDiff = form.watch('quantity') - currentStock;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajuste de Estoque</DialogTitle>
                    <DialogDescription>
                        {productName ? `Ajustando estoque de: ${productName}` : 'Realize ajustes manuais no estoque'}
                    </DialogDescription>
                </DialogHeader>

                {confirmStep ? (
                    <div className="space-y-4">
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold mb-2">Confirme o ajuste:</p>
                                <p>Produto: {productName}</p>
                                <p>Estoque atual: {currentStock} unidades</p>
                                <p>Novo estoque: {form.getValues('quantity')} unidades</p>
                                <p className={`font-semibold ${quantityDiff > 0 ? 'text-green-600' : quantityDiff < 0 ? 'text-red-600' : ''}`}>
                                    Diferença: {quantityDiff > 0 ? '+' : ''}{quantityDiff} unidades
                                </p>
                                <p className="mt-2">Motivo: {form.getValues('reason')}</p>
                            </AlertDescription>
                        </Alert>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmStep(false)}>
                                Voltar
                            </Button>
                            <Button onClick={form.handleSubmit(handleSubmit)}>
                                Confirmar Ajuste
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">
                                    Estoque atual: <span className="font-semibold">{currentStock} unidades</span>
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nova Quantidade</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        {quantityDiff !== 0 && (
                                            <FormDescription className={quantityDiff > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {quantityDiff > 0 ? '+' : ''}{quantityDiff} unidades
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivo do Ajuste</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o motivo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {adjustmentReasons.map(reason => (
                                                    <SelectItem key={reason.value} value={reason.value}>
                                                        {reason.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações (Opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Adicione detalhes sobre o ajuste..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Continuar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
};