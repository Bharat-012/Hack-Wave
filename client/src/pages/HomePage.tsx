import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Camera,
  CheckCircle2,
  Users,
  Sparkles,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api/client.js';
import { DashboardImpactMetrics, Quest, Report } from '../types/index.js';
import { StatusChip } from '../components/UI/StatusChip.js';
import { CityMap } from '../components/Map/CityMap.js';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardImpactMetrics | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getImpactMetrics().catch(() => null),
      api.getReports().catch(() => []),
      api.getQuests('active').catch(() => []),
    ]).then(([metricsData, reportsData, questsData]) => {
      setMetrics(metricsData);
      setRecentReports(reportsData.slice(0, 4));
      setActiveQuests(questsData.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-radial from-forest-800 to-forest-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-forest-700">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-700/80 border border-quest/40 text-xs font-semibold text-quest">
            <Sparkles className="w-3.5 h-3.5" />
            {t('hero.trusted_banner')}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Report a problem. <br />
            <span className="text-quest">Rally your neighborhood.</span> <br />
            Make change visible.
          </h1>

          <p className="text-base sm:text-lg text-forest-100 font-normal leading-relaxed max-w-2xl">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-quest text-forest-900 font-bold text-base hover:bg-quest-hover hover:text-white transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              {t('hero.cta_report')}
            </Link>

            <Link
              to="/quests"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all backdrop-blur-sm"
            >
              <ShieldCheck className="w-5 h-5 text-quest" />
              {t('hero.cta_quests')}
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-forest-100 hover:text-white font-medium text-base hover:bg-forest-700/50 transition-all"
            >
              <Compass className="w-5 h-5 text-quest" />
              {t('hero.cta_map')}
            </Link>
          </div>
        </div>
      </section>

      {/* Real Computations Impact Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.total_reports')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-forest-900">
              {metrics ? metrics.metrics.total_reports.combined : '...'}
            </span>
            {metrics && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {metrics.metrics.total_reports.live} live
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 block">Separated from demo records</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.resolved_cases')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {metrics ? metrics.metrics.resolved_reports.combined : '...'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] text-stone-400 block">Verified resolution evidence</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.active_quests')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-quest">
              {metrics ? metrics.metrics.active_quests.combined : '...'}
            </span>
            <Users className="w-4 h-4 text-quest" />
          </div>
          <span className="text-[11px] text-stone-400 block">Active neighborhood squads</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {t('stats.community_points')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">
              {metrics ? metrics.metrics.community_points.combined : '...'}
            </span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-stone-400 block">Deterministic & idempotent</span>
        </div>
      </section>

      {/* Signature Feature: City Quest Mode Showcase */}
      <section className="rounded-3xl bg-cream-50 border border-cream-300 p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-quest/15 text-quest font-bold text-xs uppercase tracking-wider mb-2">
              Signature Feature
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              City Quest Mode: Civic Issues as Team Missions
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-xl">
              Verified problems don't sit in an admin queue. They become actionable missions where neighbors rally to document progress and hold cities accountable.
            </p>
          </div>
          <Link
            to="/quests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white font-semibold text-sm hover:bg-forest-800 transition-colors shrink-0"
          >
            All Active Quests
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeQuests.map((quest) => (
            <div
              key={quest.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-quest uppercase tracking-wider">
                    Reward: +{quest.points_reward} pts
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Squad: {quest.current_contributors}/{quest.target_contributors}
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900 line-clamp-2">
                  {quest.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-3">
                  {quest.objective}
                </p>
              </div>

              <div className="pt-4 border-t border-cream-200 mt-4 flex items-center justify-between">
                <Link
                  to={`/quests/${quest.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900"
                >
                  Join Mission Squad
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {quest.is_demo && (
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Demo Quest
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Map Preview & Recent Issues */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Open Civic Ledger & Map
            </h2>
            <p className="text-sm text-stone-600">
              Interactive neighborhood pins with before/after evidence photos.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900"
          >
            Full Map View
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CityMap reports={recentReports} height="420px" />
      </section>

      {/* How it Works Walkthrough */}
      <section className="py-6 border-t border-cream-300">
        <h2 className="text-center text-2xl font-extrabold text-stone-900 tracking-tight mb-10">
          How PatchMyCity Works: Transparent & Collaborative
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 font-extrabold text-lg">
              1
            </div>
            <h3 className="font-bold text-lg text-stone-900">Photo & AI Proposal</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload a problem photo. Gemini Vision proposes category, severity, and visible evidence. The citizen reviews, edits, and checks nearby duplicates before submitting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-quest/20 flex items-center justify-center text-quest font-extrabold text-lg">
              2
            </div>
            <h3 className="font-bold text-lg text-stone-900">City Quest Unlocked</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When an issue is verified, a City Quest unlocks for the neighborhood. Neighbors join the squad with clear safety rules and verifiable photographic missions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-lg">
              3
            </div>
            <h3 className="font-bold text-lg text-stone-900">Evidence & Verified Impact</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Squad members submit after-photos. Resolution requires verified evidence and admin or multi-citizen confirmation. Deterministic points and badges are awarded idempotently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
