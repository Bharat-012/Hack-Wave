import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Users,
  Trophy,
  Camera,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Check,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Quest } from '../types/index.js';

export const QuestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Evidence Modal
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const loadQuest = () => {
    if (!id) return;
    setLoading(true);
    api
      .getQuestById(id)
      .then((data) => {
        setQuest(data);
        const isMember = data.members?.some((m) => m.user_id === 'a0000000-0000-0000-0000-000000000001');
        setHasJoined(Boolean(isMember));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuest();
  }, [id]);

  const handleJoinSquad = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await api.joinQuest(id);
      setHasJoined(true);
      alert('Joined Quest Squad! Coordinate with neighbors to verify progress.');
      loadQuest();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quest?.report_id || !evidencePhotoUrl) return;

    setSubmittingEvidence(true);
    try {
      const res = await api.submitEvidence(quest.report_id, {
        image_url: evidencePhotoUrl,
        notes: evidenceNotes || `Quest evidence submitted for mission: ${quest.title}`,
      });

      alert(`Mission Evidence Submitted! Awarded +${res.points?.points || 15} civic points.`);
      setShowEvidenceModal(false);
      setEvidencePhotoUrl('');
      setEvidenceNotes('');
      loadQuest();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  if (loading || !quest) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
        <p className="text-stone-500 font-bold text-sm">Loading mission file...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Back link */}
      <Link
        to="/quests"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-quest" />
        All City Quests
      </Link>

      {/* Main Quest Mission Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/70 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-quest uppercase tracking-wider block">
              City Mission File
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug">
              {quest.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-black text-stone-400 block uppercase">Reward</span>
              <span className="text-xl font-black text-amber-600">+{quest.points_reward} pts</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-stone-400 block uppercase">Squad</span>
              <span className="text-xl font-black text-forest-900">
                {quest.current_contributors}/{quest.target_contributors}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed bg-stone-50/80 p-5 rounded-2xl border border-stone-200">
          {quest.objective}
        </p>

        {/* Linked Issue Summary */}
        {quest.report && (
          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl border border-stone-200 bg-white">
            <img
              src={quest.report.image_url}
              alt={quest.report.title}
              className="w-full sm:w-32 h-24 object-cover rounded-xl shrink-0"
            />
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wide">
                Originating Problem Report
              </span>
              <h3 className="font-extrabold text-sm text-stone-900">{quest.report.title}</h3>
              <p className="text-xs text-stone-500 line-clamp-1">📍 {quest.report.address}</p>
              <Link
                to={`/reports/${quest.report.id}`}
                className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-block pt-1"
              >
                View Full Issue & Map Pin →
              </Link>
            </div>
          </div>
        )}

        {/* Suggested Safe Actions Checklist */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-stone-800 uppercase tracking-wider">
            Safe Mission Actions Checklist
          </h2>
          <div className="space-y-2">
            {quest.suggested_actions.map((act, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/80 border border-stone-200 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-black text-stone-900">{act.action}</span>
                  <p className="text-stone-500 font-medium">{act.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-200/70">
          {hasJoined ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-100 text-forest-900 font-extrabold text-xs border border-forest-200">
              <CheckCircle2 className="w-4 h-4 text-forest-700" />
              Squad Member Enlisted
            </div>
          ) : (
            <button
              onClick={handleJoinSquad}
              disabled={joining}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-700 text-white font-extrabold text-xs hover:bg-forest-800 transition-all shadow-glow-forest active:scale-95"
            >
              <Users className="w-4 h-4 text-quest" />
              {joining ? 'Enlisting...' : t('quests.join_squad')}
            </button>
          )}

          <button
            onClick={() => setShowEvidenceModal(true)}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-700 transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4" />
            {t('quests.submit_evidence_btn')}
          </button>
        </div>
      </div>

      {/* Squad Volunteers Roster */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-black text-stone-900">
          Mission Squad Roster ({quest.members?.length || 0})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {quest.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-forest-700 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                  {member.user_name?.[0] || 'V'}
                </div>
                <div>
                  <span className="font-extrabold text-stone-900 block">{member.user_name}</span>
                  <span className="text-[10px] text-stone-400 font-medium">Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                </div>
              </div>

              {member.contributed ? (
                <span className="font-black text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Evidence Contributed
                </span>
              ) : (
                <span className="text-[10px] text-stone-400 font-bold">
                  Enlisted
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Submission Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {t('quests.modal_evidence_title')}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Submit photo proof showing that the repair or cleanup was performed.
              </p>
            </div>

            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Photo URL</label>
                <input
                  type="url"
                  required
                  value={evidencePhotoUrl}
                  onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:border-forest-700 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setEvidencePhotoUrl(
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                  )
                }
                className="text-[11px] text-forest-700 font-bold underline block"
              >
                Use sample patch photo (for demo)
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  {t('quests.modal_notes')}
                </label>
                <textarea
                  rows={2}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="e.g. Verified road patch completion from sidewalk."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:border-forest-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvidence || !evidencePhotoUrl}
                  className="px-5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submittingEvidence ? 'Submitting...' : t('quests.btn_submit_evidence')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
