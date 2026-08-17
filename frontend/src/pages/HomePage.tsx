import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { ScamReport, PaginatedResponse } from '../types';
import { apiGet } from '../utils/api';
import { SCAM_TYPE_OPTIONS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import ScamCard from '../components/ScamCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertTriangle, Search } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      if (filter) params.set('scam_type', filter);

      const data = await apiGet<PaginatedResponse<ScamReport>>(`/reports/?${params}`);
      if (data.success) {
        setReports(data.data);
        setTotalPages(data.pagination.total_pages);
        setTotalItems(data.pagination.total_items);
      } else {
        setError('Failed to load reports.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (val: string) => {
    setFilter(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-50 text-[#E03535] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <AlertTriangle className="h-3.5 w-3.5" /> Community-powered protection
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              Know before you're tricked
            </h1>
            <p className="text-lg text-gray-500 mb-6 leading-relaxed">
              Real people reporting real scams. Search by type or keyword to protect yourself and others.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="bg-[#E03535] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Join the community
                </Link>
                <Link
                  to="/login"
                  className="border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Sign in to report
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <Link
                to="/report"
                className="inline-flex items-center gap-2 bg-[#E03535] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
              >
                + Report a scam
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search scam titles, descriptions..."
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E03535] focus:border-transparent transition"
            />
          </div>
          <select
            value={filter}
            onChange={e => handleFilterChange(e.target.value)}
            className="sm:w-52 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E03535] focus:border-transparent transition appearance-none cursor-pointer"
          >
            <option value="">All scam types</option>
            {SCAM_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Results meta */}
        {!loading && !error && (
          <div className="mt-3 text-sm text-gray-500">
            {totalItems === 0 ? (
              <span>No reports found{search || filter ? ' — try adjusting your search' : ''}</span>
            ) : (
              <span>{totalItems.toLocaleString()} report{totalItems !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}{filter ? ` · ${SCAM_TYPE_OPTIONS.find(o => o.value === filter)?.label}` : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {loading && <LoadingSpinner label="Fetching reports..." />}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Couldn't load reports</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={fetchReports} className="text-sm text-[#E03535] font-semibold hover:underline">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No scams found</p>
            <p className="text-gray-400 text-sm">
              {search || filter ? 'Try clearing your filters' : 'Be the first to report one'}
            </p>
            {(search || filter) && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setFilter(''); setPage(1); }}
                className="mt-4 text-sm text-[#E03535] font-semibold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map(r => <ScamCard key={r.id} report={r} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition ${p === page ? 'bg-[#E03535] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
