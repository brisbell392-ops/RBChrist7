import { useEffect, useState } from 'react';
import { BookOpen, Check, Columns2, Columns3, Copy, Globe, Search, Sparkles } from 'lucide-react';
import type { BibleChapterData, BibleVersionKey, CuratedVerse } from '../types/ministry';
import {
  BIBLE_CHAPTERS,
  BIBLE_VERSIONS,
  TRANSLATION_LANGUAGES,
  alignParallelVerses,
} from '../utils/bible';

interface BibleReaderViewProps {
  onSendToDailyVerse: (verse: CuratedVerse) => void;
}

export function BibleReaderView({ onSendToDailyVerse }: BibleReaderViewProps) {
  const [selectedChapter, setSelectedChapter] = useState<BibleChapterData>(BIBLE_CHAPTERS[0]);
  const [leftVersion, setLeftVersion] = useState<BibleVersionKey>('KJV');
  const [rightMode, setRightMode] = useState<'version' | 'translate'>('translate');
  const [rightVersion, setRightVersion] = useState<BibleVersionKey>('WEB');
  const [targetLanguage, setTargetLanguage] = useState<string>('ta');
  const [showThirdColumn, setShowThirdColumn] = useState(false);
  const [thirdVersion, setThirdVersion] = useState<BibleVersionKey>('BBE');

  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  const [lookupBook, setLookupBook] = useState('');
  const [lookupChapter, setLookupChapter] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);

  useEffect(() => {
    if (rightMode !== 'translate') {
      setTranslations({});
      setTranslateError('');
      return;
    }

    let cancelled = false;
    const langInfo = TRANSLATION_LANGUAGES.find((l) => l.code === targetLanguage);

    async function runTranslation() {
      setTranslating(true);
      setTranslateError('');
      try {
        const res = await fetch('/api/bible/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetLanguage,
            targetLanguageName: langInfo?.name ?? targetLanguage,
            verses: selectedChapter.verses.map((v) => ({
              verse: v.verse,
              text: v.versions.WEB || v.versions.KJV,
            })),
          }),
        });
        if (!res.ok) {
          throw new Error('Translation request failed.');
        }
        const data = (await res.json()) as { translations?: Record<number, string> };
        if (!cancelled) {
          setTranslations(data.translations ?? {});
        }
      } catch {
        if (!cancelled) {
          setTranslateError('Live translation is momentarily unavailable. Showing English parallel text.');
        }
      } finally {
        if (!cancelled) {
          setTranslating(false);
        }
      }
    }

    runTranslation();
    return () => {
      cancelled = true;
    };
  }, [selectedChapter, rightMode, targetLanguage]);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const book = lookupBook.trim();
    const chapterNum = Number(lookupChapter.trim() || '1');
    if (!book) {
      setLookupError('Enter a Bible book name (e.g., Matthew, Genesis, Romans).');
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await fetch(
        `/api/bible/chapter?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapterNum)}`
      );
      const data = (await res.json()) as BibleChapterData & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not load that chapter.');
      }
      setSelectedChapter(data);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Could not load chapter.');
    } finally {
      setLookupLoading(false);
    }
  };

  const thirdMap = showThirdColumn
    ? Object.fromEntries(
        selectedChapter.verses.map((v) => [v.verse, v.versions[thirdVersion]])
      )
    : undefined;

  const rows = alignParallelVerses(
    selectedChapter,
    leftVersion,
    rightVersion,
    rightMode === 'translate' ? translations : undefined,
    thirdMap
  );

  const selectedLangObj = TRANSLATION_LANGUAGES.find((l) => l.code === targetLanguage);

  const handleCopyRow = async (verseNum: number, leftText: string, rightText: string) => {
    const text = `${selectedChapter.book} ${selectedChapter.chapter}:${verseNum}\n[${leftVersion}] ${leftText}\n[${
      rightMode === 'translate' ? selectedLangObj?.name ?? targetLanguage : rightVersion
    }] ${rightText}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(verseNum);
      setTimeout(() => setCopiedVerse(null), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
            Multilingual Scripture Study
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold text-[#1C1917]">
            Parallel Bible & Google Translator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#57534E]">
            Compare classic and modern English Bible translations side by side, or read aligned with Google Translator across 20 world languages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowThirdColumn((prev) => !prev)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#D6CEBE] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] transition-colors hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
        >
          {showThirdColumn ? <Columns2 className="h-4 w-4" /> : <Columns3 className="h-4 w-4" />}
          <span>{showThirdColumn ? '2-Column View' : 'Add 3rd Version Column'}</span>
        </button>
      </div>

      {/* Controls Bar */}
      <section className="grid grid-cols-1 gap-6 rounded-xl border border-[#E5DEC9] bg-white p-5 lg:grid-cols-12">
        {/* Study Chapter Selector */}
        <div className="space-y-2 lg:col-span-4">
          <label htmlFor="bible-chapter-select" className="block text-xs font-semibold text-[#44403C]">
            Curated Study Passages
          </label>
          <select
            id="bible-chapter-select"
            value={selectedChapter.id}
            onChange={(e) => {
              const found = BIBLE_CHAPTERS.find((c) => c.id === e.target.value);
              if (found) {
                setSelectedChapter(found);
                setLookupError('');
              }
            }}
            className="w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
          >
            {BIBLE_CHAPTERS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.book} {ch.chapter} — {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* Left Version */}
        <div className="space-y-2 lg:col-span-3">
          <label htmlFor="left-version-select" className="block text-xs font-semibold text-[#44403C]">
            Primary Column Version
          </label>
          <select
            id="left-version-select"
            value={leftVersion}
            onChange={(e) => setLeftVersion(e.target.value as BibleVersionKey)}
            className="w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
          >
            {BIBLE_VERSIONS.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label} — {v.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Right Parallel Mode & Target */}
        <div className="space-y-2 lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#44403C]">Parallel Column Mode</span>
            <div className="flex items-center gap-1 rounded-md bg-[#F2ECE1] p-0.5">
              <button
                type="button"
                onClick={() => setRightMode('translate')}
                className={`cursor-pointer rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  rightMode === 'translate'
                    ? 'bg-white text-[#1C1917] shadow-sm'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Google Translator
              </button>
              <button
                type="button"
                onClick={() => setRightMode('version')}
                className={`cursor-pointer rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  rightMode === 'version'
                    ? 'bg-white text-[#1C1917] shadow-sm'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                English Version
              </button>
            </div>
          </div>

          {rightMode === 'translate' ? (
            <div className="relative">
              <label htmlFor="translate-lang-select" className="sr-only">
                Select translation language
              </label>
              <select
                id="translate-lang-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
              >
                {TRANSLATION_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="right-version-select" className="sr-only">
                Select parallel English Bible version
              </label>
              <select
                id="right-version-select"
                value={rightVersion}
                onChange={(e) => setRightVersion(e.target.value as BibleVersionKey)}
                className="w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
              >
                {BIBLE_VERSIONS.map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.label} — {v.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Custom Chapter Lookup */}
        <form
          onSubmit={handleLookupSubmit}
          className="flex flex-col gap-3 border-t border-[#F2ECE1] pt-4 sm:flex-row sm:items-end lg:col-span-12"
        >
          <div className="flex-1">
            <label htmlFor="lookup-book" className="block text-xs font-medium text-[#57534E]">
              Look Up Any Book & Chapter
            </label>
            <input
              id="lookup-book"
              type="text"
              value={lookupBook}
              onChange={(e) => setLookupBook(e.target.value)}
              placeholder="e.g. Matthew, Daniel, Psalms, Hebrews..."
              className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#1E3A5F] focus:outline-none"
            />
          </div>
          <div className="w-full sm:w-32">
            <label htmlFor="lookup-chapter" className="block text-xs font-medium text-[#57534E]">
              Chapter
            </label>
            <input
              id="lookup-chapter"
              type="number"
              min={1}
              max={150}
              value={lookupChapter}
              onChange={(e) => setLookupChapter(e.target.value)}
              placeholder="1"
              className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={lookupLoading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#162C49] disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            <span>{lookupLoading ? 'Loading...' : 'Load Chapter'}</span>
          </button>

          {showThirdColumn && (
            <div className="w-full sm:w-44">
              <label htmlFor="third-version-select" className="block text-xs font-medium text-[#57534E]">
                3rd Column Version
              </label>
              <select
                id="third-version-select"
                value={thirdVersion}
                onChange={(e) => setThirdVersion(e.target.value as BibleVersionKey)}
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              >
                {BIBLE_VERSIONS.map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </section>

      {lookupError && (
        <div role="alert" className="rounded-lg border border-[#9A3412]/30 bg-[#9A3412]/5 px-4 py-3 text-sm text-[#9A3412]">
          {lookupError}
        </div>
      )}

      {translateError && (
        <div role="status" className="rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 px-4 py-3 text-sm text-[#78350F]">
          {translateError}
        </div>
      )}

      {/* Parallel Reading Canvas */}
      <section className="overflow-hidden rounded-xl border border-[#E5DEC9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DEC9] bg-[#F2ECE1]/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#9A3412]" />
            <div>
              <h2 className="font-display text-2xl font-bold text-[#1C1917]">
                {selectedChapter.book} {selectedChapter.chapter}
              </h2>
              <p className="text-xs text-[#57534E]">{selectedChapter.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#57534E]">
            {rightMode === 'translate' && (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#1E3A5F]">
                <Globe className="h-3.5 w-3.5" />
                <span>
                  {translating
                    ? `Translating to ${selectedLangObj?.name ?? targetLanguage}...`
                    : `Google Translator · ${selectedLangObj?.name ?? targetLanguage}`}
                </span>
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{rows.length} verses</span>
          </div>
        </div>

        {/* Column Headings */}
        <div
          className={`hidden border-b border-[#E5DEC9] bg-[#FAF7F2] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#57534E] uppercase md:grid ${
            showThirdColumn ? 'md:grid-cols-12' : 'md:grid-cols-12'
          } md:gap-6`}
        >
          <div className="md:col-span-1">Verse</div>
          <div className={showThirdColumn ? 'md:col-span-3' : 'md:col-span-5'}>
            {leftVersion}
          </div>
          <div className={showThirdColumn ? 'md:col-span-4' : 'md:col-span-5'}>
            {rightMode === 'translate'
              ? `${selectedLangObj?.name ?? targetLanguage} (${selectedLangObj?.nativeName ?? ''})`
              : rightVersion}
          </div>
          {showThirdColumn && <div className="md:col-span-3">{thirdVersion}</div>}
          <div className="md:col-span-1 text-right">Actions</div>
        </div>

        {/* Verse Rows */}
        <div className="divide-y divide-[#F2ECE1]" data-testid="parallel-verses-list">
          {rows.map((row) => (
            <div
              key={row.verseNumber}
              className="grid grid-cols-1 gap-4 px-6 py-5 transition-colors hover:bg-[#FAF7F2]/60 md:grid-cols-12 md:gap-6"
            >
              <div className="flex items-center justify-between md:col-span-1 md:items-start">
                <span className="font-mono text-sm font-semibold text-[#9A3412] tabular-nums">
                  {selectedChapter.chapter}:{row.verseNumber}
                </span>
              </div>

              <div className={showThirdColumn ? 'md:col-span-3' : 'md:col-span-5'}>
                <p className="mb-1 text-[11px] font-semibold tracking-wider text-[#78716C] uppercase md:hidden">
                  {leftVersion}
                </p>
                <p className="text-[15px] leading-relaxed text-[#1C1917]">{row.leftText}</p>
              </div>

              <div className={showThirdColumn ? 'md:col-span-4' : 'md:col-span-5'}>
                <p className="mb-1 text-[11px] font-semibold tracking-wider text-[#78716C] uppercase md:hidden">
                  {rightMode === 'translate'
                    ? selectedLangObj?.name ?? targetLanguage
                    : rightVersion}
                </p>
                <p className="text-[15px] leading-relaxed text-[#292524]">
                  {translating && rightMode === 'translate' && !translations[row.verseNumber] ? (
                    <span className="text-[#78716C] italic">Translating verse...</span>
                  ) : (
                    row.rightText
                  )}
                </p>
              </div>

              {showThirdColumn && (
                <div className="md:col-span-3">
                  <p className="mb-1 text-[11px] font-semibold tracking-wider text-[#78716C] uppercase md:hidden">
                    {thirdVersion}
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#44403C]">
                    {row.thirdText}
                  </p>
                </div>
              )}

              <div className="flex items-start justify-end gap-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => handleCopyRow(row.verseNumber, row.leftText, row.rightText)}
                  title="Copy parallel verse"
                  aria-label={`Copy ${selectedChapter.book} ${selectedChapter.chapter}:${row.verseNumber}`}
                  className="cursor-pointer rounded p-1.5 text-[#57534E] transition-colors hover:bg-[#F2ECE1] hover:text-[#1C1917]"
                >
                  {copiedVerse === row.verseNumber ? (
                    <Check className="h-4 w-4 text-[#14532D]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSendToDailyVerse({
                      id: `${selectedChapter.id}-${row.verseNumber}`,
                      reference: `${selectedChapter.book} ${selectedChapter.chapter}:${row.verseNumber}`,
                      book: selectedChapter.book,
                      chapter: selectedChapter.chapter,
                      verse: row.verseNumber,
                      topic: 'Promises',
                      text: row.leftText,
                    })
                  }
                  title="Create shareable verse card"
                  aria-label={`Create verse card for ${selectedChapter.book} ${selectedChapter.chapter}:${row.verseNumber}`}
                  className="cursor-pointer rounded p-1.5 text-[#57534E] transition-colors hover:bg-[#F2ECE1] hover:text-[#9A3412]"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
