import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cream-200 border-t border-cream-300 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-forest-900">PatchMyCity</span>
            <span>—</span>
            <span>Original civic tech for Hack Wave</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              WCAG AA Compliant
            </span>
            <span>•</span>
            <span>AI proposes, backend decides</span>
            <span>•</span>
            <span>Zero PII / EXIF stripped</span>
          </div>

          <div className="text-xs text-stone-500">
            © 2026 PatchMyCity. Open civic infrastructure.
          </div>
        </div>
      </div>
    </footer>
  );
};
