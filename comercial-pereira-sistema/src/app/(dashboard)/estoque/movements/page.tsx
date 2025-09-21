"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import {
  Search,
  Filter,
  RefreshCw,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw,
} from "lucide-react";

import { MovementType, MovementFilters } from "@/types/inventory";
import { DateRange } from "react-day-picker";
import { useStockMovements } from "@/lib/hooks/useStockMovements";
import { StockMovementsList } from "@/components/inventory/StockMovementsList";

export default function StockMovementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movementType, setMovementType] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filters: MovementFilters = {
    productId: searchTerm ? undefined : undefined, // Implementar busca por produto
    type: movementType as MovementType | "ALL",
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
    page: 1,
    limit: 20,
  };

  const { movements, pagination, isLoading, refetch, updateFilters } =
    useStockMovements(filters);

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      updateFilters({ page: (pagination.page || 1) + 1 });
    }
  };

  const handleExport = () => {
    // Implementar exportação de movimentações
    console.log("Exportar movimentações");
  };

  // Estatísticas das movimentações
  const stats = {
    total: movements.length,
    entries: movements.filter((m) => m.type === MovementType.IN).length,
    exits: movements.filter((m) => m.type === MovementType.OUT).length,
    adjustments: movements.filter((m) => m.type === MovementType.ADJUSTMENT)
      .length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
          <p className="text-muted-foreground">
            Histórico de entradas, saídas e ajustes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <RefreshCcw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.entries}
                </p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-600">{stats.exits}</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ajustes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.adjustments}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={movementType} onValueChange={setMovementType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Tipos</SelectItem>
                <SelectItem value={MovementType.IN}>Entradas</SelectItem>
                <SelectItem value={MovementType.OUT}>Saídas</SelectItem>
                <SelectItem value={MovementType.ADJUSTMENT}>Ajustes</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <StockMovementsList
            movements={movements}
            onLoadMore={handleLoadMore}
            hasMore={pagination?.hasNext}
          />
        </CardContent>
      </Card>
    </div>
  );
}
