import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPut } from '../utils/api';
import type { ScamReport, PaginatedResponse, ApiResponse } from '../types';
import { getScamTypeLabel, getScamTypeIcon, SCAM_TYPE_OPTIONS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, FileText, Search, X, XCircle } from 'lucide-react';

type ActionType = 'approve' | 'reject';

interface ConfirmModal {
  open: boolean;
  report: ScamReport | null;
  action: ActionType | null;
}

interface AdminStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function AdminReviewPage() {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [modal, setModal] = useState<ConfirmModal>({ open: false, report: null, action: null });
  const [acting, setActing] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filter) params.set('scam_type', filter);
      if (search) params.set('search', search);
      const data = await apiGet<PaginatedResponse<ScamReport>>(`/reports/pending/?${params}`);
      if (data.success) {
        setReports(data.data);
        setTotalPages(data.pagination.total_pages);
      }
    } catch {
      toast.error('Failed to load pending reports');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGet<ApiResponse<AdminStats>>('/admin/stats/');
      if (data.success) setStats(data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleAction = async () => {
    if (!modal.report || !modal.action) return;
    setActing(modal.report.id);
    setModal({ open: false, report: null, action: null });
    try {
      const data = await apiPut<ApiResponse<ScamReport>>(`/admin/reports/${modal.report.id}/${modal.action}/`);
      if (data.success) {
        toast.success(modal.action === 'approve' ? 'Report approved and published!' : 'Report rejected.');
        setReports(prev => prev.filter(r => r.id !== modal.report!.id));
        fetchStats();
        if (expanded === modal.report.id) setExpanded(null);
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setActing(null);
    }
  };

  const isImage = (url?: string | null) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div className="min-h-screen bg-[#F7F6F2] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Admin Review Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Review and moderate pending scam reports</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
            {[
              { label: 'Total reports', value: stats.total, color: 'text-gray-800' },
              { label: 'Pending review', value: stats.pending, color: 'text-orange-600' },
              { label: 'Approved', value: stats.approved, color: 'text-green-600' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pending reports..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535]"
            />
          </div>
          <select
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] appearance-none"
          >
            <option value="">All types</option>
            {SCAM_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Pending badge */}
        {!loading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" /> {reports.length} pending{totalPages > 1 ? ` on page ${page}` : ''}
            </span>
          </div>
        )}

        {/* Content */}
        {loading && <LoadingSpinner label="Loading pending reports..." />}

        {!loading && reports.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-gray-700 font-semibold text-lg">All clear!</p>
            <p className="text-gray-400 text-sm mt-1">No pending reports to review.</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map(report => {
              const ScamTypeIcon = getScamTypeIcon(report.scam_type);

              return (
              <div key={report.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Summary row */}
                <div
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(expanded === report.id ? null : report.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <span className="inline-flex items-center gap-1"><ScamTypeIcon className="h-3.5 w-3.5" /> {getScamTypeLabel(report.scam_type)}</span>
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-snug truncate">{report.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by <span className="text-gray-600">{report.submitted_by}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {acting === report.id ? (
                      <span className="w-5 h-5 border-2 border-[#E03535] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); setModal({ open: true, report, action: 'approve' }); }}
                          className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          <span className="inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Approve</span>
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setModal({ open: true, report, action: 'reject' }); }}
                          className="bg-red-100 text-[#E03535] hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          <span className="inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Reject</span>
                        </button>
                      </>
                    )}
                    <span className="text-gray-400 text-lg leading-none">{expanded === report.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === report.id && (
                  <div className="border-t border-gray-100 px-5 py-5 space-y-4 bg-gray-50">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Scammer contact</p>
                      <span className="text-sm font-mono bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 break-all">{report.contact_used}</span>
                    </div>
                    {report.evidence_file && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Evidence</p>
                        {isImage(report.evidence_file) ? (
                          <button onClick={() => setLightbox(report.evidence_file!)} className="block">
                            <img src={report.evidence_file} alt="Evidence" className="max-h-48 rounded-xl border border-gray-200 object-cover hover:opacity-80 transition" />
                          </button>
                        ) : (
                          <a href={report.evidence_file} target="_blank" rel="noopener noreferrer" className="text-sm text-[#E03535] hover:underline font-medium">
                            <span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" /> View document</span>
                          </a>
                        )}
                      </div>
                    )}
                    {/* Action buttons in expanded */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setModal({ open: true, report, action: 'approve' })}
                        className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition text-sm"
                      >
                        <span className="inline-flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Approve — publish this report</span>
                      </button>
                      <button
                        onClick={() => setModal({ open: true, report, action: 'reject' })}
                        className="flex-1 bg-[#E03535] text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition text-sm"
                      >
                        <span className="inline-flex items-center gap-1"><XCircle className="h-4 w-4" /> Reject this report</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {modal.open && modal.report && modal.action && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-5">
              <div className="mb-3 flex justify-center">
                {modal.action === 'approve' ? <CheckCircle className="h-10 w-10 text-green-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {modal.action === 'approve' ? 'Approve report?' : 'Reject report?'}
              </h2>
              <p className="text-sm text-gray-500">
                {modal.action === 'approve'
                  ? 'This will publish the report publicly on the homepage.'
                  : 'This report will be removed from the pending queue.'}
              </p>
              <p className="text-sm font-semibold text-gray-700 mt-3 line-clamp-2">"{modal.report.title}"</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModal({ open: false, report: null, action: null })}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition ${modal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#E03535] hover:bg-red-700'}`}
              >
                {modal.action === 'approve' ? 'Yes, approve' : 'Yes, reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Evidence" className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"><X className="h-6 w-6" /></button>
        </div>
      )}
    </div>
  );
}
