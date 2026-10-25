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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-quest/15 text-quest font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Collaborative Action
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          {t('quests.title')}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {t('quests.subtitle')}
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">{t('quests.safety_first')}</span>
          <p className="mt-0.5">{t('quests.safety_notice')}</p>
        </div>
      </div>

      {/* Quests Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Loading active neighborhood missions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-cream-300 shadow-2xs hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-quest uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    +{quest.points_reward} pts
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-semibold bg-cream-100 px-2.5 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5 text-forest-700" />
                    Squad: {quest.current_contributors}/{quest.target_contributors}
                  </span>
                </div>

                <h2 className="text-base font-bold text-stone-900 line-clamp-2">
                  {quest.title}
                </h2>

                <p className="text-xs text-stone-600 line-clamp-3">
                  {quest.objective}
                </p>

                {quest.report && (
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs space-y-1">
                    <span className="font-bold text-stone-700 block">Linked Problem:</span>
                    <p className="text-stone-600 line-clamp-1">{quest.report.title}</p>
                    <span className="text-[10px] text-stone-500 block">{quest.report.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
                <Link
                  to={`/quests/${quest.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white font-semibold text-xs hover:bg-forest-800 transition-colors shadow-2xs"
                >
                  View Mission Details
                  <ArrowRight className="w-3.5 h-3.5" />
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
      )}
    </div>
  );
};
