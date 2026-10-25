import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Report } from '../types/index.js';
import { StatusChip } from '../components/UI/StatusChip.js';

export const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  const loadReports = () => {
    setLoading(true);
    api
      .getReports()
      .then((data) => setReports(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleTransition = async (
    reportId: string,
    toStatus: string,
    reason: string,
    resolutionType?: string
  ) => {
    setTransitioningId(reportId);
    try {
      await api.transitionReport(reportId, {
        to_status: toStatus,
        reason,
        resolution_type: resolutionType,
      });

      // If transitioning to verified, also auto-draft a quest if needed
      if (toStatus === 'verified') {
        const report = reports.find((r) => r.id === reportId);
        if (report) {
          try {
            await api.generateQuestDraft(reportId, report.title, report.category, report.description);
          } catch (e) {
            console.warn('Auto quest draft failed', e);
          }
        }
      }

      alert(`Status transitioned to '${toStatus}' successfully!`);
      loadReports();
    } catch (err: any) {
      alert(`Transition error: ${err.message}`);
    } finally {
      setTransitioningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
          Authority & Moderation Panel
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Civic Ledger Governance & State Machine
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
          Review reported issues, apply immutable lifecycle state transitions, and enforce verification standards.
        </p>
      </div>

      {/* Safety & Audit Principles Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
        <span className="font-bold block">Operating Constraint: Enforced Server State Machine</span>
        <p className="text-amber-800">
          The frontend cannot directly change statuses. Every transition is audited in the append-only <code>report_events</code> table. Resolution requires accepted evidence and admin/community confirmation.
        </p>
      </div>

      {/* Reports Table for Moderation */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Loading issues for review...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-cream-300 bg-white shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cream-300 bg-cream-50 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                <th scope="col" className="py-4 px-6">Issue</th>
                <th scope="col" className="py-4 px-6">Category & Severity</th>
                <th scope="col" className="py-4 px-6">Current Status</th>
                <th scope="col" className="py-4 px-6">Evidence Items</th>
                <th scope="col" className="py-4 px-6 text-right">Allowed Transition Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-sm">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="py-4 px-6 max-w-xs">
                    <span className="font-bold text-stone-900 block line-clamp-1">{report.title}</span>
                    <span className="text-xs text-stone-500 line-clamp-1">{report.address}</span>
                    {report.is_demo && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                        Demo
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs font-medium text-stone-700 block">
                      {t(`categories.${report.category}`)}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 uppercase">
                      {report.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <StatusChip status={report.status} />
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap font-semibold text-stone-700">
                    {report.evidence_count} photos
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* submitted -> under_review */}
                      {report.status === 'submitted' && (
                        <button
                          type="button"
                          disabled={transitioningId === report.id}
                          onClick={() => handleTransition(report.id, 'under_review', 'Officer started initial review')}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200"
                        >
                          Mark Under Review
                        </button>
                      )}

                      {/* under_review -> verified */}
                      {report.status === 'under_review' && (
                        <button
                          type="button"
                          disabled={transitioningId === report.id}
                          onClick={() => handleTransition(report.id, 'verified', 'Physical inspection coordinates verified')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                        >
                          Verify & Spawn Quest (+10 pts)
                        </button>
                      )}

                      {/* verified -> in_progress */}
                      {report.status === 'verified' && (
                        <button
                          type="button"
                          disabled={transitioningId === report.id}
                          onClick={() => handleTransition(report.id, 'in_progress', 'Municipal division crew assigned')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                        >
                          Dispatch Crew
                        </button>
                      )}

                      {/* in_progress -> awaiting_resolution_verification */}
                      {report.status === 'in_progress' && (
                        <button
                          type="button"
                          disabled={transitioningId === report.id}
                          onClick={() => handleTransition(report.id, 'awaiting_resolution_verification', 'Repair team logged completion; awaiting citizen sign-off')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                        >
                          Awaiting Sign-off
                        </button>
                      )}

                      {/* awaiting_resolution_verification -> resolved */}
                      {report.status === 'awaiting_resolution_verification' && (
                        <button
                          type="button"
                          disabled={transitioningId === report.id}
                          onClick={() => handleTransition(report.id, 'resolved', 'Admin validated after-photos', 'admin_verified')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                        >
                          Admin Sign-off & Close
                        </button>
                      )}

                      {/* Reject option for early states */}
                      {(report.status === 'submitted' || report.status === 'under_review') && (
                        <button
                          type="button"
                          disabled={transitioningId === report.id}
                          onClick={() => handleTransition(report.id, 'rejected', 'Invalid report or out of municipal jurisdiction')}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
