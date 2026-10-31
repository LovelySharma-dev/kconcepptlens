import React, { useState } from 'react';
import { Languages, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import {
  SUPPORTED_CURRICULUM_LANGUAGES,
  type SupportedLanguageCode,
  type CurriculumTranslateResponse
} from '@conceptlens/shared';

export interface CurriculumTranslationBarProps {
  originalText: string;
  onTranslatedChange: (translated: string, language: SupportedLanguageCode, isRtl: boolean) => void;
  onAnnounce?: (msg: string) => void;
  currentLanguage?: SupportedLanguageCode;
  onLanguageChange?: (lang: SupportedLanguageCode) => void;
}

export const CurriculumTranslationBar: React.FC<CurriculumTranslationBarProps> = ({
  originalText,
  onTranslatedChange,
  onAnnounce,
  currentLanguage = 'en',
  onLanguageChange
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguageCode>(currentLanguage);
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<CurriculumTranslateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectLanguage = async (code: SupportedLanguageCode) => {
    setSelectedLang(code);
    if (onLanguageChange) onLanguageChange(code);

    if (code === 'en') {
      setStatusData(null);
      setErrorMsg(null);
      onTranslatedChange(originalText, 'en', false);
      if (onAnnounce) onAnnounce('Switched back to original English curriculum text.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    if (onAnnounce) {
      const lang = SUPPORTED_CURRICULUM_LANGUAGES.find((l) => l.code === code);
      onAnnounce(`Translating curriculum into ${lang?.label || code}...`);
    }

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          targetLanguage: code,
          sourceLanguage: 'en',
          context: 'lesson'
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Translation request failed.');
      }

      const data = json.data as CurriculumTranslateResponse;
      setStatusData(data);
      onTranslatedChange(data.translatedText, code, data.rtl);

      if (onAnnounce) {
        if (data.status === 'machine_translated') {
          onAnnounce(`Curriculum translated into ${code}. Machine translation, unreviewed by human educators.`);
        } else if (data.status === 'unavailable') {
          onAnnounce('Live AI translation provider is unconfigured. Showing authoritative English text.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Translation failed.';
      setErrorMsg(msg);
      onTranslatedChange(originalText, 'en', false);
      if (onAnnounce) onAnnounce(`Translation notice: ${msg}. Showing original English.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToEnglish = () => {
    void handleSelectLanguage('en');
  };

  return (
    <div
      className="curriculum-translation-bar"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '0.65rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}
      role="region"
      aria-label="Curriculum Language Translation"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 600 }}>
          <Languages size={15} />
          <span>Curriculum Translation</span>
          {loading && <Loader2 size={14} className="animate-spin" color="var(--accent-cyan)" />}
        </div>

        {selectedLang !== 'en' && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetToEnglish}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            aria-label="Return to original English text"
          >
            <RotateCcw size={12} />
            <span>View Original (English)</span>
          </button>
        )}
      </div>

      {/* Language Selector Pills */}
      <div
        role="tablist"
        aria-label="Available curriculum languages"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}
      >
        {SUPPORTED_CURRICULUM_LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`tag-btn ${isSelected ? 'active' : ''}`}
              onClick={() => void handleSelectLanguage(lang.code)}
              disabled={loading}
              style={{
                fontSize: '0.78rem',
                padding: '0.28rem 0.65rem',
                borderColor: isSelected ? 'var(--accent-cyan)' : undefined,
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : undefined
              }}
            >
              <span>{lang.nativeLabel}</span>
              {lang.code !== 'en' && <span style={{ opacity: 0.65, fontSize: '0.7rem', marginLeft: '0.25rem' }}>({lang.label})</span>}
            </button>
          );
        })}
      </div>

      {/* Status Notice & Disclaimer */}
      {statusData && statusData.status === 'machine_translated' && (
        <div
          style={{
            padding: '0.45rem 0.65rem',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          role="status"
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Machine-Translated:</strong> Unreviewed by human educators. Scientific terms, formulas, and symbols are preserved from the authoritative English curriculum.
          </span>
        </div>
      )}

      {statusData && statusData.status === 'unavailable' && (
        <div
          style={{
            padding: '0.45rem 0.65rem',
            background: 'rgba(148, 163, 184, 0.12)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          role="status"
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>
            {statusData.disclaimer}
          </span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '0.45rem 0.65rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
          role="alert"
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>Translation unavailable: {errorMsg}. Showing original English text.</span>
        </div>
      )}
    </div>
  );
};
