import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

const Table = ({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  emptyTitle = 'No data available',
  emptyDescription = 'No records are registered in this section yet.',
  emptyActionLabel,
  onEmptyAction,
  rowsPerPage = 8,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((row) => {
    if (!search) return true;
    return columns.some((col) => {
      const val = col.accessor ? row[col.accessor] : col.render ? col.render(row) : '';
      return String(val || '').toLowerCase().includes(search.toLowerCase());
    });
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700/70 overflow-hidden">
      {/* Search & Actions Bar */}
      {searchable && (
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-700/60 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 transition-all"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}

      {/* Table Content */}
      {filteredData.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Inbox}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-900 text-slate-300 dark:bg-slate-900 border-b border-slate-700 text-xs font-bold uppercase tracking-wider">
                  {columns.map((col, idx) => (
                    <th key={idx} className={`px-4 sm:px-6 py-3 sm:py-3.5 ${col.className || ''}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
                {currentData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-4 sm:px-6 py-3 sm:py-4 text-slate-800 dark:text-slate-200 font-medium ${col.className || ''}`}>
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/30 dark:bg-slate-900/20">
              <span className="hidden xs:block">
                Showing {startIndex + 1}&ndash;{Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[5rem] text-center">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;
