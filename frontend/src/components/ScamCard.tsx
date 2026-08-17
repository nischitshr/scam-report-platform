import { Link } from 'react-router-dom';
import type { ScamReport } from '../types';
import { getScamTypeLabel, getScamTypeIcon } from '../utils/constants';
import { TrendingUp } from 'lucide-react';
interface Props {
  report: ScamReport;
}

const badgeColors: Record<string, string> = {
  phishing: 'bg-red-100 text-red-700',
  fake_job: 'bg-blue-100 text-blue-700',
  catfish: 'bg-pink-100 text-pink-700',
  investment: 'bg-orange-100 text-orange-700',
  shopping: 'bg-purple-100 text-purple-700',
  tech_support: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ScamCard({ report }: Props) {
  const ScamTypeIcon = getScamTypeIcon(report.scam_type);

  return (
    <Link
      to={`/reports/${report.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[report.scam_type] || 'bg-gray-100 text-gray-600'}`}>
          <ScamTypeIcon className="h-3.5 w-3.5" />
          {getScamTypeLabel(report.scam_type)}
        </span>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(report.created_at)}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-[#E03535] transition-colors line-clamp-2">
        {report.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {report.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="truncate">via {report.contact_used}</span>
        {report.report_count > 0 && (
          <span className="flex items-center gap-1 shrink-0 ml-2">
            <TrendingUp className="w-3 h-3" />
            <span className="text-gray-500 font-medium">{report.report_count} reported</span>
          </span>
        )}
      </div>
    </Link>
  );
}
