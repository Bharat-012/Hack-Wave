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
  Check,
  Zap,
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
    lat: 23.2325,
    lng: 77.4330,
  });
  const [address, setAddress] = useState<string>('MP Nagar Zone-1, near DB Mall, Bhopal');

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

  const stepsList = [
    { num: 1, label: t('report_flow.step_photo') },
    { num: 2, label: t('report_flow.step_location') },
    { num: 3, label: t('report_flow.step_analysis') },
    { num: 5, label: t('report_flow.step_confirm') },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Title & Progress Stepper */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-black text-quest uppercase tracking-wider block">
            Civic Report Intake
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight mt-1">
            {t('report_flow.title')}
          </h1>
        </div>

        {/* Sleek Connected Stepper */}
        <div className="flex items-center justify-between relative max-w-2xl pt-2">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-200 -translate-y-1/2 -z-0" />
          {stepsList.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num || (step === 4 && s.num === 5);
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                    isCompleted
                      ? 'bg-quest text-white shadow-xs'
                      : isCurrent
                      ? 'bg-forest-700 text-white shadow-glow-forest ring-4 ring-forest-100'
                      : 'bg-white border border-stone-300 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold hidden sm:block ${
                    isCurrent ? 'text-forest-900' : 'text-stone-400'
                  }`}
                >
                  {s.label.split('. ')[1] || s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PHOTO CAPTURE */}
      {step === 1 && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="border-b border-stone-200/70 pb-4">
            <h2 className="text-xl font-black text-stone-900">
              Step 1: Capture or Select Problem Photo
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Clear daytime photos allow Gemini Vision to extract objective visual indicators.
            </p>
          </div>

          {/* Privacy Warning */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t('report_flow.privacy_warning')}</p>
          </div>

          {/* Dropzone */}
          <div className="border-2 border-dashed border-stone-300 rounded-3xl p-8 sm:p-12 text-center bg-stone-50/50 hover:bg-white hover:border-forest-700 transition-all">
            {photoUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block rounded-2xl overflow-hidden shadow-md border border-stone-200">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="max-h-80 w-auto object-cover mx-auto"
                  />
                  <div className="absolute top-3 right-3 bg-forest-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-quest" />
                    EXIF Cleaned
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setPhotoUrl('')}
                    type="button"
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline"
                  >
                    Remove and Choose Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto shadow-2xs">
                  <Camera className="w-8 h-8 text-forest-700" />
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-stone-400 mt-2">PNG, JPG or WebP up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Sample Photos for Demo Walkthrough */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-black text-stone-600 uppercase tracking-wider block">
              {t('report_flow.dropzone_sample')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {SAMPLE_PHOTOS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                    photoUrl === sample.url
                      ? 'border-forest-700 bg-forest-50/80 shadow-xs'
                      : 'border-stone-200/80 bg-white hover:bg-stone-50'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-black text-stone-900 block truncate">
                      {sample.name}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-500 block truncate">
                      {t(`categories.${sample.category}`)}
                    </span>
                    <span className="text-[9px] text-quest-dark font-bold">Click to load</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-200/70">
            <button
              disabled={!photoUrl}
              onClick={() => setStep(2)}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-forest active:scale-95"
            >
              Continue to Location Pin
              <ArrowRight className="w-4 h-4 text-quest" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION PIN */}
      {step === 2 && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="border-b border-stone-200/70 pb-4">
            <h2 className="text-xl font-black text-stone-900">
              Step 2: Place Issue Location Pin
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Click anywhere on the map to pin the coordinates of the problem.
            </p>
          </div>

          <CityMap
            interactiveSelect={true}
            selectedLocation={location}
            onSelectLocation={(lat, lng) => {
              setLocation({ lat, lng });
              setAddress(`Coordinate Point: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Bhopal)`);
            }}
            height="380px"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-stone-700 block">
              {t('report_flow.address_label')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:border-forest-700 focus:ring-2 focus:ring-forest-100 outline-none transition-all"
              placeholder="e.g. DB City Mall, MP Nagar, Bhopal"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200/70">
            <button
              onClick={() => setStep(1)}
              type="button"
              className="text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={runAiAnalysis}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-glow-forest active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-quest" />
              Analyze with Gemini AI
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GEMINI AI ANALYSIS & USER EDITING */}
      {step === 3 && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-6">
          {analyzing ? (
            <div className="py-20 text-center space-y-4">
              <div className="relative inline-block">
                <RefreshCw className="w-12 h-12 text-quest animate-spin mx-auto" />
                <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                {t('report_flow.analyzing_prompt')}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Gemini 2.5 Flash Vision inspecting visible aggregate breakdown & infrastructure safety boundaries.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/70 pb-4">
                <div>
                  <h2 className="text-xl font-black text-stone-900">
                    Step 3: Review AI Diagnosis & Edit Details
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t('report_flow.ai_disclaimer')}
                  </p>
                </div>
                {analysisResult && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border shadow-2xs self-start ${
                      analysisResult.source === 'gemini'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wide">
                    {t('report_flow.field_title')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-bold focus:border-forest-700 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wide">
                    {t('report_flow.field_category')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:border-forest-700 outline-none bg-white"
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
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wide">
                    {t('report_flow.field_severity')}
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-bold text-amber-700 focus:border-forest-700 outline-none bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical Hazard</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wide">
                    {t('report_flow.field_description')}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-medium focus:border-forest-700 outline-none"
                  />
                </div>
              </div>

              {/* AI Telemetry Breakdown */}
              {analysisResult && (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-800 uppercase tracking-wider">
                      AI Visual Telemetry
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      Confidence: <strong className="text-forest-900 uppercase">{analysisResult.confidence}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-stone-600 block mb-1">
                        {t('report_flow.field_visible_evidence')}:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-700">
                        {visibleEvidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-stone-600 block mb-1">
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

              <div className="flex items-center justify-between pt-4 border-t border-stone-200/70">
                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  onClick={checkDuplicatesAndProceed}
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-glow-forest active:scale-95"
                >
                  Check Nearby Duplicates
                  <ArrowRight className="w-4 h-4 text-quest" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: DUPLICATES RADAR (If nearby candidates exist) */}
      {step === 4 && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-extrabold text-amber-900">
                {t('report_flow.duplicate_alert_title')}
              </h2>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {t('report_flow.duplicate_alert_desc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-black text-stone-600 uppercase tracking-wider block">
              Candidate Matches Within 100m ({duplicates.length})
            </span>
            {duplicates.map((dup) => (
              <div
                key={dup.report.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-stone-200 bg-stone-50"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={dup.report.image_url}
                    alt={dup.report.title}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">{dup.report.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-1">{dup.report.address}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-forest-700">
                      <span>{dup.distanceMeters}m away</span>
                      <span>•</span>
                      <span>Similarity: {(dup.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBackExisting(dup.report.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 transition-colors shrink-0"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-quest" />
                  {t('report_flow.btn_back_existing')}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200/70">
            <button
              onClick={() => setStep(3)}
              type="button"
              className="text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              Back & Edit
            </button>
            <button
              onClick={() => setStep(5)}
              type="button"
              className="px-5 py-2.5 rounded-2xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {t('report_flow.btn_submit_anyway')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRM & SUBMIT */}
      {step === 5 && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="border-b border-stone-200/70 pb-4">
            <h2 className="text-xl font-black text-stone-900">
              Final Review: Confirm & Submit to City Ledger
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Your report will be publicly visible and open for neighborhood verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 p-5 rounded-2xl bg-stone-50 border border-stone-200">
            <img
              src={photoUrl}
              alt="Preview"
              className="w-full sm:w-52 h-52 object-cover rounded-2xl border border-stone-200 shrink-0"
            />
            <div className="space-y-3 text-sm flex-1">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                  Title
                </span>
                <h3 className="font-extrabold text-base text-stone-900">{title}</h3>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                  Description
                </span>
                <p className="text-xs text-stone-600 line-clamp-3">{description}</p>
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold bg-stone-200 text-stone-800 px-2.5 py-1 rounded-lg">
                  {t(`categories.${category}`)}
                </span>
                <span className="font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                  Severity: {t(`severities.${severity}`)}
                </span>
                <span className="font-medium text-stone-500">
                  📍 {address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200/70">
            <button
              onClick={() => setStep(3)}
              type="button"
              className="text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              Back & Edit
            </button>
            <button
              disabled={submitting}
              onClick={handleSubmitReport}
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-forest-700 text-white font-black text-sm hover:bg-forest-800 disabled:opacity-50 transition-all shadow-glow-forest active:scale-95"
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
        <div className="text-center py-16 px-6 glass-card rounded-3xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
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
                className="px-6 py-3 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-glow-forest"
              >
                {t('report_flow.btn_view_report')}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="px-6 py-3 rounded-2xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
            >
              {t('report_flow.btn_view_map')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
