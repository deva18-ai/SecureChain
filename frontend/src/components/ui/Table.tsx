import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-x-auto rounded-lg border border-dark-200 dark:border-dark-700">
      <table
        ref={ref}
        className={cn('w-full text-sm text-left', className)}
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
      className={cn('[&_tr]:border-b border-dark-200 dark:border-dark-700', className)}
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
      className={cn('border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors', className)}
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
      className={cn('px-4 py-3 bg-dark-50 dark:bg-dark-800/50 text-dark-500 dark:text-dark-400 font-semibold uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </th>
  )
);

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-4 py-3 text-dark-900 dark:text-dark-100', className)}
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
      className={cn('px-4 py-3 text-sm text-dark-500 dark:text-dark-400', className)}
      {...props}
    >
      {children}
    </caption>
  )
);

TableCaption.displayName = 'TableCaption';