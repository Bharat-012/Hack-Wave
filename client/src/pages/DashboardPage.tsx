import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  CheckCircle2,
  Users,
  Trophy,
  ShieldCheck,
  RefreshCw,
  Info,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api/client.js';
import { DashboardImpactMetrics } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getImpactMetrics()
      .then((metrics) => setData(metrics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
        <p className="text-stone-500 font-medium text-sm">Computing real ledger metrics...</p>
      </div>
    );
  }

  const { metrics, status_breakdown, category_breakdown } = data;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 font-bold text-xs uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5 text-forest-700" />
          Public Municipal Ledger
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          {t('stats.title')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
          {t('stats.subtitle')}
        </p>
      </div>

      {/* Honest Separation Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream-50 border border-cream-300 text-xs text-stone-700">
        <Info className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Integrity Guarantee: Demo vs Live Data Separation</span>
          <p className="mt-0.5 text-stone-600">
            {data.demo_separation_notice}
          </p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reports */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.total_reports')}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-stone-900">
              {metrics.total_reports.combined}
            </span>
            <div className="flex flex-col items-end gap-1 text-[11px] font-semibold">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {metrics.total_reports.live} {t('stats.live_badge')}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {metrics.total_reports.demo} {t('stats.demo_badge')}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-stone-400 block pt-1 border-t border-cream-200">
            Total issues filed to municipal radar
          </span>
        </div>

        {/* Resolved Cases */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.resolved_cases')}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-emerald-700">
              {metrics.resolved_reports.combined}
            </span>
            <div className="flex flex-col items-end gap-1 text-[11px] font-semibold">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {metrics.resolved_reports.live} {t('stats.live_badge')}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {metrics.resolved_reports.demo} {t('stats.demo_badge')}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-stone-400 block pt-1 border-t border-cream-200">
            Verified after-fix photographic evidence
          </span>
        </div>

        {/* Active Quests */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.active_quests')}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-quest">
              {metrics.active_quests.combined}
            </span>
            <div className="flex flex-col items-end gap-1 text-[11px] font-semibold">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {metrics.active_quests.live} {t('stats.live_badge')}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {metrics.active_quests.demo} {t('stats.demo_badge')}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-stone-400 block pt-1 border-t border-cream-200">
            Open collaborative team missions
          </span>
        </div>

        {/* Points Awarded */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.community_points')}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-black text-amber-600">
              {metrics.community_points.combined}
            </span>
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-[11px] text-stone-400 block pt-1 border-t border-cream-200">
            Deterministic points earned by residents
          </span>
        </div>
      </div>

      {/* Two Column Layout: Status Breakdown & Category Mix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            Report Lifecycle Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(status_breakdown).map(([status, count]) => {
              const total = metrics.total_reports.combined || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>{t(`statuses.${status}`)}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-forest-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            Issues by Civic Category
          </h2>
          <div className="space-y-3">
            {Object.entries(category_breakdown).map(([cat, count]) => {
              const total = metrics.total_reports.combined || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>{t(`categories.${cat}`)}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-quest h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
