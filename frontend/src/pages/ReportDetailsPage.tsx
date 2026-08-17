import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { ScamReport, ApiResponse, PaginatedResponse } from '../types';
import { apiGet } from '../utils/api';
import { getScamTypeLabel, getScamTypeIcon } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import ScamCard from '../components/ScamCard';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Copy, FileText, Search, Share2, X } from 'lucide-react';

const badgeColors: Record<string, string> = {
  phishing: 'bg-red-100 text-red-700',
  fake_job: 'bg-blue-100 text-blue-700',
  catfish: 'bg-pink-100 text-pink-700',
  investment: 'bg-orange-100 text-orange-700',
  shopping: 'bg-purple-100 text-purple-700',
  tech_support: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ScamReport | null>(null);
  const [similar, setSimilar] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet<ApiResponse<ScamReport>>(`/reports/${id}/`);
        if (data.success) {
          setReport(data.data);
          // Fetch similar
          const sim = await apiGet<PaginatedResponse<ScamReport>>(`/reports/?scam_type=${data.data.scam_type}&per_page=4`);
          if (sim.success) {
            setSimilar(sim.data.filter(r => r.id !== data.data.id).slice(0, 3));
          }
        } else {
          setError('Report not found.');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  const copyContact = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.contact_used);
    toast.success('Copied to clipboard');
  };

  const shareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
      <LoadingSpinner label="Loading report..." />
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report not found</h2>
        <p className="text-gray-500 text-sm mb-6">{error || 'This report may have been removed.'}</p>
        <Link to="/" className="bg-[#E03535] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );

  const isImage = report.evidence_file && /\.(jpg|jpeg|png|gif|webp)$/i.test(report.evidence_file);

  const ScamTypeIcon = getScamTypeIcon(report.scam_type);
  return (
    <div className="min-h-screen bg-[#F7F6F2] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
          ← Back to reports
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          {/* Top bar */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-0">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${badgeColors[report.scam_type] || 'bg-gray-100 text-gray-600'}`}>
                <ScamTypeIcon className="h-4 w-4" /> {getScamTypeLabel(report.scam_type)}
              </span>
              {report.status === 'approved' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {report.report_count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-[#E03535]">
                  <AlertTriangle className="h-3.5 w-3.5" /> {report.report_count} people reported this
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">{report.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100">
              <span>Reported by <span className="text-gray-600 font-medium">{report.submitted_by}</span></span>
              <span>First reported {formatDate(report.created_at)}</span>
              {report.updated_at !== report.created_at && (
                <span>Updated {formatDate(report.updated_at)}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {/* Description */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">What happened</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
            </section>

            {/* Contact info */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Scammer contact</h2>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-gray-700 text-sm font-mono flex-1 break-all">{report.contact_used}</span>
                <button
                  onClick={copyContact}
                  className="shrink-0 text-xs text-gray-500 hover:text-[#E03535] font-medium flex items-center gap-1 transition"
                  aria-label="Copy contact"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </section>

            {/* Evidence */}
            {report.evidence_file && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Evidence</h2>
                {isImage ? (
                  <button onClick={() => setLightboxOpen(true)} className="block w-full">
                    <img
                      src={report.evidence_file!}
                      alt="Scam evidence"
                      className="w-full max-h-72 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition cursor-zoom-in"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-center">Click to view full size</p>
                  </button>
                ) : (
                  <a
                    href={report.evidence_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#E03535] font-medium hover:underline"
                  >
                    <FileText className="h-4 w-4" /> View document
                  </a>
                )}
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={shareReport}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <Link
                to="/report"
                className="flex items-center gap-2 text-sm font-medium text-white bg-[#E03535] hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <AlertTriangle className="h-4 w-4" /> Report similar scam
              </Link>
            </div>
          </div>
        </div>

        {/* Similar reports */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Similar {getScamTypeLabel(report.scam_type)} scams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similar.map(r => <ScamCard key={r.id} report={r} />)}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && report.evidence_file && isImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={report.evidence_file}
            alt="Evidence full size"
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
