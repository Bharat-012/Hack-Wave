import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List, Filter, RefreshCw, Layers, Sparkles, X } from 'lucide-react';
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

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 font-extrabold text-xs uppercase tracking-wider mb-1.5">
            <Layers className="w-3.5 h-3.5 text-forest-700" />
            Live Civic GIS
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            City Civic Ledger & Radar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Real-time public infrastructure status across neighborhoods with photo evidence.
          </p>
        </div>

        {/* View Mode Toggle: Segmented Glass Control */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-stone-200/50 backdrop-blur-md border border-stone-200/70 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-forest-700 text-white shadow-xs'
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-forest-700 text-white shadow-xs'
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
      <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-stone-800">
            <Filter className="w-3.5 h-3.5 text-forest-700" />
            Filter by:
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800 outline-none shadow-2xs hover:border-stone-300 transition-colors"
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
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800 outline-none shadow-2xs hover:border-stone-300 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_resolution_verification">Awaiting Verification</option>
            <option value="resolved">Resolved</option>
          </select>

          {(categoryFilter || statusFilter) && (
            <button
              onClick={clearFilters}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
            {reports.length} Reports Found
          </span>
        </div>
      </div>

      {/* Content Rendering: Map or Accessible List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-bold">Synchronizing with live open ledger...</p>
        </div>
      ) : viewMode === 'map' ? (
        <CityMap reports={reports} height="640px" />
      ) : (
        <ReportListView reports={reports} />
      )}
    </div>
  );
};
