// components/products/ProductTable.tsx
import React, { useState } from "react";
import { Package, Eye, Edit, Copy, Trash2, MoreVertical } from "lucide-react";
import { DataTable } from "@/components/layout/data-table";
import { Skeleton } from "@/components/ui/loading";
import { EmptyState } from "@/components/layout/feedback";
import type { ProductResponse, ProductFilters } from "@/types/product";

interface ProductTableProps {
  products: ProductResponse[];
  loading?: boolean;
  selectedProducts?: number[];
  onSelectProduct?: (id: number) => void;
  onSelectAll?: (selectAll: boolean) => void;
  onEditProduct: (product: ProductResponse) => void;
  onDeleteProduct: (product: ProductResponse) => void;
  onViewProduct: (product: ProductResponse) => void;
  onDuplicateProduct: (product: ProductResponse) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
  };
  // Fixed: Use the specific type from ProductFilters instead of generic string
  onSort?: (
    column: ProductFilters["sortBy"],
    direction: "asc" | "desc"
  ) => void;
  sortColumn?: ProductFilters["sortBy"];
  sortDirection?: "asc" | "desc";
  configurableColumns?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  selectedProducts = [],
  onSelectProduct,
  onSelectAll,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
  onDuplicateProduct,
  pagination,
  onSort,
  sortColumn,
  sortDirection,
  configurableColumns = true,
}) => {
  const [editingCell, setEditingCell] = useState<{
    productId: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleInlineEdit = (
    product: ProductResponse,
    field: string,
    value: string
  ) => {
    setEditingCell({ productId: product.id, field });
    setEditValue(value);
  };

  const saveInlineEdit = () => {
    if (editingCell) {
      // Aqui implementaria a lógica de salvar a edição inline
      console.log("Saving inline edit:", editingCell, editValue);
      setEditingCell(null);
      setEditValue("");
    }
  };

  const getAvailabilityBadge = (product: ProductResponse) => {
    if (!product.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Inativo
        </span>
      );
    }

    if (!product.inventory) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Sem estoque
        </span>
      );
    }

    const { quantity, minStock } = product.inventory;
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Esgotado
        </span>
      );
    } else if (quantity <= minStock) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Baixo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Disponível
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton width="40px" height="40px" className="rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton height="16px" width="33%" />
                <Skeleton height="12px" width="50%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Não há produtos que correspondam aos filtros aplicados."
        />
      </div>
    );
  }

  const tableData = products.map((product) => ({
    id: String(product.id),
    product: (
      <div className="flex items-center space-x-3">
        {/* Imagem thumbnail (40px) na primeira coluna */}
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-purple-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-sm text-gray-500">{product.code}</p>
        </div>
      </div>
    ),
    category: product.category.name,
    price: (
      <div
        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() =>
          handleInlineEdit(product, "price", String(product.price))
        }
      >
        {editingCell?.productId === product.id &&
        editingCell.field === "price" ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveInlineEdit}
            onKeyPress={(e) => e.key === "Enter" && saveInlineEdit()}
            className="w-20 px-2 py-1 border border-blue-300 rounded text-sm"
            autoFocus
          />
        ) : (
          <span className="font-medium">
            R$ {new Intl.NumberFormat("pt-BR").format(product.price)}
          </span>
        )}
      </div>
    ),
    stock: (
      <div
        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() =>
          handleInlineEdit(
            product,
            "stock",
            String(product.inventory?.quantity || 0)
          )
        }
      >
        {editingCell?.productId === product.id &&
        editingCell.field === "stock" ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveInlineEdit}
            onKeyPress={(e) => e.key === "Enter" && saveInlineEdit()}
            className="w-16 px-2 py-1 border border-blue-300 rounded text-sm"
            autoFocus
          />
        ) : (
          <span>{product.inventory?.quantity || 0}</span>
        )}
      </div>
    ),
    status: getAvailabilityBadge(product),
    supplier: product.supplier?.name || "Não informado",
    actions: (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewProduct(product)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Visualizar"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEditProduct(product)}
          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDuplicateProduct(product)}
          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
          title="Duplicar"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeleteProduct(product)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {/* Actions menu com três pontos na última coluna */}
        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    ),
  }));

  // DataTable responsiva com colunas configuráveis
  const tableColumns = [
    { key: "product", label: "Produto", sortable: true },
    { key: "category", label: "Categoria", sortable: true },
    { key: "price", label: "Preço", sortable: true, align: "right" as const },
    {
      key: "stock",
      label: "Estoque",
      sortable: true,
      align: "center" as const,
    },
    { key: "status", label: "Status", sortable: true },
    { key: "supplier", label: "Fornecedor", sortable: true },
    { key: "actions", label: "Ações" },
  ];

  // Create a mapping function to convert DataTable column keys to ProductFilters sortBy values
  const mapColumnToSortBy = (column: string): ProductFilters["sortBy"] => {
    const columnMap: Record<string, ProductFilters["sortBy"]> = {
      product: "name",
      category: "categoryName",
      price: "price",
      stock: "stock",
      supplier: "supplierName",
    };
    return columnMap[column] || "name";
  };

  const handleSort = (column: string, direction: "asc" | "desc") => {
    const sortBy = mapColumnToSortBy(column);
    onSort?.(sortBy, direction);
  };

  return (
    <DataTable
      columns={tableColumns}
      data={tableData}
      selectable={!!onSelectProduct}
      selectedRows={selectedProducts.map(String)}
      onSelectRow={(id: any) => onSelectProduct?.(Number(id))}
      onSelectAll={onSelectAll}
      onSort={handleSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      pagination={pagination}
    />
  );
};
