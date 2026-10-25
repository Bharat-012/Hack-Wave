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
  Zap,
  TrendingUp,
  Shield,
  Activity,
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
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-[#12281D] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-forest-700/60">
        {/* Decorative background glow circles */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-quest/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
            {/* Live Ticker Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-forest-50 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-quest animate-ping" />
              <span>{t('hero.trusted_banner')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Report a problem. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quest to-emerald-400">
                Rally your neighborhood.
              </span> <br />
              Make change visible.
            </h1>

            <p className="text-base sm:text-lg text-forest-100 font-normal leading-relaxed max-w-2xl">
              {t('hero.subtitle')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-quest text-forest-900 font-extrabold text-sm sm:text-base hover:bg-quest-hover hover:text-white transition-all shadow-glow-quest active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                {t('hero.cta_report')}
              </Link>

              <Link
                to="/quests"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all backdrop-blur-md active:scale-95"
              >
                <ShieldCheck className="w-5 h-5 text-quest" />
                {t('hero.cta_quests')}
              </Link>

              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-forest-100 hover:text-white font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                <Compass className="w-5 h-5 text-quest" />
                {t('hero.cta_map')}
              </Link>
            </div>
          </div>

          {/* Right Floating Quest Spotlight Card */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-glass space-y-4 hover:border-quest/50 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-quest uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-quest text-quest" />
                  Active City Quest
                </span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +20 pts
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-snug">
                  Karol Bagh Pothole Evidence Patrol
                </h2>
                <p className="text-xs text-forest-100/80 mt-1 line-clamp-2">
                  Documenting asphalt patching progress from pedestrian sidewalk.
                </p>
              </div>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-forest-900 flex items-center justify-center text-[10px] font-bold">A</div>
                  <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-forest-900 flex items-center justify-center text-[10px] font-bold">P</div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-forest-900 flex items-center justify-center text-[10px] font-bold">R</div>
                </div>
                <span className="text-xs text-forest-100 font-semibold">2/3 Enlisted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Computations Impact Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
              {t('stats.total_reports')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-forest-900">
              {metrics ? metrics.metrics.total_reports.combined : '...'}
            </span>
            {metrics && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {metrics.metrics.total_reports.live} live
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 font-medium block">
            Separated from seeded demo records
          </span>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
              {t('stats.resolved_cases')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-700">
              {metrics ? metrics.metrics.resolved_reports.combined : '...'}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium block">
            Backed by accepted after-photos
          </span>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
              {t('stats.active_quests')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-50 text-quest-dark flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-quest-dark">
              {metrics ? metrics.metrics.active_quests.combined : '...'}
            </span>
            <span className="text-[11px] font-bold text-lime-900 bg-lime-100 px-2 py-0.5 rounded-full">
              Missions
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium block">
            Active neighborhood squads
          </span>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
              {t('stats.community_points')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-700">
              {metrics ? metrics.metrics.community_points.combined : '...'}
            </span>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
              Points
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium block">
            Deterministic & idempotent awards
          </span>
        </div>
      </section>

      {/* Signature Feature: City Quest Mode Showcase */}
      <section className="rounded-3xl bg-gradient-to-b from-stone-100/70 to-cream-200/50 border border-stone-200/80 p-8 sm:p-10 space-y-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-quest/15 text-quest-dark font-extrabold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Signature Innovation
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              City Quest Mode: Civic Problems as Team Missions
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-xl">
              Verified problems don't sit in an admin queue. They become actionable missions where neighbors rally to document progress and hold cities accountable.
            </p>
          </div>
          <Link
            to="/quests"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-sm shrink-0 active:scale-95"
          >
            All Active Quests
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeQuests.map((quest) => (
            <div
              key={quest.id}
              className="glass-card flex flex-col justify-between p-6 rounded-3xl space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-quest-dark uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    +{quest.points_reward} pts
                  </span>
                  <span className="text-[11px] text-stone-600 font-bold bg-stone-100 px-2.5 py-1 rounded-full">
                    Squad: {quest.current_contributors}/{quest.target_contributors}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-stone-900 line-clamp-2 leading-snug">
                  {quest.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {quest.objective}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
                <Link
                  to={`/quests/${quest.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900"
                >
                  Join Mission Squad
                  <ArrowRight className="w-3.5 h-3.5 text-quest" />
                </Link>
                {quest.is_demo && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Demo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Map Preview & Recent Issues */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Open Civic Ledger & Radar
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Interactive neighborhood pins with before/after evidence photos.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-forest-700 hover:text-forest-900"
          >
            Full Map & Accessible Table View
            <ArrowRight className="w-4 h-4 text-quest" />
          </Link>
        </div>

        <CityMap reports={recentReports} height="440px" />
      </section>

      {/* How it Works Walkthrough */}
      <section className="py-6 border-t border-stone-200/80">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-extrabold text-quest-dark uppercase tracking-wider">
            Architecture Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            How PatchMyCity Works: Transparent & Collaborative
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-black text-lg shadow-2xs">
              1
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">Photo & AI Proposal</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload a problem photo. Gemini Vision proposes category, severity, and visible evidence. The citizen reviews, edits, and checks nearby duplicates before submitting.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-quest/20 text-quest-dark flex items-center justify-center font-black text-lg shadow-2xs">
              2
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">City Quest Unlocked</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When an issue is verified, a City Quest unlocks for the neighborhood. Neighbors join the squad with clear safety rules and verifiable photographic missions.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg shadow-2xs">
              3
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">Evidence & Verified Impact</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Squad members submit after-photos. Resolution requires verified evidence and admin or multi-citizen confirmation. Deterministic points and badges are awarded idempotently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
