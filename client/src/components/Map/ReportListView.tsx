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
      <div className="text-center py-12 bg-white rounded-2xl border border-cream-300 p-6">
        <p className="text-stone-500 font-medium">No civic reports found matching current filters.</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Civic Issues List Alternative"
      className="space-y-4"
    >
      <div className="overflow-x-auto rounded-2xl border border-cream-300 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cream-300 bg-cream-50 text-xs font-semibold text-stone-600 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4">Photo</th>
              <th scope="col" className="py-3.5 px-4">Title & Description</th>
              <th scope="col" className="py-3.5 px-4">Category</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Location</th>
              <th scope="col" className="py-3.5 px-4 text-center">Community Signals</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200 text-sm">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-cream-50/70 transition-colors">
                <td className="py-3 px-4 w-20">
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200"
                    loading="lazy"
                  />
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <Link
                    to={`/reports/${report.id}`}
                    className="font-semibold text-stone-900 hover:text-forest-700 block line-clamp-1"
                  >
                    {report.title}
                  </Link>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                    {report.description}
                  </p>
                  {report.is_demo && (
                    <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                    {t(`categories.${report.category}`)}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusChip status={report.status} size="sm" />
                </td>
                <td className="py-3 px-4 max-w-[200px] text-xs text-stone-600">
                  <div className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{report.address}</span>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-3 text-xs text-stone-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-forest-700" />
                      {report.supports_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      {report.evidence_count}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <Link
                    to={`/reports/${report.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-700 text-white text-xs font-semibold hover:bg-forest-800 transition-colors shadow-2xs"
                  >
                    Details
                    <ArrowRight className="w-3 h-3" />
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
