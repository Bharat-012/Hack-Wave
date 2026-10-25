import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List, Filter, RefreshCw } from 'lucide-react';
import { api } from '../api/client.js';
import { CityMap } from '../components/Map/CityMap.js';
import { ReportListView } from '../components/Map/ReportListView.js';
import { Report } from '../types/index.js';

export const ExplorePage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadReports = () => {
    setLoading(true);
    api
      .getReports({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((data) => setReports(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            City Civic Ledger & Radar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time public infrastructure status across neighborhoods.
          </p>
        </div>

        {/* View Mode Toggle: Map vs List */}
        <div className="inline-flex items-center p-1 rounded-xl bg-white border border-cream-300 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'map'
                ? 'bg-forest-700 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-pressed={viewMode === 'map'}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Interactive Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-forest-700 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-pressed={viewMode === 'list'}
            aria-label="Accessible list view alternative"
          >
            <List className="w-3.5 h-3.5" />
            Accessible List
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-cream-300 shadow-2xs text-xs">
        <div className="flex items-center gap-1.5 font-bold text-stone-700">
          <Filter className="w-3.5 h-3.5 text-forest-700" />
          Filter:
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-stone-300 bg-cream-50 font-medium text-stone-800 outline-none"
        >
          <option value="">All Categories</option>
          <option value="roads_potholes">Roads & Potholes</option>
          <option value="streetlights_electricity">Streetlights & Electricity</option>
          <option value="sanitation_garbage">Sanitation & Garbage</option>
          <option value="water_drainage">Water & Drainage</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-stone-300 bg-cream-50 font-medium text-stone-800 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="in_progress">In Progress</option>
          <option value="awaiting_resolution_verification">Awaiting Verification</option>
          <option value="resolved">Resolved</option>
        </select>

        <span className="text-stone-400 ml-auto">
          Showing {reports.length} reports
        </span>
      </div>

      {/* Content Rendering: Map or Accessible List */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Loading reports ledger...</p>
        </div>
      ) : viewMode === 'map' ? (
        <CityMap reports={reports} height="600px" />
      ) : (
        <ReportListView reports={reports} />
      )}
    </div>
  );
};
