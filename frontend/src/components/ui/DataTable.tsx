import { useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { cn } from '../../utils/helpers';
import { ChevronUp, ChevronDown, ChevronsUpDown, Check, Minus, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Input';

export interface Column<T> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyAccessor: keyof T | ((row: T) => string);
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  onSelectionChange?: (selected: Set<string>) => void;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, event: React.MouseEvent) => void;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | 'none' }) {
  if (direction === 'asc') return <ChevronUp className="h-4 w-4 text-cyber-primary" />;
  if (direction === 'desc') return <ChevronDown className="h-4 w-4 text-cyber-primary" />;
  return <ChevronsUpDown className="h-4 w-4 text-cyber-textDim" />;
}

function Checkbox({ checked, indeterminate, onChange, disabled }: {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
        checked
          ? 'bg-cyber-primary border-cyber-primary text-cyber-bg'
          : 'border-cyber-border text-transparent hover:border-cyber-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-checked={checked}
      aria-indeterminate={indeterminate}
    >
      {checked && !indeterminate && <Check className="h-3 w-3" />}
      {indeterminate && <Minus className="h-1.5 w-1.5" />}
    </button>
  );
}

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions, showPageSizeSelector }: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions: number[];
  showPageSizeSelector: boolean;
}) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  if (totalPages <= 1 && !showPageSizeSelector) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-cyber-border">
      <div className="text-sm text-cyber-textMuted">
        Showing {start} to {end} of {total} results
      </div>
      <div className="flex items-center gap-3">
        {showPageSizeSelector && (
          <Select
            value={String(pageSize)}
            onChange={onPageSizeChange}
            options={pageSizeOptions.map(n => ({ value: String(n), label: `${n} per page` }))}
            className="w-auto"
          />
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            <ChevronsUpDown className="h-4 w-4 rotate-180" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm font-medium text-cyber-text">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            aria-label="Last page"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyAccessor,
  loading = false,
  emptyMessage = 'No data available',
  selectable = false,
  onSelectionChange,
  sortable = true,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  striped = true,
  hoverable = true,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const getRowKey = useCallback((row: T) => {
    return typeof keyAccessor === 'function' ? keyAccessor(row) : String(row[keyAccessor]);
  }, [keyAccessor]);

  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] as string | number;
      const bVal = b[sortConfig.key] as string | number;
      if (aVal === bVal) return 0;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });
  }, [data, sortConfig, sortable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const newSelection = new Set(paginatedData.map(getRowKey));
      setSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (rowKey: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowKey)) {
      newSelection.delete(rowKey);
    } else {
      newSelection.add(rowKey);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
    setSelectAll(newSelection.size === paginatedData.length && paginatedData.length > 0);
  };

  const isRowSelected = (rowKey: string) => selectedRows.has(rowKey);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const [pageSizeState, setPageSize] = useState(pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.ceil(sortedData.length / pageSizeState);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className={cn('bg-cyber-panel border border-cyber-border rounded-xl overflow-hidden', className)}>
      {loading && (
        <div className="absolute inset-0 bg-cyber-panel/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-primary" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-cyber-elevated/50">
            <tr className="border-b border-cyber-border">
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <Checkbox
                    checked={selectAll && paginatedData.length > 0}
                    indeterminate={selectAll && selectedRows.size > 0 && selectedRows.size < paginatedData.length}
                    onChange={handleSelectAll}
                    disabled={paginatedData.length === 0}
                  />
                </th>
              )}
              {columns.map((column, colIndex) => (
                <th
                  key={colIndex}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-cyber-textDim uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && sortable && 'cursor-pointer hover:text-cyber-primary select-none',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                  onClick={column.sortable && sortable ? () => handleSort(column.key) : undefined}
                  aria-sort={sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="flex items-center gap-2 justify-start">
                    {column.header}
                    {column.sortable && sortable && <SortIcon direction={sortConfig?.key === column.key ? sortConfig.direction : 'none'} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-cyber-textMuted">
                    <Loader2 className="h-10 w-10 text-cyber-border animate-spin" aria-hidden="true" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowKey = getRowKey(row);
                const isSelected = isRowSelected(rowKey);

                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      'border-b border-cyber-border/50 transition-colors',
                      striped && rowIndex % 2 === 0 && 'bg-cyber-elevated/30',
                      hoverable && 'hover:bg-cyber-primary/5',
                      isSelected && 'bg-cyber-primary/10',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row, rowIndex)
                    )}
                    onClick={onRowClick ? (e) => onRowClick(row, e) : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row, e as any); }} : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    aria-selected={selectable ? isSelected : undefined}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn(
                          'px-4 py-3 text-cyber-text',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(row[column.accessor as keyof T], row, rowIndex)
                          : typeof column.accessor === 'function'
                            ? column.accessor(row)
                            : String(row[column.accessor as keyof T] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && sortedData.length > 0 && (
        <Pagination
          page={currentPage}
          pageSize={pageSizeState}
          total={sortedData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';

export interface DataTableToolbarProps {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    onChange: (value: string) => void;
  }>;
  actions?: ReactNode;
  className?: string;
}

export function DataTableToolbar({
  title,
  description,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-cyber-border', className)}>
      <div className="flex-1 min-w-0">
        {title && <h3 className="text-lg font-heading font-semibold text-cyber-text">{title}</h3>}
        {description && <p className="text-sm text-cyber-textMuted mt-1">{description}</p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
        {onSearchChange && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>}
            className="w-full sm:w-64"
          />
        )}
        {filters.map((filter, index) => (
          <Select
            key={index}
            value={filter.value || ''}
            onChange={filter.onChange}
            options={[{ value: '', label: `All ${filter.label}` }, ...filter.options]}
            placeholder={`Filter by ${filter.label}`}
            className="w-full sm:w-40"
          />
        ))}
        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>
    </div>
  );
}