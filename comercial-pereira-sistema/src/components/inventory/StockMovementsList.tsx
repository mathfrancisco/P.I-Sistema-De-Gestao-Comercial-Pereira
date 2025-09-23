import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Clock, User } from 'lucide-react';
import { MovementResponse, MovementType } from '@/types/inventory';
import { formatDateTime } from '@/lib/utils/formatDate';


interface StockMovementsListProps {
    movements: MovementResponse[];
    onLoadMore?: () => void;
    hasMore?: boolean;
}

export const StockMovementsList: React.FC<StockMovementsListProps> = ({
                                                                          movements,
                                                                          onLoadMore,
                                                                          hasMore = false
                                                                      }) => {
    const getMovementIcon = (type: MovementType) => {
        switch (type) {
            case MovementType.IN:
                return <ArrowUpCircle className="h-5 w-5 text-green-600" />;
            case MovementType.OUT:
                return <ArrowDownCircle className="h-5 w-5 text-red-600" />;
            case MovementType.ADJUSTMENT:
                return <RefreshCw className="h-5 w-5 text-blue-600" />;
        }
    };

    const getMovementColor = (type: MovementType) => {
        switch (type) {
            case MovementType.IN:
                return 'text-green-600 bg-green-50';
            case MovementType.OUT:
                return 'text-red-600 bg-red-50';
            case MovementType.ADJUSTMENT:
                return 'text-blue-600 bg-blue-50';
        }
    };

    const getMovementLabel = (type: MovementType) => {
        switch (type) {
            case MovementType.IN:
                return 'Entrada';
            case MovementType.OUT:
                return 'Saída';
            case MovementType.ADJUSTMENT:
                return 'Ajuste';
        }
    };

    return (
        <ScrollArea className="h-[600px]">
            <div className="space-y-3 p-1">
                {movements.map((movement) => (
                    <Card key={movement.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${getMovementColor(movement.type as MovementType)}`}>
                                        {getMovementIcon(movement.type as MovementType)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-medium">{movement.product.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Código: {movement.product.code}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                      <span className={`font-semibold ${
                          movement.type === MovementType.IN ? 'text-green-600' :
                              movement.type === MovementType.OUT ? 'text-red-600' :
                                  'text-blue-600'
                      }`}>
                        {movement.type === MovementType.IN ? '+' :
                            movement.type === MovementType.OUT ? '-' : ''}
                          {movement.quantity} unidades
                      </span>
                                            {movement.reason && (
                                                <span className="text-muted-foreground">
                          {movement.reason}
                        </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                          {formatDateTime(movement.createdAt)}
                      </span>
                                            {movement.user && (
                                                <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                                                    {movement.user.name}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline">{getMovementLabel(movement.type as MovementType)}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {hasMore && (
                    <div className="flex justify-center py-4">
                        <Button variant="outline" onClick={onLoadMore}>
                            Carregar mais
                        </Button>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};
