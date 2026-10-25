import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Compass,
  Trophy,
  BarChart3,
  ShieldCheck,
  PlusCircle,
  Globe,
  Sparkles,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../api/client.js';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api
      .getHealth()
      .then((res) => {
        setGeminiConnected(res.gemini_status === 'connected');
      })
      .catch(() => setGeminiConnected(false));
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: '/explore', label: t('nav.explore'), icon: Compass },
    { to: '/quests', label: t('nav.quests'), icon: ShieldCheck, badge: 'Missions' },
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { to: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { to: '/admin', label: t('nav.admin'), icon: ShieldCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#F8F9F5]/85 backdrop-blur-xl border-b border-stone-200/60 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo with Civic Badge */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-700 to-forest-900 flex items-center justify-center text-white shadow-glow-forest group-hover:scale-105 transition-all">
              <MapPin className="w-5 h-5 text-quest drop-shadow" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-forest-900 leading-none">
                  PatchMy<span className="text-quest font-black">City</span>
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Node Active" />
              </div>
              <span className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase mt-0.5">
                Civic Quests & Map
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-200/40 p-1.5 rounded-2xl border border-stone-200/50">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-forest-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-quest' : 'opacity-70'}`} />
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] bg-quest/15 text-quest-dark font-black px-1.5 py-0.5 rounded-full uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live Gemini Indicator */}
            {geminiConnected !== null && (
              <div
                title={
                  geminiConnected
                    ? 'Connected to live Gemini 2.5 Flash Vision API'
                    : 'Running in transparent Demo Mode with labeled mock analysis'
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
                  geminiConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    : 'bg-amber-50 text-amber-900 border-amber-200/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                {geminiConnected ? 'Gemini 2.5 Active' : t('nav.demo_mode')}
              </div>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white/80 hover:bg-white text-xs font-bold text-stone-700 shadow-2xs transition-all hover:border-stone-300 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-forest-700" />
              {t('nav.lang_toggle')}
            </button>

            {/* Quick Demo Citizen Score pill */}
            <Link
              to="/leaderboard"
              title="Your Civic Points"
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-50 border border-forest-200/60 text-xs font-bold text-forest-900 shadow-2xs hover:bg-forest-100 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              145 pts
            </Link>

            {/* Report Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 text-white font-bold text-xs shadow-glow-forest hover:from-forest-800 hover:to-forest-900 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-quest" />
              {t('nav.report_btn')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-700 bg-white"
            >
              {t('nav.lang_toggle')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200/70 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                  isActive(link.to)
                    ? 'bg-forest-100 text-forest-900 font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-quest/20 text-quest-dark font-black px-2 py-0.5 rounded-full uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 text-center py-3 rounded-2xl bg-forest-700 text-white font-bold text-sm shadow-sm"
            >
              {t('nav.report_btn')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
