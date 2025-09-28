import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Checkbox,
    IconButton,
    Typography,
    Tooltip,
    Box,
    TableSortLabel,
    CircularProgress,
    Alert,
    Card,
    Stack,
} from "@mui/material";

interface Column<T> {
    id: keyof T | string;
    label: string;
    numeric?: boolean;
    format?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string | number;
}

interface DataTableProps<T extends { id: string | number }> {
    columns: Column<T>[];
    rows: T[];
    loading?: boolean;
    error?: string | null;
    page: number;
    rowsPerPage: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (size: number) => void;
    onSort?: (column: string) => void;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    selectable?: boolean;
    selectedRows?: T[];
    onSelectRow?: (row: T) => void;
    onSelectAll?: (rows: T[]) => void;
    actions?: Array<{
        icon: React.ReactNode;
        label: string;
        onClick: (row: T) => void;
        color?:
            | "default"
            | "primary"
            | "secondary"
            | "error"
            | "info"
            | "success"
            | "warning";
        show?: (row: T) => boolean;
    }>;
    getRowId: (row: T) => string | number;
    emptyMessage?: string;
    title?: string;
    toolbarActions?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  loading = false,
  error = null,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  sortBy,
  sortOrder = "asc",
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  actions = [],
  getRowId,
  emptyMessage = "Nenhum registro encontrado",
  title,
  toolbarActions,
}: DataTableProps<T>) {
  const isSelected = (row: T) => {
    const rowId = getRowId(row);
    return selectedRows.some((r) => getRowId(r) === rowId);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && onSelectAll) {
      onSelectAll(rows);
    } else if (onSelectAll) {
      onSelectAll([]);
    }
  };

  const handleSelectRow = (row: T) => {
    if (onSelectRow) {
      onSelectRow(row);
    }
  };

  const getValue = (row: T, columnId: string) => {
    const keys = columnId.split(".");
    let value: any = row;

    for (const key of keys) {
      value = value?.[key];
    }

    return value;
  };

  return (
    <Card 
      sx={{ 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        border: '1px solid #E2E8F0',
        backgroundColor: 'white'
      }}
    >
      {(title || toolbarActions || selectedRows.length > 0) && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: selectedRows.length > 0 ? '#F0F4FF' : 'white',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {selectedRows.length > 0 ? (
            <Typography
              sx={{ color: '#4F46E5', fontWeight: 600 }}
              variant="subtitle1"
              component="div"
            >
              {selectedRows.length} selecionado(s)
            </Typography>
          ) : (
            <Typography
              sx={{ color: '#1E293B', fontWeight: 600 }}
              variant="h6"
              component="div"
            >
              {title || 'Dados'}
            </Typography>
          )}

          <Box>{toolbarActions}</Box>
        </Box>
      )}

      <TableContainer>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress sx={{ color: '#4F46E5' }} />
          </Box>
        )}

        {error && (
          <Box p={3}>
            <Alert 
              severity="error"
              sx={{
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
              }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      sx={{
                        color: '#9CA3AF',
                        '&.Mui-checked': {
                          color: '#4F46E5',
                        },
                      }}
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < rows.length
                      }
                      checked={
                        rows.length > 0 && selectedRows.length === rows.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}

                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.numeric ? "right" : "left"}
                    style={{ width: column.width }}
                    sx={{
                      fontWeight: 600,
                      color: '#64748B',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {column.sortable !== false && onSort ? (
                      <TableSortLabel
                        active={sortBy === column.id}
                        direction={sortBy === column.id ? sortOrder : "asc"}
                        onClick={() => onSort(String(column.id))}
                        sx={{
                          '&.MuiTableSortLabel-active': {
                            color: '#4F46E5',
                          },
                          '&:hover': {
                            color: '#4F46E5',
                          },
                          '& .MuiTableSortLabel-icon': {
                            color: '#4F46E5 !important',
                          },
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}

                {actions.length > 0 && (
                  <TableCell 
                    align="center" 
                    width={actions.length * 50}
                    sx={{
                      fontWeight: 600,
                      color: '#64748B',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Ações
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (actions.length > 0 ? 1 : 0)
                    }
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography variant="body1" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => {
                  const rowId = getRowId(row);
                  const selected = isSelected(row);

                  return (
                    <TableRow
                      key={rowId}
                      hover
                      selected={selected}
                      role={selectable ? "checkbox" : undefined}
                      aria-checked={selected}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#F8FAFC',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#F0F4FF',
                          '&:hover': {
                            backgroundColor: '#E0E7FF',
                          },
                        },
                        borderBottom: index === rows.length - 1 ? 'none' : '1px solid #F1F5F9',
                      }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            sx={{
                              color: '#9CA3AF',
                              '&.Mui-checked': {
                                color: '#4F46E5',
                              },
                            }}
                            checked={selected}
                            onChange={() => handleSelectRow(row)}
                          />
                        </TableCell>
                      )}

                      {columns.map((column) => {
                        const value = getValue(row, String(column.id));

                        return (
                          <TableCell
                            key={String(column.id)}
                            align={column.numeric ? "right" : "left"}
                            sx={{
                              color: '#1E293B',
                              fontWeight: 500,
                              py: 2,
                            }}
                          >
                            {column.format
                              ? column.format(value, row)
                              : String(value ?? "")}
                          </TableCell>
                        );
                      })}

                      {actions.length > 0 && (
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {actions.map((action, actionIndex) => {
                              if (action.show && !action.show(row)) {
                                return null;
                              }

                              return (
                                <Tooltip key={actionIndex} title={action.label}>
                                  <IconButton
                                    size="small"
                                    onClick={() => action.onClick(row)}
                                    sx={{
                                      color: action.color === 'error' ? '#EF4444' :
                                             action.color === 'warning' ? '#F59E0B' :
                                             action.color === 'success' ? '#10B981' :
                                             '#4F46E5',
                                      '&:hover': {
                                        backgroundColor: action.color === 'error' ? '#FEF2F2' :
                                                         action.color === 'warning' ? '#FFFBEB' :
                                                         action.color === 'success' ? '#ECFDF5' :
                                                         '#F0F4FF',
                                      }
                                    }}
                                  >
                                    {action.icon}
                                  </IconButton>
                                </Tooltip>
                              );
                            })}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {!loading && !error && rows.length > 0 && (
        <Box sx={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={(event) =>
              onRowsPerPageChange(parseInt(event.target.value, 10))
            }
            labelRowsPerPage="Registros por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
            sx={{
              '& .MuiTablePagination-toolbar': {
                color: '#64748B',
                fontWeight: 500,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#64748B',
                fontWeight: 500,
              },
              '& .MuiIconButton-root': {
                color: '#64748B',
                '&:hover': {
                  backgroundColor: '#F1F5F9',
                },
                '&.Mui-disabled': {
                  color: '#CBD5E1',
                },
              },
              '& .MuiSelect-select': {
                color: '#1E293B',
                fontWeight: 500,
              },
            }}
          />
        </Box>
      )}
    </Card>
  );
}