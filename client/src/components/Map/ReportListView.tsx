import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, Camera, MapPin, ArrowRight } from 'lucide-react';
import { Report } from '../../types/index.js';
import { StatusChip } from '../UI/StatusChip.js';

interface ReportListViewProps {
  reports: Report[];
  onSupport?: (reportId: string) => void;
}

export const ReportListView: React.FC<ReportListViewProps> = ({ reports, onSupport }) => {
  const { t } = useTranslation();

  if (reports.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-3xl p-8">
        <p className="text-stone-500 font-bold text-sm">No civic reports found matching current filters.</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Civic Issues List Alternative"
      className="space-y-4"
    >
      <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white/90 backdrop-blur-md shadow-glass">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200/80 bg-stone-50/80 text-xs font-black text-stone-600 uppercase tracking-wider">
              <th scope="col" className="py-4 px-6 w-24">Photo</th>
              <th scope="col" className="py-4 px-6">Title & Description</th>
              <th scope="col" className="py-4 px-6">Category</th>
              <th scope="col" className="py-4 px-6">Status</th>
              <th scope="col" className="py-4 px-6">Location</th>
              <th scope="col" className="py-4 px-6 text-center">Community Signals</th>
              <th scope="col" className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/60 text-sm">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-4 px-6 w-24">
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="w-16 h-16 object-cover rounded-2xl border border-stone-200/80 shadow-2xs"
                    loading="lazy"
                  />
                </td>
                <td className="py-4 px-6 max-w-xs">
                  <Link
                    to={`/reports/${report.id}`}
                    className="font-extrabold text-stone-900 hover:text-forest-700 block line-clamp-1 transition-colors"
                  >
                    {report.title}
                  </Link>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {report.description}
                  </p>
                  {report.is_demo && (
                    <span className="inline-block mt-1 text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      Demo
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className="text-xs font-bold text-stone-800 bg-stone-100 px-3 py-1 rounded-full">
                    {t(`categories.${report.category}`)}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <StatusChip status={report.status} size="sm" />
                </td>
                <td className="py-4 px-6 max-w-[200px] text-xs text-stone-600">
                  <div className="flex items-start gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{report.address}</span>
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-3 text-xs text-stone-600 font-bold">
                    <span className="inline-flex items-center gap-1 bg-forest-50 px-2.5 py-1 rounded-full text-forest-900">
                      <ThumbsUp className="w-3.5 h-3.5 text-quest" />
                      {report.supports_count}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-amber-900">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      {report.evidence_count}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-right">
                  <Link
                    to={`/reports/${report.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 transition-all shadow-2xs active:scale-95"
                  >
                    Details
                    <ArrowRight className="w-3.5 h-3.5 text-quest" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
