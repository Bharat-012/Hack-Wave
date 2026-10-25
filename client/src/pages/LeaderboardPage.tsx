import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Award, Sparkles, Camera, ShieldCheck, Users, RefreshCw, Zap } from 'lucide-react';
import { api } from '../api/client.js';
import { UserProfile } from '../types/index.js';

export const LeaderboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLeaderboard()
      .then((data) => setProfiles(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-blue-500" />;
      case 'Users':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Community Reputation & Honors
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
          {t('leaderboard.title')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
          {t('leaderboard.subtitle')}
        </p>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-bold">Loading civic rankings...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white/90 backdrop-blur-md shadow-glass">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/80 text-xs font-black text-stone-600 uppercase tracking-wider">
                <th scope="col" className="py-4 px-6 w-20">{t('leaderboard.rank')}</th>
                <th scope="col" className="py-4 px-6">{t('leaderboard.citizen')}</th>
                <th scope="col" className="py-4 px-6">{t('leaderboard.role')}</th>
                <th scope="col" className="py-4 px-6">{t('leaderboard.badges')}</th>
                <th scope="col" className="py-4 px-6 text-right">{t('leaderboard.points')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 text-sm">
              {profiles.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-4 px-6 font-black text-base text-stone-900">
                    {user.rank === 1 && <span className="text-amber-500">🥇 1</span>}
                    {user.rank === 2 && <span className="text-stone-400">🥈 2</span>}
                    {user.rank === 3 && <span className="text-amber-700">🥉 3</span>}
                    {user.rank && user.rank > 3 && <span className="text-stone-500 font-bold">#{user.rank}</span>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
                        {user.display_name[0]}
                      </div>
                      <div>
                        <span className="font-extrabold text-stone-900 block leading-tight">
                          {user.display_name}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {user.badges?.map((b) => (
                        <div
                          key={b.id}
                          title={`${i18n.language === 'hi' ? b.name_hi : b.name} - ${b.criteria}`}
                          className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 shadow-2xs"
                        >
                          {getBadgeIcon(b.icon_name)}
                          <span className="text-[11px] font-semibold hidden sm:inline">
                            {i18n.language === 'hi' ? b.name_hi : b.name}
                          </span>
                        </div>
                      ))}
                      {(!user.badges || user.badges.length === 0) && (
                        <span className="text-xs text-stone-400 font-medium">No badges yet</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-black text-base text-forest-900">
                    {user.points_total} <span className="text-xs text-quest-dark font-extrabold">pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Point Rules Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-base font-black text-stone-900">
            Deterministic Civic Points Rules
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-black text-emerald-700 text-lg block">+10 pts</span>
            <span className="font-extrabold text-stone-900 block">Verified Report</span>
            <p className="text-stone-500 text-[11px] leading-relaxed">Awarded to reporter when issue is verified by moderators.</p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-black text-blue-700 text-lg block">+2 pts</span>
            <span className="font-extrabold text-stone-900 block">Community Backing</span>
            <p className="text-stone-500 text-[11px] leading-relaxed">Supporting an existing report (max 3 supports per day).</p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-black text-amber-700 text-lg block">+15 pts</span>
            <span className="font-extrabold text-stone-900 block">Accepted Evidence</span>
            <p className="text-stone-500 text-[11px] leading-relaxed">Submitting clean after-photos or repair verification photos.</p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-black text-quest-dark text-lg block">+20 pts</span>
            <span className="font-extrabold text-stone-900 block">Quest Completion</span>
            <p className="text-stone-500 text-[11px] leading-relaxed">Contributed evidence towards completed City Quest mission.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
