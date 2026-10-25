import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportStatus } from '../../types/index.js';

interface StatusChipProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();

  const getStatusStyles = (st: ReportStatus) => {
    switch (st) {
      case 'submitted':
        return 'bg-stone-100 text-stone-700 border-stone-300/80';
      case 'under_review':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'verified':
        return 'bg-blue-50 text-blue-900 border-blue-300 font-bold';
      case 'in_progress':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold';
      case 'awaiting_resolution_verification':
        return 'bg-purple-50 text-purple-900 border-purple-300 font-bold';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
      case 'reopened':
        return 'bg-rose-50 text-rose-900 border-rose-300 font-bold';
      case 'rejected':
        return 'bg-stone-200/60 text-stone-500 border-stone-300 line-through';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const getDotStyles = (st: ReportStatus) => {
    switch (st) {
      case 'in_progress':
        return 'bg-indigo-600 animate-pulse';
      case 'verified':
        return 'bg-blue-600';
      case 'resolved':
        return 'bg-emerald-600';
      case 'awaiting_resolution_verification':
        return 'bg-purple-600 animate-ping';
      case 'under_review':
        return 'bg-amber-600 animate-pulse';
      case 'rejected':
        return 'bg-stone-400';
      default:
        return 'bg-stone-500';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-semibold tracking-tight transition-all ${sizeClasses} ${getStatusStyles(
        status
      )}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyles(status)}`} />
      {t(`statuses.${status}`)}
    </span>
  );
};
