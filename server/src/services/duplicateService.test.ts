import { describe, expect, it } from 'vitest';
import { DuplicateService } from './duplicateService.js';
import { store } from './store.js';

describe('DuplicateService & Geospatial Distance', () => {
  it('correctly calculates Haversine distance in meters', () => {
    // Distance between Karol Bagh coords and a point ~50m away
    const lat1 = 28.6448;
    const lon1 = 77.2167;
    const lat2 = 28.6452;
    const lon2 = 77.2167;

    const distance = DuplicateService.haversineDistanceMeters(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(30);
    expect(distance).toBeLessThan(60);
  });

  it('suggests duplicate when distance is within 100m, category matches, and report is recent', () => {
    const nearbyReportId = 'nearby-pothole-test';
    store.reports.set(nearbyReportId, {
      id: nearbyReportId,
      reporter_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Nearby Pothole',
      description: 'Right next to original pothole',
      category: 'roads_potholes',
      severity: 'high',
      status: 'submitted',
      latitude: 28.6449, // ~15m away
      longitude: 77.2167,
      address: 'Karol Bagh',
      image_url: 'http://test.jpg',
      supports_count: 0,
      evidence_count: 0,
      is_demo: true,
      created_at: new Date().toISOString(), // recent
      updated_at: new Date().toISOString(),
    });

    const duplicates = DuplicateService.findDuplicates(28.6448, 77.2167, 'roads_potholes', 'dummy-id');
    const matched = duplicates.find((d) => d.report.id === nearbyReportId);

    expect(matched).toBeDefined();
    expect(matched?.distanceMeters).toBeLessThan(30);
    expect(matched?.score).toBeGreaterThanOrEqual(0.6);
  });

  it('ignores candidate if distance exceeds 100 meters', () => {
    const farReportId = 'far-away-test';
    store.reports.set(farReportId, {
      id: farReportId,
      reporter_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Far Away Pothole',
      description: 'Kilometers away',
      category: 'roads_potholes',
      severity: 'high',
      status: 'submitted',
      latitude: 28.7000, // ~6km away
      longitude: 77.2167,
      address: 'North Delhi',
      image_url: 'http://test.jpg',
      supports_count: 0,
      evidence_count: 0,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const duplicates = DuplicateService.findDuplicates(28.6448, 77.2167, 'roads_potholes', 'dummy-id');
    const farMatch = duplicates.find((d) => d.report.id === farReportId);
    expect(farMatch).toBeUndefined();
  });
});
