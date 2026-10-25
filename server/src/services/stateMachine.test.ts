import { describe, expect, it } from 'vitest';
import { UserProfile } from '../types/index.js';
import { StateMachine } from './stateMachine.js';
import { store } from './store.js';

describe('StateMachine & Report Lifecycle', () => {
  const citizenActor: UserProfile = {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'aarav_civic',
    display_name: 'Aarav Sharma',
    role: 'citizen',
    points_total: 85,
    is_demo: true,
    created_at: '',
    updated_at: '',
  };

  const moderatorActor: UserProfile = {
    id: 'a0000000-0000-0000-0000-000000000003',
    username: 'rohan_mod',
    display_name: 'Rohan Verma',
    role: 'moderator',
    points_total: 220,
    is_demo: true,
    created_at: '',
    updated_at: '',
  };

  it('allows valid transition from submitted to under_review', () => {
    // Report 3 is currently awaiting_resolution_verification, let's create a temporary report
    const tempReportId = 'test-report-1';
    store.reports.set(tempReportId, {
      id: tempReportId,
      reporter_id: citizenActor.id,
      title: 'Test Pothole',
      description: 'Test description for lifecycle',
      category: 'roads_potholes',
      severity: 'medium',
      status: 'submitted',
      latitude: 28.6,
      longitude: 77.2,
      address: 'Test Rd',
      image_url: 'http://test.jpg',
      supports_count: 0,
      evidence_count: 0,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = StateMachine.transitionReport(tempReportId, 'under_review', citizenActor, 'Under review by team');
    expect(res.success).toBe(true);
    expect(res.report?.status).toBe('under_review');
  });

  it('rejects illegal transition directly from submitted to in_progress', () => {
    const tempReportId = 'test-report-2';
    store.reports.set(tempReportId, {
      id: tempReportId,
      reporter_id: citizenActor.id,
      title: 'Illegal Skip',
      description: 'Trying to skip steps',
      category: 'roads_potholes',
      severity: 'medium',
      status: 'submitted',
      latitude: 28.6,
      longitude: 77.2,
      address: 'Test Rd',
      image_url: 'http://test.jpg',
      supports_count: 0,
      evidence_count: 0,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = StateMachine.transitionReport(tempReportId, 'in_progress', citizenActor, 'Skipping review');
    expect(res.success).toBe(false);
    expect(res.error).toContain("Illegal state transition from 'submitted' to 'in_progress'");
  });

  it('prevents regular citizen from verifying a report', () => {
    const tempReportId = 'test-report-3';
    store.reports.set(tempReportId, {
      id: tempReportId,
      reporter_id: citizenActor.id,
      title: 'Citizen verification attempt',
      description: 'Needs moderator',
      category: 'roads_potholes',
      severity: 'medium',
      status: 'under_review',
      latitude: 28.6,
      longitude: 77.2,
      address: 'Test Rd',
      image_url: 'http://test.jpg',
      supports_count: 0,
      evidence_count: 0,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = StateMachine.transitionReport(tempReportId, 'verified', citizenActor, 'Self-verifying');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Only moderators or administrators can verify');
  });
});
