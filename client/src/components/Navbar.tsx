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
    { to: '/quests', label: t('nav.quests'), icon: ShieldCheck },
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { to: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { to: '/admin', label: t('nav.admin'), icon: ShieldCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm group-hover:bg-forest-800 transition-colors">
              <MapPin className="w-5 h-5 text-quest" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-forest-900 leading-none">
                PatchMy<span className="text-quest font-extrabold">City</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wide">
                CIVIC QUESTS & MAP
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-forest-100 text-forest-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-cream-200'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Transparent Demo/Gemini Status Indicator */}
            {geminiConnected !== null && (
              <div
                title={
                  geminiConnected
                    ? 'Connected to live Gemini 2.5 Flash Vision API'
                    : 'Running in transparent Demo Mode with labeled mock analysis'
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  geminiConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                {geminiConnected ? 'Gemini 2.5 Active' : t('nav.demo_mode')}
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 bg-white hover:bg-cream-100 transition-colors shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-forest-700" />
              {t('nav.lang_toggle')}
            </button>

            {/* Report Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white font-semibold text-sm shadow-sm hover:bg-forest-800 transition-colors active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-quest" />
              {t('nav.report_btn')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2 py-1 rounded border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
            >
              {t('nav.lang_toggle')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-cream-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-cream-300 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-forest-100 text-forest-900 font-semibold'
                    : 'text-stone-600 hover:bg-cream-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 text-center py-2.5 rounded-xl bg-forest-700 text-white font-semibold text-sm"
            >
              {t('nav.report_btn')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
