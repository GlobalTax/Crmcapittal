import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm border-separate border-spacing-y-1 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead>
      <tr className="text-left text-gray-500">
        {children}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return (
    <tr className={`bg-white hover:bg-gray-50 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`py-3 px-4 ${className}`}>
      {children}
    </td>
  );
}

export function TableHead({ children, className = '' }: TableCellProps) {
  return (
    <th className={`py-2 px-4 font-medium ${className}`}>
      {children}
    </th>
  );
}