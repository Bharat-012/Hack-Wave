import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Users,
  Trophy,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Quest } from '../types/index.js';

export const QuestsPage: React.FC = () => {
  const { t } = useTranslation();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getQuests()
      .then((data) => setQuests(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-quest/15 text-quest-dark font-black text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Collaborative Action
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
          {t('quests.title')}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {t('quests.subtitle')}
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="flex items-start gap-3.5 p-4 rounded-3xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-amber-950 block">{t('quests.safety_first')}</span>
          <p className="mt-0.5 text-amber-800 leading-relaxed">{t('quests.safety_notice')}</p>
        </div>
      </div>

      {/* Quests Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-bold">Mobilizing active neighborhood missions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => {
            const percentage = Math.round((quest.current_contributors / quest.target_contributors) * 100);
            return (
              <div
                key={quest.id}
                className="glass-card flex flex-col justify-between p-7 rounded-3xl space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-quest-dark uppercase tracking-wider flex items-center gap-1.5 bg-lime-100/80 px-3 py-1 rounded-full">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      +{quest.points_reward} pts
                    </span>
                    <span className="text-xs font-extrabold text-stone-700 bg-stone-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-forest-700" />
                      {quest.current_contributors}/{quest.target_contributors} Enlisted
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-stone-900 line-clamp-2 leading-tight">
                      {quest.title}
                    </h2>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mt-1.5">
                      {quest.objective}
                    </p>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                      <span>Squad Enlistment</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-quest h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {quest.report && (
                    <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-xs space-y-1">
                      <span className="font-extrabold text-stone-800 block text-[11px] uppercase tracking-wide">
                        Linked Problem Report:
                      </span>
                      <p className="text-stone-700 font-semibold line-clamp-1">{quest.report.title}</p>
                      <span className="text-[10px] text-stone-400 block truncate">📍 {quest.report.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
                  <Link
                    to={`/quests/${quest.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-2xs active:scale-95"
                  >
                    View Mission File
                    <ArrowRight className="w-3.5 h-3.5 text-quest" />
                  </Link>

                  {quest.is_demo && (
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Demo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
