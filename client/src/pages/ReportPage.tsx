import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../api/client.js';
import { CityMap } from '../components/Map/CityMap.js';
import { DuplicateCandidate, GeminiAnalysisResult, ReportCategory, ReportSeverity } from '../types/index.js';

// Pre-loaded sample images for judge walkthrough & offline demo
const SAMPLE_PHOTOS = [
  {
    name: 'Asphalt Pothole',
    category: 'roads_potholes' as ReportCategory,
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    context: 'Deep pothole on asphalt road near Karol Bagh market crossing with loose gravel and puddle.',
  },
  {
    name: 'Broken Streetlight',
    category: 'streetlights_electricity' as ReportCategory,
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    context: 'Overhead street luminaire dangling from bracket by exposed electrical wire near school gate.',
  },
  {
    name: 'Overflowing Dumpster',
    category: 'sanitation_garbage' as ReportCategory,
    url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
    context: 'Municipal public bin overflowing with plastic refuse and uncollected waste onto sidewalk.',
  },
];

export const ReportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Multi-step State
  const [step, setStep] = useState<number>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 28.6448,
    lng: 77.2167,
  });
  const [address, setAddress] = useState<string>('Karol Bagh, New Delhi');

  // AI & Form Fields
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ReportCategory>('roads_potholes');
  const [severity, setSeverity] = useState<ReportSeverity>('medium');
  const [description, setDescription] = useState<string>('');
  const [visibleEvidence, setVisibleEvidence] = useState<string[]>([]);
  const [missingInfo, setMissingInfo] = useState<string[]>([]);
  const [nextAction, setNextAction] = useState<string>('');

  // Duplicates Radar
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Sample Photo Selection
  const handleSelectSample = (sample: typeof SAMPLE_PHOTOS[0]) => {
    setPhotoUrl(sample.url);
    setPhotoBase64(sample.url);
    setTitle(sample.name);
    setCategory(sample.category);
    setDescription(sample.context);
  };

  // Trigger Gemini Analysis
  const runAiAnalysis = async () => {
    if (!photoUrl) return;
    setAnalyzing(true);
    setStep(3);

    try {
      const data = await api.analyzeImage(photoBase64 || photoUrl, description || title);
      setAnalysisResult(data);
      setCategory(data.category);
      setSeverity(data.suggested_severity);
      if (!title) setTitle(data.description.slice(0, 40));
      setDescription(data.description);
      setVisibleEvidence(data.visible_evidence);
      setMissingInfo(data.missing_information);
      setNextAction(data.recommended_next_action);
    } catch (err) {
      console.error('AI analysis error', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Trigger Duplicate Check
  const checkDuplicatesAndProceed = async () => {
    try {
      const candidates = await api.checkDuplicates({
        latitude: location.lat,
        longitude: location.lng,
        category: category,
      });

      setDuplicates(candidates);
      if (candidates.length > 0) {
        setStep(4); // Show duplicates radar
      } else {
        setStep(5); // Proceed to confirm
      }
    } catch (err) {
      setStep(5);
    }
  };

  // Submit Final Report
  const handleSubmitReport = async () => {
    setSubmitting(true);
    try {
      const report = await api.createReport({
        title,
        description,
        category,
        severity,
        latitude: location.lat,
        longitude: location.lng,
        address,
        image_url: photoUrl,
        ai_analysis: analysisResult || undefined,
      });

      setSubmittedReportId(report.id);
      setStep(6); // Success
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Back existing report instead of filing duplicate
  const handleBackExisting = async (existingId: string) => {
    try {
      const res = await api.supportReport(existingId);
      alert(`Backed existing report! ${res.point_status}`);
      navigate(`/reports/${existingId}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Progress Steps Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('report_flow.title')}
        </h1>
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 text-xs font-semibold text-stone-500">
          <span className={`px-3 py-1.5 rounded-lg ${step === 1 ? 'bg-forest-700 text-white' : 'bg-cream-200'}`}>
            {t('report_flow.step_photo')}
          </span>
          <span>→</span>
          <span className={`px-3 py-1.5 rounded-lg ${step === 2 ? 'bg-forest-700 text-white' : 'bg-cream-200'}`}>
            {t('report_flow.step_location')}
          </span>
          <span>→</span>
          <span className={`px-3 py-1.5 rounded-lg ${step === 3 ? 'bg-forest-700 text-white' : 'bg-cream-200'}`}>
            {t('report_flow.step_analysis')}
          </span>
          <span>→</span>
          <span className={`px-3 py-1.5 rounded-lg ${step === 4 || step === 5 ? 'bg-forest-700 text-white' : 'bg-cream-200'}`}>
            {t('report_flow.step_confirm')}
          </span>
        </div>
      </div>

      {/* STEP 1: PHOTO CAPTURE */}
      {step === 1 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-2xs">
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-1">
              Step 1: Capture or Select Problem Photo
            </h2>
            <p className="text-xs text-stone-500">
              Clear daytime photos help the AI and community verify issues accurately.
            </p>
          </div>

          {/* Privacy Warning */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p>{t('report_flow.privacy_warning')}</p>
          </div>

          {/* Dropzone */}
          <div className="border-2 border-dashed border-cream-300 rounded-2xl p-8 text-center hover:border-forest-700 transition-colors">
            {photoUrl ? (
              <div className="space-y-4">
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full max-h-72 object-cover rounded-xl border border-stone-200 mx-auto"
                />
                <button
                  onClick={() => setPhotoUrl('')}
                  type="button"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <label className="cursor-pointer text-sm font-bold text-forest-700 hover:text-forest-900">
                    Upload from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-stone-500 mt-1">PNG, JPG or WebP up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Sample Photos for Demo Walkthrough */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              {t('report_flow.dropzone_sample')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PHOTOS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                    photoUrl === sample.url
                      ? 'border-forest-700 bg-forest-50 font-bold'
                      : 'border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-900 block leading-tight">
                      {sample.name}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {t(`categories.${sample.category}`)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-cream-200">
            <button
              disabled={!photoUrl}
              onClick={() => setStep(2)}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-700 text-white font-semibold text-sm hover:bg-forest-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Location Pin
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION PIN */}
      {step === 2 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-2xs">
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-1">
              Step 2: Place Issue Location Pin
            </h2>
            <p className="text-xs text-stone-500">
              Click anywhere on the map to pin the exact coordinates of the issue.
            </p>
          </div>

          <CityMap
            interactiveSelect={true}
            selectedLocation={location}
            onSelectLocation={(lat, lng) => {
              setLocation({ lat, lng });
              setAddress(`Coordinate Point: ${lat.toFixed(4)}, ${lng.toFixed(4)} (New Delhi)`);
            }}
            height="360px"
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 block">
              {t('report_flow.address_label')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-forest-700 outline-none"
              placeholder="e.g. Karol Bagh Market, New Delhi"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <button
              onClick={() => setStep(1)}
              type="button"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={runAiAnalysis}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-700 text-white font-semibold text-sm hover:bg-forest-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-quest" />
              Analyze with Gemini AI
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GEMINI AI ANALYSIS & USER EDITING */}
      {step === 3 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-2xs">
          {analyzing ? (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-quest animate-spin mx-auto" />
              <h3 className="text-base font-bold text-stone-900">
                {t('report_flow.analyzing_prompt')}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Validating physical indicators and screening safety bounds without human assumptions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 mb-1">
                    Step 3: Review AI Diagnosis & Edit Details
                  </h2>
                  <p className="text-xs text-stone-500">
                    {t('report_flow.ai_disclaimer')}
                  </p>
                </div>
                {analysisResult && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      analysisResult.source === 'gemini'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {analysisResult.source === 'gemini'
                      ? t('report_flow.live_analysis_badge')
                      : t('report_flow.mock_analysis_badge')}
                  </span>
                )}
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700">
                    {t('report_flow.field_title')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-forest-700 outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {t('report_flow.field_category')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-forest-700 outline-none"
                  >
                    <option value="roads_potholes">Roads & Potholes</option>
                    <option value="streetlights_electricity">Streetlights & Electricity</option>
                    <option value="sanitation_garbage">Sanitation & Garbage</option>
                    <option value="water_drainage">Water & Drainage</option>
                    <option value="parks_public_spaces">Parks & Public Spaces</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {t('report_flow.field_severity')}
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-forest-700 outline-none font-semibold text-amber-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical Hazard</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700">
                    {t('report_flow.field_description')}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:border-forest-700 outline-none"
                  />
                </div>
              </div>

              {/* AI Telemetry Breakdown */}
              {analysisResult && (
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3 text-xs">
                  <span className="font-bold text-stone-800 uppercase tracking-wider block">
                    AI Visual Telemetry
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="font-semibold text-stone-600 block mb-1">
                        {t('report_flow.field_visible_evidence')}:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-700">
                        {visibleEvidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-600 block mb-1">
                        {t('report_flow.field_missing_info')}:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-700">
                        {missingInfo.map((mi, i) => (
                          <li key={i}>{mi}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  onClick={checkDuplicatesAndProceed}
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-700 text-white font-semibold text-sm hover:bg-forest-800 transition-colors"
                >
                  Check Nearby Duplicates
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: DUPLICATES RADAR (If nearby candidates exist) */}
      {step === 4 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-2xs">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-amber-900">
                {t('report_flow.duplicate_alert_title')}
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                {t('report_flow.duplicate_alert_desc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Candidate Matches ({duplicates.length})
            </span>
            {duplicates.map((dup) => (
              <div
                key={dup.report.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-cream-300 bg-cream-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={dup.report.image_url}
                    alt={dup.report.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">{dup.report.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-1">{dup.report.address}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-stone-600">
                      <span>Distance: {dup.distanceMeters}m away</span>
                      <span>•</span>
                      <span>Similarity Score: {(dup.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBackExisting(dup.report.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white text-xs font-semibold hover:bg-forest-800 transition-colors shrink-0"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-quest" />
                  {t('report_flow.btn_back_existing')}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <button
              onClick={() => setStep(3)}
              type="button"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back & Edit
            </button>
            <button
              onClick={() => setStep(5)}
              type="button"
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-cream-100 transition-colors"
            >
              {t('report_flow.btn_submit_anyway')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRM & SUBMIT */}
      {step === 5 && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-2xs">
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-1">
              Final Review: Confirm & Submit to City Ledger
            </h2>
            <p className="text-xs text-stone-500">
              Your report will be publicly visible and open for neighborhood verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-cream-50 border border-cream-300">
            <img
              src={photoUrl}
              alt="Preview"
              className="w-full sm:w-48 h-48 object-cover rounded-xl border border-stone-200 shrink-0"
            />
            <div className="space-y-2 text-sm">
              <h3 className="font-bold text-base text-stone-900">{title}</h3>
              <p className="text-xs text-stone-600">{description}</p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium bg-stone-200 px-2.5 py-1 rounded-md">
                  {t(`categories.${category}`)}
                </span>
                <span className="font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md">
                  Severity: {t(`severities.${severity}`)}
                </span>
                <span className="font-medium text-stone-500">
                  📍 {address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <button
              onClick={() => setStep(3)}
              type="button"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back & Edit
            </button>
            <button
              disabled={submitting}
              onClick={handleSubmitReport}
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-md active:scale-95"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting to Ledger...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-quest" />
                  {t('report_flow.btn_submit')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SUCCESS */}
      {step === 6 && (
        <div className="text-center py-12 px-6 bg-white rounded-3xl border border-cream-300 shadow-2xs space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-stone-900">
              {t('report_flow.success_title')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t('report_flow.success_desc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {submittedReportId && (
              <button
                type="button"
                onClick={() => navigate(`/reports/${submittedReportId}`)}
                className="px-6 py-2.5 rounded-xl bg-forest-700 text-white font-semibold text-sm hover:bg-forest-800 transition-colors"
              >
                {t('report_flow.btn_view_report')}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-cream-100 transition-colors"
            >
              {t('report_flow.btn_view_map')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
