import { v4 as uuidv4 } from 'uuid';
import { DOMAIN_RULES } from '../config/constants.js';
import { PointTransaction } from '../types/index.js';
import { store } from './store.js';

export interface AwardPointsResult {
  awarded: boolean;
  points: number;
  reason?: string;
  transaction?: PointTransaction;
}

export class PointsService {
  /**
   * Award deterministic points with idempotent constraint
   */
  public static awardPoints(
    userId: string,
    eventType: PointTransaction['event_type'],
    sourceId: string,
    customPoints?: number
  ): AwardPointsResult {
    const user = store.profiles.get(userId);
    if (!user) {
      return { awarded: false, points: 0, reason: `User ${userId} not found.` };
    }

    const idempotencyKey = `${eventType}:${sourceId}:${userId}`;

    // 1. Idempotency Check
    if (store.pointTransactions.has(idempotencyKey)) {
      return {
        awarded: false,
        points: 0,
        reason: `Points already awarded for idempotency key: ${idempotencyKey}`,
      };
    }

    // 2. Determine base points
    let pointsToAward = customPoints ?? 0;
    if (customPoints === undefined) {
      switch (eventType) {
        case 'report_verified':
          pointsToAward = DOMAIN_RULES.POINTS.REPORT_VERIFIED;
          break;
        case 'report_supported':
          pointsToAward = DOMAIN_RULES.POINTS.REPORT_SUPPORTED;
          break;
        case 'evidence_accepted':
          pointsToAward = DOMAIN_RULES.POINTS.EVIDENCE_ACCEPTED;
          break;
        case 'quest_completed':
          pointsToAward = DOMAIN_RULES.POINTS.QUEST_COMPLETED;
          break;
        case 'moderation_penalty':
          pointsToAward = -10;
          break;
      }
    }

    // 3. Daily Cap & Anti-Farming Check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const userTodayTransactions = Array.from(store.pointTransactions.values()).filter(
      (tx) => tx.user_id === userId && new Date(tx.created_at) >= startOfToday
    );

    // Support daily cap check (max 3 supports per day)
    if (eventType === 'report_supported') {
      const todaySupports = userTodayTransactions.filter((tx) => tx.event_type === 'report_supported');
      if (todaySupports.length >= DOMAIN_RULES.POINTS.MAX_DAILY_SUPPORTS) {
        return {
          awarded: false,
          points: 0,
          reason: `Daily support cap reached (${DOMAIN_RULES.POINTS.MAX_DAILY_SUPPORTS} per day).`,
        };
      }
    }

    // Overall daily cap
    const todayEarned = userTodayTransactions.reduce((acc, tx) => acc + (tx.points > 0 ? tx.points : 0), 0);
    if (todayEarned + pointsToAward > DOMAIN_RULES.POINTS.DAILY_POINT_CAP) {
      pointsToAward = Math.max(0, DOMAIN_RULES.POINTS.DAILY_POINT_CAP - todayEarned);
      if (pointsToAward === 0) {
        return {
          awarded: false,
          points: 0,
          reason: `Daily point cap (${DOMAIN_RULES.POINTS.DAILY_POINT_CAP} pts) reached for today.`,
        };
      }
    }

    // 4. Record Transaction
    const tx: PointTransaction = {
      id: uuidv4(),
      user_id: userId,
      points: pointsToAward,
      event_type: eventType,
      source_id: sourceId,
      idempotency_key: idempotencyKey,
      created_at: new Date().toISOString(),
    };

    store.pointTransactions.set(idempotencyKey, tx);
    user.points_total = Math.max(0, user.points_total + pointsToAward);
    user.updated_at = new Date().toISOString();

    // 5. Evaluate Badges
    this.evaluateBadges(userId);

    return { awarded: true, points: pointsToAward, transaction: tx };
  }

  /**
   * Rule-based server-side badge evaluations
   */
  public static evaluateBadges(userId: string) {
    const user = store.profiles.get(userId);
    if (!user) return;

    const existingBadgeIds = new Set(
      store.userBadges.filter((ub) => ub.user_id === userId).map((ub) => ub.badge_id)
    );

    // Badge 1: first_verified_report
    if (!existingBadgeIds.has('first_verified_report')) {
      const hasVerifiedReport = Array.from(store.reports.values()).some(
        (r) => r.reporter_id === userId && (r.status === 'verified' || r.status === 'resolved' || r.status === 'in_progress')
      );
      if (hasVerifiedReport) {
        store.userBadges.push({
          id: uuidv4(),
          user_id: userId,
          badge_id: 'first_verified_report',
          earned_at: new Date().toISOString(),
          badge: store.badges.get('first_verified_report'),
        });
      }
    }

    // Badge 2: evidence_hero (3+ accepted evidence)
    if (!existingBadgeIds.has('evidence_hero')) {
      const acceptedEvidenceCount = Array.from(store.reportEvidence.values()).filter(
        (e) => e.user_id === userId && e.status === 'accepted'
      ).length;
      if (acceptedEvidenceCount >= 3) {
        store.userBadges.push({
          id: uuidv4(),
          user_id: userId,
          badge_id: 'evidence_hero',
          earned_at: new Date().toISOString(),
          badge: store.badges.get('evidence_hero'),
        });
      }
    }

    // Badge 3: team_player (1 completed quest participation)
    if (!existingBadgeIds.has('team_player')) {
      const completedQuestParticipations = Array.from(store.questMembers.values()).some((qm) => {
        if (qm.user_id !== userId || !qm.contributed) return false;
        const quest = store.quests.get(qm.quest_id);
        return quest?.status === 'completed';
      });
      if (completedQuestParticipations) {
        store.userBadges.push({
          id: uuidv4(),
          user_id: userId,
          badge_id: 'team_player',
          earned_at: new Date().toISOString(),
          badge: store.badges.get('team_player'),
        });
      }
    }

    // Badge 4: neighborhood_guardian (100+ points)
    if (!existingBadgeIds.has('neighborhood_guardian')) {
      if (user.points_total >= 100) {
        store.userBadges.push({
          id: uuidv4(),
          user_id: userId,
          badge_id: 'neighborhood_guardian',
          earned_at: new Date().toISOString(),
          badge: store.badges.get('neighborhood_guardian'),
        });
      }
    }
  }
}
