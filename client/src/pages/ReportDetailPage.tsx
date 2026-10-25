import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  ThumbsUp,
  Camera,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Report, ReportEvent, ReportEvidence } from '../types/index.js';
import { StatusChip } from '../components/UI/StatusChip.js';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [report, setReport] = useState<Report | null>(null);
  const [events, setEvents] = useState<ReportEvent[]>([]);
  const [evidence, setEvidence] = useState<ReportEvidence[]>([]);
  const [loading, setLoading] = useState(true);

  // Evidence submission modal state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    api
      .getReportById(id)
      .then((data) => {
        setReport(data);
        setEvents(data.events || []);
        setEvidence(data.evidence || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSupport = async () => {
    if (!id) return;
    try {
      const res = await api.supportReport(id);
      alert(`Report Backed! ${res.point_status}`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !evidencePhotoUrl) return;

    setSubmittingEvidence(true);
    try {
      const res = await api.submitEvidence(id, {
        image_url: evidencePhotoUrl,
        notes: evidenceNotes,
      });

      alert(`Evidence Submitted! Points awarded: +${res.points?.points || 15} pts`);
      setShowEvidenceModal(false);
      setEvidencePhotoUrl('');
      setEvidenceNotes('');
      loadData();
    } catch (err: any) {
      alert(`Failed to submit evidence: ${err.message}`);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
        <p className="text-stone-500 font-medium text-sm">Loading issue details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Back Link */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Ledger & Map
      </Link>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full md:w-80 h-64 object-cover rounded-2xl border border-stone-200 shrink-0"
          />

          <div className="flex flex-col justify-between space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={report.status} />
                <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
                  {t(`categories.${report.category}`)}
                </span>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                  Severity: {t(`severities.${report.severity}`)}
                </span>
                {report.is_demo && (
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Demo Fixture
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug">
                {report.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-cream-200 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{report.address}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Filed: {new Date(report.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>Reported by: <strong>{report.reporter_name || 'Citizen'}</strong></span>
              </div>
            </div>

            {/* Action Buttons: Back It & Submit Evidence */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSupport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-700 text-white font-semibold text-xs hover:bg-forest-800 transition-colors shadow-2xs active:scale-95"
              >
                <ThumbsUp className="w-4 h-4 text-quest" />
                {t('report_detail.back_report')} ({report.supports_count})
              </button>

              <button
                type="button"
                onClick={() => setShowEvidenceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors shadow-2xs active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Submit Verification Photo (+15 pts)
              </button>
            </div>
          </div>
        </div>

        {/* Resolution Badge if Resolved */}
        {report.status === 'resolved' && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {report.resolution_type === 'admin_verified'
                ? t('report_detail.resolution_badge_admin')
                : t('report_detail.resolution_badge_community')}
            </span>
          </div>
        )}
      </div>

      {/* Two Column Layout: Evidence Gallery & Audit History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Evidence Gallery */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              {t('report_detail.evidence_gallery')} ({evidence.length})
            </h2>
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="text-xs font-bold text-forest-700 hover:text-forest-900"
            >
              + Add Evidence
            </button>
          </div>

          {evidence.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              {t('report_detail.no_evidence')}
            </p>
          ) : (
            <div className="space-y-3">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-cream-50 border border-cream-200"
                >
                  <img
                    src={item.image_url}
                    alt="Evidence"
                    className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-stone-900 block">
                      Submitted by {item.user_name || 'Volunteer Contributor'}
                    </span>
                    <p className="text-stone-600">{item.notes}</p>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                      Status: {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Append-only Audit Timeline */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            {t('report_detail.status_trail')}
          </h2>

          <div className="space-y-4 border-l-2 border-forest-100 pl-4 ml-2">
            {events.map((event) => (
              <div key={event.id} className="relative space-y-1 text-xs">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-forest-700 border-2 border-white" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 uppercase tracking-wide">
                    {event.to_status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-stone-600">{event.reason}</p>
                <span className="text-[10px] text-stone-500 font-medium block">
                  Actor: {event.actor_name || 'System / Officer'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">
              {t('quests.modal_evidence_title')}
            </h3>
            <p className="text-xs text-stone-500">
              Submit a clear photo showing repair work in progress or verified completion.
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

              {/* Sample pre-fill for demo convenience */}
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
                  placeholder="e.g. Municipal road team arrived with asphalt roller."
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
