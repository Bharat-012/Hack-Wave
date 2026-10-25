import { describe, expect, it } from 'vitest';
import { PointsService } from './pointsService.js';
import { store } from './store.js';

describe('PointsService & Idempotency', () => {
  const userId = 'a0000000-0000-0000-0000-000000000001';
  const initialPoints = store.profiles.get(userId)?.points_total || 0;

  it('awards points once and rejects duplicate calls with same idempotency key', () => {
    const sourceId = 'unique-test-source-1';
    const firstAttempt = PointsService.awardPoints(userId, 'report_verified', sourceId);
    expect(firstAttempt.awarded).toBe(true);
    expect(firstAttempt.points).toBe(10);

    // Duplicate call with same parameters
    const secondAttempt = PointsService.awardPoints(userId, 'report_verified', sourceId);
    expect(secondAttempt.awarded).toBe(false);
    expect(secondAttempt.points).toBe(0);
    expect(secondAttempt.reason).toContain('already awarded');
  });

  it('enforces daily support cap of 3 supports per day', () => {
    const testUserId = 'test-support-user-1';
    store.profiles.set(testUserId, {
      id: testUserId,
      username: 'support_tester',
      display_name: 'Support Tester',
      role: 'citizen',
      points_total: 0,
      is_demo: true,
      created_at: '',
      updated_at: '',
    });

    const res1 = PointsService.awardPoints(testUserId, 'report_supported', 'r1');
    const res2 = PointsService.awardPoints(testUserId, 'report_supported', 'r2');
    const res3 = PointsService.awardPoints(testUserId, 'report_supported', 'r3');
    const res4 = PointsService.awardPoints(testUserId, 'report_supported', 'r4');

    expect(res1.awarded).toBe(true);
    expect(res2.awarded).toBe(true);
    expect(res3.awarded).toBe(true);
    // 4th support in same day must be rejected by daily cap
    expect(res4.awarded).toBe(false);
    expect(res4.reason).toContain('Daily support cap reached');
  });
});
