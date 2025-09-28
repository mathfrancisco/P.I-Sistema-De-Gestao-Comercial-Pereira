import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Checkbox,
    IconButton,
    Toolbar,
    Typography,
    Tooltip,
    Box,
    TableSortLabel,
    CircularProgress,
    Alert,
} from "@mui/material";

interface Column<T> {
    id: keyof T | string;
    label: string;
    numeric?: boolean;
    format?: (value: unknown, row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string | number;
}

interface DataTableProps<T extends Record<string, unknown> & { id: string | number }> {
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

export function DataTable<T extends Record<string, unknown> & { id: string | number }>({
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
        let value: unknown = row;

        for (const key of keys) {
            value = (value as Record<string, unknown>)?.[key];
        }

        return value;
    };

    return (
        <Paper>
            {(title || toolbarActions || selectedRows.length > 0) && (
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 },
                        ...(selectedRows.length > 0 && {
                            bgcolor: (theme) =>
                                theme.palette.mode === "light"
                                    ? theme.palette.grey[100]
                                    : theme.palette.grey[900],
                        }),
                    }}
                >
                    {selectedRows.length > 0 ? (
                        <Typography
                            sx={{ flex: "1 1 100%" }}
                            color="inherit"
                            variant="subtitle1"
                            component="div"
                        >
                            {selectedRows.length} selecionado(s)
                        </Typography>
                    ) : (
                        <Typography
                            sx={{ flex: "1 1 100%" }}
                            variant="h6"
                            id="tableTitle"
                            component="div"
                        >
                            {title}
                        </Typography>
                    )}

                    {toolbarActions}
                </Toolbar>
            )}

            <TableContainer>
                {loading && (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Box p={2}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                {!loading && !error && (
                    <Table>
                        <TableHead>
                            <TableRow>
                                {selectable && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
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
                                    >
                                        {column.sortable !== false && onSort ? (
                                            <TableSortLabel
                                                active={sortBy === column.id}
                                                direction={sortBy === column.id ? sortOrder : "asc"}
                                                onClick={() => onSort(String(column.id))}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}

                                {actions.length > 0 && (
                                    <TableCell align="center" width={actions.length * 50}>
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
                                    >
                                        <Typography variant="body2" color="textSecondary">
                                            {emptyMessage}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => {
                                    const rowId = getRowId(row);
                                    const selected = isSelected(row);

                                    return (
                                        <TableRow
                                            key={rowId}
                                            hover
                                            selected={selected}
                                            role={selectable ? "checkbox" : undefined}
                                            aria-checked={selected}
                                        >
                                            {selectable && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
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
                                                    >
                                                        {column.format
                                                            ? column.format(value, row)
                                                            : String(value ?? "")}
                                                    </TableCell>
                                                );
                                            })}

                                            {actions.length > 0 && (
                                                <TableCell align="center">
                                                    {actions.map((action, index) => {
                                                        if (action.show && !action.show(row)) {
                                                            return null;
                                                        }

                                                        return (
                                                            <Tooltip key={index} title={action.label}>
                                                                <IconButton
                                                                    size="small"
                                                                    color={action.color}
                                                                    onClick={() => action.onClick(row)}
                                                                >
                                                                    {action.icon}
                                                                </IconButton>
                                                            </Tooltip>
                                                        );
                                                    })}
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
                />
            )}
        </Paper>
    );
}