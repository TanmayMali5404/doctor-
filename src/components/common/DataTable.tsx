import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key?: string;
  header: string;
  accessorKey?: string;
  cell?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  pageSize?: number;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  searchKey,
  searchPlaceholder = 'Search records...',
  actions,
  onRowClick,
  emptyMessage = 'No records found.',
  pageSize = 10,
  pagination,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      const val = item[searchKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(term);
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination calculations (external server pagination or internal client pagination)
  const isServerPagination = !!pagination;
  const activePage = isServerPagination ? pagination.page : currentPage;
  const activePageSize = isServerPagination ? pagination.pageSize : pageSize;
  const totalItems = isServerPagination ? pagination.total : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));

  const paginatedData = useMemo(() => {
    if (isServerPagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, isServerPagination]);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isServerPagination) {
      pagination.onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      {(searchKey || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!isServerPagination) setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-xs"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2 self-end sm:self-auto">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200/60 dark:border-zinc-800">
              <tr>
                {columns.map((col, idx) => {
                  const colKey = col.key || col.accessorKey || `col-${idx}`;
                  return (
                    <th
                      key={colKey}
                      scope="col"
                      className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}
                    >
                      {col.sortable ? (
                        <button
                          onClick={() => handleSort(colKey)}
                          className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus:outline-none"
                        >
                          {col.header}
                          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-4 py-3.5">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    <div className="max-w-xs mx-auto space-y-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-200">
                        {emptyMessage}
                      </p>
                      {searchTerm && (
                        <p className="text-xs text-zinc-400">
                          Try adjusting your search query or filters.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, rowIdx) => (
                  <tr
                    key={item.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      'transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col, cIdx) => {
                      const colKey = col.key || col.accessorKey || `cell-${cIdx}`;
                      const renderFn = col.cell || col.render;
                      const val = col.accessorKey ? item[col.accessorKey] : col.key ? item[col.key] : undefined;
                      return (
                        <td
                          key={colKey}
                          className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}
                        >
                          {renderFn ? renderFn(item) : val ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {totalItems === 0 ? 0 : (activePage - 1) * activePageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {Math.min(activePage * activePageSize, totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {totalItems}
            </span>{' '}
            records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-zinc-700 dark:text-zinc-300">
              Page {activePage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
