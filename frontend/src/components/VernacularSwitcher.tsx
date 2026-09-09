import React, { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from '../i18n';
import { LOCALE_META, Locale } from '../i18n';

export const VernacularSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LOCALE_META[locale];

  return (
    <div ref={ref} className="relative" id="vernacular-switcher">
      {/* Trigger pill */}
      <button
        id="btn-language-switcher"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-xs font-semibold text-neutral-700 transition-all shadow-xs"
        title="Change language / भाषा बदलें"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="hidden sm:inline">{current.label}</span>
        <span
          className={`transition-transform duration-150 text-neutral-400 text-[10px] ${open ? 'rotate-180' : ''}`}
        >▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden min-w-[170px]"
        >
          <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
            भाषा चुनें / Select Language
          </div>
          {(Object.values(LOCALE_META) as typeof LOCALE_META[Locale][]).map(meta => (
            <button
              key={meta.code}
              id={`lang-option-${meta.code}`}
              role="option"
              aria-selected={locale === meta.code}
              onClick={() => { setLocale(meta.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
                locale === meta.code
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="text-base leading-none">{meta.flag}</span>
              <span className="font-semibold flex-1">{meta.label}</span>
              <span className="text-[11px] text-neutral-400">{meta.labelEn}</span>
              {locale === meta.code && (
                <span className="ml-auto text-emerald-600 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
