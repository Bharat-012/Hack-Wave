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
        // Check if demo user 1 is in members
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
        <p className="text-stone-500 font-medium text-sm">Loading mission file...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Back link */}
      <Link
        to="/quests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All City Quests
      </Link>

      {/* Main Quest Mission Card */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-quest uppercase tracking-wider block">
              City Mission Objective
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
              {quest.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-stone-500 block uppercase">Reward</span>
              <span className="text-lg font-black text-amber-600">+{quest.points_reward} pts</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-500 block uppercase">Squad</span>
              <span className="text-lg font-black text-forest-900">
                {quest.current_contributors}/{quest.target_contributors}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed bg-cream-50 p-4 rounded-2xl border border-cream-200">
          {quest.objective}
        </p>

        {/* Linked Issue Summary */}
        {quest.report && (
          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl border border-stone-200 bg-white">
            <img
              src={quest.report.image_url}
              alt={quest.report.title}
              className="w-full sm:w-28 h-24 object-cover rounded-xl"
            />
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                Linked Problem Report
              </span>
              <h3 className="font-bold text-sm text-stone-900">{quest.report.title}</h3>
              <p className="text-xs text-stone-500">{quest.report.address}</p>
              <Link
                to={`/reports/${quest.report.id}`}
                className="text-xs font-semibold text-forest-700 hover:text-forest-900 inline-block pt-1"
              >
                View Full Issue File & Map Pin →
              </Link>
            </div>
          </div>
        )}

        {/* Suggested Safe Actions Checklist */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Safe Mission Actions Checklist
          </h2>
          <div className="space-y-2">
            {quest.suggested_actions.map((act, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-900">{act.action}</span>
                  <p className="text-stone-500">{act.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-cream-200">
          {hasJoined ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-100 text-forest-900 font-semibold text-xs border border-forest-200">
              <CheckCircle2 className="w-4 h-4 text-forest-700" />
              Squad Member Enlisted
            </div>
          ) : (
            <button
              onClick={handleJoinSquad}
              disabled={joining}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-sm active:scale-95"
            >
              <Users className="w-4 h-4 text-quest" />
              {joining ? 'Enlisting...' : t('quests.join_squad')}
            </button>
          )}

          <button
            onClick={() => setShowEvidenceModal(true)}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4" />
            {t('quests.submit_evidence_btn')}
          </button>
        </div>
      </div>

      {/* Squad Volunteers Roster */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">
          Mission Squad Roster ({quest.members?.length || 0})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quest.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-cream-200 text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-xs">
                  {member.user_name?.[0] || 'V'}
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block">{member.user_name}</span>
                  <span className="text-[10px] text-stone-500">Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                </div>
              </div>

              {member.contributed ? (
                <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Evidence Contributed
                </span>
              ) : (
                <span className="text-[10px] text-stone-400 font-medium">
                  Enlisted
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Submission Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">
              {t('quests.modal_evidence_title')}
            </h3>
            <p className="text-xs text-stone-500">
              Submit photo proof showing that the repair or cleanup was performed.
            </p>

            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Photo URL</label>
                <input
                  type="url"
                  required
                  value={evidencePhotoUrl}
                  onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:border-forest-700 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setEvidencePhotoUrl(
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                  )
                }
                className="text-[11px] text-forest-700 font-semibold underline block"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:border-forest-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvidence || !evidencePhotoUrl}
                  className="px-5 py-2 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 disabled:opacity-50 transition-colors"
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
