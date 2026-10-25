import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportStatus } from '../../types/index.js';

interface StatusChipProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();

  const getStatusStyles = (st: ReportStatus) => {
    switch (st) {
      case 'submitted':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'under_review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'verified':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'awaiting_resolution_verification':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'reopened':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'rejected':
        return 'bg-stone-200 text-stone-500 border-stone-400 line-through';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} ${getStatusStyles(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {t(`statuses.${status}`)}
    </span>
  );
};
