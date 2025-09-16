import React, { useState, ReactNode } from 'react';
import {TrendingUp, TrendingDown
} from 'lucide-react';
import {cn} from "@/lib/utils/utils";

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
}

interface TableRow {
    id: string;
    [key: string]: any;
}

interface DataTableProps {
    columns: TableColumn[];
    data: TableRow[];
    loading?: boolean;
    selectable?: boolean;
    selectedRows?: string[];
    onSelectRow?: (id: string) => void;
    onSelectAll?: (selectAll: boolean) => void;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    actions?: (row: TableRow) => ReactNode;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        onPageChange: (page: number) => void;
        onItemsPerPageChange: (items: number) => void;
    };
}

export const DataTable: React.FC<DataTableProps> = ({
                                                        columns,
                                                        data,
                                                        loading = false,
                                                        selectable = false,
                                                        selectedRows = [],
                                                        onSelectRow,
                                                        onSelectAll,
                                                        onSort,
                                                        sortColumn,
                                                        sortDirection,
                                                        actions,
                                                        pagination
                                                    }) => {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const handleSort = (columnKey: string) => {
        if (!onSort) return;

        const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(columnKey, newDirection);
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortColumn !== columnKey) {
            return <TrendingUp className="w-4 h-4 text-gray-300" />;
        }
        return sortDirection === 'asc' ?
            <TrendingUp className="w-4 h-4 text-blue-600" /> :
            <TrendingDown className="w-4 h-4 text-blue-600" />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex space-x-4 mb-4">
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        {selectable && (
                            <th className="w-12 px-6 py-4">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === data.length && data.length > 0}
                                    onChange={(e) => onSelectAll?.(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                        )}
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                    column.align === 'center' && 'text-center',
                                    column.align === 'right' && 'text-right',
                                    column.sortable && 'cursor-pointer hover:text-gray-700'
                                )}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>{column.label}</span>
                                    {column.sortable && renderSortIcon(column.key)}
                                </div>
                            </th>
                        ))}
                        {actions && <th className="w-20 px-6 py-4"></th>}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row) => (
                        <tr
                            key={row.id}
                            className={cn(
                                'hover:bg-gray-50 transition-colors',
                                hoveredRow === row.id && 'bg-gray-50'
                            )}
                            onMouseEnter={() => setHoveredRow(row.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                        >
                            {selectable && (
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(row.id)}
                                        onChange={() => onSelectRow?.(row.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                            )}
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right'
                                    )}
                                >
                                    {row[column.key]}
                                </td>
                            ))}
                            {actions && (
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {actions(row)}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} até{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                {pagination.totalItems} resultados
            </span>
                        <select
                            value={pagination.itemsPerPage}
                            onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value={10}>10 por página</option>
                            <option value={25}>25 por página</option>
                            <option value={50}>50 por página</option>
                            <option value={100}>100 por página</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};