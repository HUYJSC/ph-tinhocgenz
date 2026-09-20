import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, AlertCircle
} from 'lucide-react';
import { SkeletonTable } from './SkeletonLoaders';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: DataTableFilterOption[];
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchKey?: (row: T) => string;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  actionsRight?: React.ReactNode;
  syncWithUrl?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  filters = [],
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  isLoading = false,
  errorMessage = null,
  onRetry,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Hiện chưa có mục nào phù hợp với điều kiện tìm kiếm hoặc dữ liệu đang trống.',
  emptyActionLabel,
  onEmptyAction,
  actionsRight,
  syncWithUrl = false
}: DataTableProps<T>) {
  // Read initial values from URL if syncWithUrl is active
  const getUrlParam = (param: string) => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return syncWithUrl ? (getUrlParam('search') || '') : '';
  });

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (syncWithUrl) {
      filters.forEach(f => {
        const val = getUrlParam(f.key);
        if (val) init[f.key] = val;
      });
    }
    return init;
  });

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(() => {
    if (syncWithUrl) {
      const sortParam = getUrlParam('sort');
      if (sortParam) {
        const [k, dir] = sortParam.split(':');
        return { key: k, direction: dir === 'desc' ? 'desc' : 'asc' };
      }
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (syncWithUrl) {
      const p = parseInt(getUrlParam('page') || '1', 10);
      return isNaN(p) || p < 1 ? 1 : p;
    }
    return 1;
  });

  const [pageSize, setPageSize] = useState<number>(() => {
    if (syncWithUrl) {
      const l = parseInt(getUrlParam('limit') || String(initialPageSize), 10);
      return isNaN(l) ? initialPageSize : l;
    }
    return initialPageSize;
  });

  // URL sync effect
  useEffect(() => {
    if (!syncWithUrl || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');

    Object.entries(selectedFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });

    if (sortConfig) params.set('sort', `${sortConfig.key}:${sortConfig.direction}`);
    else params.delete('sort');

    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));

    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [searchTerm, selectedFilters, sortConfig, currentPage, pageSize, syncWithUrl]);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(row => {
        if (searchKey) {
          return searchKey(row).toLowerCase().includes(q);
        }
        // fallback: check all row values
        return Object.values(row).some(val =>
          typeof val === 'string' || typeof val === 'number'
            ? String(val).toLowerCase().includes(q)
            : false
        );
      });
    }

    // Dynamic key-value filters
    Object.entries(selectedFilters).forEach(([key, filterValue]) => {
      if (!filterValue || filterValue === 'ALL') return;
      result = result.filter(row => String(row[key]) === filterValue);
    });

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const comp = aVal > bVal ? 1 : -1;
        return sortConfig.direction === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, searchTerm, searchKey, selectedFilters, sortConfig]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, safePage, pageSize]);

  const handleSort = (columnKey: string) => {
    setSortConfig(current => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return null;
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '14px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      {/* ── Toolbar: Search + Filters + Actions ── */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #F1F5F9',
        background: '#FAFCFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                background: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filters */}
          {filters.map(f => (
            <select
              key={f.key}
              value={selectedFilters[f.key] || 'ALL'}
              onChange={e => handleFilterChange(f.key, e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '12.5px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">Tất cả {f.label}</option>
              {f.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {actionsRight && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {actionsRight}
          </div>
        )}
      </div>

      {/* ── Table Viewport / Skeletons / States ── */}
      {isLoading ? (
        <div style={{ padding: '20px' }}>
          <SkeletonTable rows={pageSize > 10 ? 8 : pageSize} cols={columns.length} />
        </div>
      ) : errorMessage ? (
        <div style={{
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          textAlign: 'center'
        }}>
          <AlertCircle size={36} color="#EF4444" />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Không thể tải dữ liệu
          </h4>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: 0 }}>
            {errorMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                marginTop: '8px',
                padding: '7px 18px',
                background: '#0057B8',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Thử lại
            </button>
          )}
        </div>
      ) : paginatedData.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {columns.map(col => {
                  const isSorted = sortConfig?.key === col.key;
                  const isSortable = col.sortable !== false;
                  return (
                    <th
                      key={col.key}
                      onClick={() => isSortable && handleSort(col.key)}
                      style={{
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: isSorted ? '#0057B8' : '#475569',
                        fontSize: '12.5px',
                        width: col.width,
                        textAlign: col.align || 'left',
                        cursor: isSortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
                      }}>
                        <span>{col.header}</span>
                        {isSortable && (
                          <span style={{ display: 'inline-flex', opacity: isSorted ? 1 : 0.4 }}>
                            {isSorted && sortConfig.direction === 'asc' ? (
                              <ArrowUp size={13} color="#0057B8" />
                            ) : isSorted && sortConfig.direction === 'desc' ? (
                              <ArrowDown size={13} color="#0057B8" />
                            ) : (
                              <ArrowUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '14px 16px',
                        color: '#1E293B',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle'
                      }}
                    >
                      {col.render ? col.render(row, index) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer: Pagination ── */}
      {!isLoading && !errorMessage && filteredData.length > 0 && (
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid #F1F5F9',
          fontSize: '12.5px',
          color: '#64748B',
          background: '#FAFCFF'
        }}>
          {/* Row count info */}
          <div>
            Hiển thị <strong>{Math.min(totalItems, (safePage - 1) * pageSize + 1)}</strong> - <strong>{Math.min(totalItems, safePage * pageSize)}</strong> trên <strong>{totalItems}</strong> mục
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Page size selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Số dòng:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: '12px',
                  color: '#334155'
                }}
              >
                {pageSizeOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                aria-label="Trang đầu"
                style={{
                  padding: '5px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: safePage <= 1 ? '#F8FAFC' : '#FFFFFF',
                  color: safePage <= 1 ? '#CBD5E1' : '#334155',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Trang trước"
                style={{
                  padding: '5px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: safePage <= 1 ? '#F8FAFC' : '#FFFFFF',
                  color: safePage <= 1 ? '#CBD5E1' : '#334155',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={15} />
              </button>

              <span style={{ padding: '0 8px', fontWeight: 600, color: '#0F172A' }}>
                {safePage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Trang sau"
                style={{
                  padding: '5px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: safePage >= totalPages ? '#F8FAFC' : '#FFFFFF',
                  color: safePage >= totalPages ? '#CBD5E1' : '#334155',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                aria-label="Trang cuối"
                style={{
                  padding: '5px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: safePage >= totalPages ? '#F8FAFC' : '#FFFFFF',
                  color: safePage >= totalPages ? '#CBD5E1' : '#334155',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
