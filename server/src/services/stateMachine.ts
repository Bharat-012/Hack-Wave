import { v4 as uuidv4 } from 'uuid';
import { DOMAIN_RULES } from '../config/constants.js';
import { Report, ReportStatus, UserProfile } from '../types/index.js';
import { store } from './store.js';

export interface TransitionResult {
  success: boolean;
  error?: string;
  report?: Report;
}

export class StateMachine {
  /**
   * Validate and execute a report status transition
   */
  public static transitionReport(
    reportId: string,
    toStatus: ReportStatus,
    actor: UserProfile,
    reason: string,
    resolutionType?: 'admin_verified' | 'community_verified'
  ): TransitionResult {
    const report = store.reports.get(reportId);
    if (!report) {
      return { success: false, error: `Report ${reportId} not found.` };
    }

    const currentStatus = report.status;

    // Check if the transition is defined in the lifecycle rules
    const allowedTargets = DOMAIN_RULES.LIFECYCLE_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(toStatus)) {
      return {
        success: false,
        error: `Illegal state transition from '${currentStatus}' to '${toStatus}'. Allowed transitions: [${allowedTargets.join(', ')}]`,
      };
    }

    // Role and permission checks
    if (toStatus === 'verified' || toStatus === 'rejected') {
      if (actor.role !== 'admin' && actor.role !== 'moderator') {
        return { success: false, error: 'Only moderators or administrators can verify or reject reports.' };
      }
    }

    // Resolution requirements (Section 5.1):
    // Requires at least one accepted evidence item AND (admin confirmation OR 3 distinct non-reporter community confirmations)
    if (toStatus === 'resolved') {
      const acceptedEvidence = Array.from(store.reportEvidence.values()).filter(
        (e) => e.report_id === reportId && e.status === 'accepted'
      );

      if (acceptedEvidence.length < DOMAIN_RULES.RESOLUTION.MIN_ACCEPTED_EVIDENCE) {
        return {
          success: false,
          error: `Resolution requires at least ${DOMAIN_RULES.RESOLUTION.MIN_ACCEPTED_EVIDENCE} accepted evidence photo. Current: ${acceptedEvidence.length}.`,
        };
      }

      if (resolutionType === 'admin_verified') {
        if (actor.role !== 'admin') {
          return { success: false, error: 'Only an administrator can apply admin_verified resolution.' };
        }
      } else if (resolutionType === 'community_verified') {
        // Count distinct non-reporter supports or evidence submitters
        const communitySupporters = Array.from(store.reportSupports.values()).filter(
          (s) => s.report_id === reportId && s.user_id !== report.reporter_id
        );
        const communityEvidenceSubmitters = acceptedEvidence.filter(
          (e) => e.user_id !== report.reporter_id
        );
        const distinctCommunityUsers = new Set([
          ...communitySupporters.map((s) => s.user_id),
          ...communityEvidenceSubmitters.map((e) => e.user_id),
        ]);

        if (distinctCommunityUsers.size < DOMAIN_RULES.RESOLUTION.COMMUNITY_CONFIRMATION_MIN_COUNT) {
          return {
            success: false,
            error: `Community resolution requires at least ${DOMAIN_RULES.RESOLUTION.COMMUNITY_CONFIRMATION_MIN_COUNT} distinct non-reporter community confirmations. Current: ${distinctCommunityUsers.size}.`,
          };
        }
      } else {
        return { success: false, error: 'Resolution must specify resolution_type: admin_verified or community_verified.' };
      }

      report.resolution_type = resolutionType;
    }

    // Mutate state
    const previousStatus = report.status;
    report.status = toStatus;
    report.updated_at = new Date().toISOString();

    // Append-only audit record
    store.reportEvents.push({
      id: uuidv4(),
      report_id: reportId,
      actor_id: actor.id,
      actor_name: actor.display_name,
      from_status: previousStatus,
      to_status: toStatus,
      reason,
      created_at: new Date().toISOString(),
    });

    return { success: true, report };
  }
}
