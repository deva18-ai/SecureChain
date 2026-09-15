import { HTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from './Button';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table
        ref={ref}
        className={cn('w-full text-sm text-left bg-white', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('[&_tr]:border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </thead>
  )
);

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    >
      {children}
    </tbody>
  )
);

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('border-b border-gray-200 hover:bg-primary-blue/5 transition-colors', className)}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('px-6 py-4 bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-xs', className)}
      {...props}
    >
      {children}
    </th>
  )
);

TableHead.displayName = 'TableHead';

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  colSpan?: number;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, colSpan, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-6 py-4 text-gray-900', className)}
      colSpan={colSpan}
      {...props}
    >
      {children}
    </td>
  )
);

TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, children, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('px-6 py-4 text-sm text-gray-600', className)}
      {...props}
    >
      {children}
    </caption>
  )
);

TableCaption.displayName = 'TableCaption';

export interface DataTableProps<T> {
  columns: Array<{
    key: string;
    header: string;
    render?: (row: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    width?: string;
  }>;
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyState?: {
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  };
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  loading = false,
  striped = false,
  hoverable = true,
  className,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  pagination,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' }>({
    key: sortBy || '',
    order: sortOrder || 'asc',
  });

  const handleSort = (key: string) => {
    if (!onSort) return;
    let order: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
    onSort(key);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedKeys && selectedKeys.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(keyExtractor)));
    }
  };

  const handleSelectRow = (key: string | number) => {
    if (!onSelectionChange) return;
    const newKeys = new Set(selectedKeys || []);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }
    onSelectionChange(newKeys);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left bg-white">
          <thead>
            <tr className="border-b border-gray-200">
              {selectable && <th className="px-6 py-4 bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-xs w-12" />}
              {columns.map((col) => (
                <th key={col.key} className={cn('px-6 py-4 bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-xs', col.headerClassName)} style={{ width: col.width }}>
                  <div className="animate-pulse bg-gray-200 h-4 w-full rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-200 animate-pulse">
                {selectable && <td className="px-6 py-4" />}
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-6 py-4', col.className)}>
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200">
        <div className="py-16 px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 mx-auto mb-4 text-gray-400">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{emptyState?.title || 'No data available'}</h3>
            {emptyState?.description && (
              <p className="text-sm text-gray-600 mb-4 max-w-sm">{emptyState.description}</p>
            )}
            {emptyState?.action && (
              <Button variant="primary" size="sm" onClick={emptyState.action.onClick}>
                {emptyState.action.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedKeys && selectedKeys.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={cn(col.headerClassName)} style={{ width: col.width, cursor: onSort ? 'pointer' : undefined }} onClick={() => handleSort(col.key)}>
                <div className="flex items-center gap-1">
                  {col.header}
                  {onSort && sortConfig.key === col.key && (
                    <span className="text-xs">{sortConfig.order === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const rowKey = keyExtractor(row);
            const isSelected = selectedKeys?.has(rowKey);
            return (
              <TableRow
                key={rowKey}
                className={cn(
                  striped && index % 2 === 0 && 'bg-gray-50/50',
                  hoverable && 'hover:bg-primary-blue/5',
                  onRowClick && 'cursor-pointer',
                  isSelected && 'bg-primary-blue/5'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell className="w-12">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(rowKey)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                      aria-label={`Select row ${index + 1}`}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(col.className)}>
                    {col.render ? col.render(row, index) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue bg-white"
              aria-label="Rows per page"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}