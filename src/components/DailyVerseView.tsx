import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, RefreshCw, Share2, Sparkles } from 'lucide-react';
import type { CuratedVerse } from '../types/ministry';
import { CURATED_VERSES, buildDefaultImagePrompt, pickRandomVerse } from '../utils/bible';

interface DailyVerseViewProps {
  initialVerse?: CuratedVerse | null;
}

const ART_STYLES = [
  'Sacred Botanical Light',
  'Stained Glass Cathedral',
  'Ancient Illuminated Parchment',
  'Dawn Over Mount Zion',
] as const;

type PaletteKey = 'golden-radiance' | 'royal-sapphire' | 'crimson-vine' | 'parchment-scroll';

const CARD_PALETTES: Array<{
  key: PaletteKey;
  label: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
  text: string;
  muted: string;
}> = [
  {
    key: 'golden-radiance',
    label: 'Golden Radiance',
    bgStart: '#FFF6D6',
    bgEnd: '#F4A236',
    accent: '#9A3412',
    text: '#1C1917',
    muted: '#57534E',
  },
  {
    key: 'royal-sapphire',
    label: 'Royal Sapphire',
    bgStart: '#0F2342',
    bgEnd: '#1E3A5F',
    accent: '#FBBF24',
    text: '#FAF7F2',
    muted: '#CBD5E1',
  },
  {
    key: 'crimson-vine',
    label: 'Crimson Vine',
    bgStart: '#450A0A',
    bgEnd: '#881337',
    accent: '#FDE68A',
    text: '#FFFBEB',
    muted: '#FDE68A',
  },
  {
    key: 'parchment-scroll',
    label: 'Parchment Scroll',
    bgStart: '#FAF7F2',
    bgEnd: '#E7DEC8',
    accent: '#1E3A5F',
    text: '#1C1917',
    muted: '#57534E',
  },
];

const TOPICS: Array<CuratedVerse['topic'] | 'All'> = [
  'All',
  'Promises',
  'Prophecy',
  'Worship',
  'Grace',
  'Wisdom',
];

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function DailyVerseView({ initialVerse }: DailyVerseViewProps) {
  const [topic, setTopic] = useState<CuratedVerse['topic'] | 'All'>('All');
  const [verse, setVerse] = useState<CuratedVerse>(
    () => initialVerse ?? CURATED_VERSES[0]
  );
  const [artStyle, setArtStyle] = useState<string>(ART_STYLES[0]);
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('golden-radiance');
  const [imagePrompt, setImagePrompt] = useState<string>(() =>
    buildDefaultImagePrompt(initialVerse ?? CURATED_VERSES[0], ART_STYLES[0])
  );
  const [reflection, setReflection] = useState<string>(
    'Abide in the True Vine today, knowing that Christ in you is the hope of glory and the anchor of every promise.'
  );
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (initialVerse) {
      setVerse(initialVerse);
      setImagePrompt(buildDefaultImagePrompt(initialVerse, artStyle));
    }
  }, [initialVerse, artStyle]);

  const requestPromptGeneration = useCallback(
    async (targetVerse: CuratedVerse, selectedStyle: string) => {
      setGeneratingPrompt(true);
      try {
        const res = await fetch('/api/daily-verse/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verseId: targetVerse.id,
            artStyle: selectedStyle,
          }),
        });
        if (!res.ok) throw new Error('Prompt API failed');
        const data = (await res.json()) as {
          imagePrompt?: string;
          reflection?: string;
        };
        setImagePrompt(data.imagePrompt || buildDefaultImagePrompt(targetVerse, selectedStyle));
        if (data.reflection) setReflection(data.reflection);
      } catch {
        setImagePrompt(buildDefaultImagePrompt(targetVerse, selectedStyle));
      } finally {
        setGeneratingPrompt(false);
      }
    },
    []
  );

  // Draw shareable 1080x1080 PNG card onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    const palette =
      CARD_PALETTES.find((p) => p.key === paletteKey) ?? CARD_PALETTES[0];

    // Radial sacred radiance backdrop
    const grad = ctx.createRadialGradient(
      size / 2,
      size * 0.35,
      60,
      size / 2,
      size / 2,
      size * 0.78
    );
    grad.addColorStop(0, palette.bgStart);
    grad.addColorStop(1, palette.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle sunbeams
    ctx.save();
    ctx.translate(size / 2, size * 0.25);
    ctx.fillStyle =
      paletteKey === 'golden-radiance' || paletteKey === 'parchment-scroll'
        ? 'rgba(255,255,255,0.22)'
        : 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 16; i++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-26, -size);
      ctx.lineTo(26, -size);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Outer & inner editorial frames
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, size - 96, size - 96);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(64, 64, size - 128, size - 128);

    // Small top cross emblem
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size / 2, 118);
    ctx.lineTo(size / 2, 194);
    ctx.moveTo(size / 2 - 26, 146);
    ctx.lineTo(size / 2 + 26, 146);
    ctx.stroke();

    // Kicker
    ctx.fillStyle = palette.accent;
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAILY WORD · RIGHTEOUS BRANCH OF CHRIST', size / 2, 245);

    // Scripture text
    ctx.fillStyle = palette.text;
    ctx.font = '600 46px "Cormorant Garamond", Georgia, serif';
    const lines = wrapTextLines(ctx, `“${verse.text}”`, size - 220);
    const lineHeight = 64;
    const totalHeight = lines.length * lineHeight;
    let startY = Math.max(330, size / 2 - totalHeight / 2 + 30);

    for (const line of lines) {
      ctx.fillText(line, size / 2, startY);
      startY += lineHeight;
    }

    // Reference
    ctx.fillStyle = palette.accent;
    ctx.font = '700 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`— ${verse.reference}`, size / 2, Math.min(size - 170, startY + 46));

    // Footer attribution
    ctx.fillStyle = palette.muted;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Righteous Branch of Christ Ministry', size / 2, size - 98);
  }, [verse, paletteKey]);

  const handleGenerateRandomVerse = () => {
    const nextVerse = pickRandomVerse(topic, verse.id);
    setVerse(nextVerse);
    setShareFeedback('');
    requestPromptGeneration(nextVerse, artStyle);
  };

  const handleStyleChange = (style: string) => {
    setArtStyle(style);
    requestPromptGeneration(verse, style);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(imagePrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleCopyVerse = async () => {
    try {
      await navigator.clipboard.writeText(
        `“${verse.text}” — ${verse.reference}\nRighteous Branch of Christ Ministry`
      );
      setCopiedVerse(true);
      setTimeout(() => setCopiedVerse(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `daily-verse-${verse.id}.png`;
    link.href = dataUrl;
    link.click();
    setShareFeedback('Saved PNG verse card to your device.');
  };

  const handleShareCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shareText = `“${verse.text}” — ${verse.reference} (Righteous Branch of Christ Ministry)`;

    try {
      if (navigator.share) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );
        if (blob) {
          const file = new File([blob], `daily-verse-${verse.id}.png`, {
            type: 'image/png',
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${verse.reference} · Righteous Branch of Christ`,
              text: shareText,
              files: [file],
            });
            setShareFeedback('Shared verse card.');
            return;
          }
        }
        await navigator.share({
          title: `${verse.reference} · Righteous Branch of Christ`,
          text: shareText,
        });
        setShareFeedback('Shared daily verse.');
        return;
      }
    } catch {
      // Fall back to clipboard
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n\nImage Prompt: ${imagePrompt}`);
      setShareFeedback('Verse & prompt copied to clipboard for sharing.');
    } catch {
      handleDownloadCard();
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
            Shareable Scripture Studio
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold text-[#1C1917]">
            Daily Verse & Image Prompt Generator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#57534E]">
            Draw a random Scripture verse, generate a tailored AI sacred-art prompt, and export a ready-to-share ministry verse card.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateRandomVerse}
          disabled={generatingPrompt}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#9A3412] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7C2D12] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${generatingPrompt ? 'animate-spin' : ''}`} />
          <span>New Random Verse</span>
        </button>
      </div>

      {/* Topic Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-semibold text-[#57534E]">Scripture Theme:</span>
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F2ECE1] p-1">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                topic === t
                  ? 'bg-white text-[#1C1917] shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Studio 2-Column Layout */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Left: Verse + AI Image Generator Prompt */}
        <div className="space-y-5 lg:col-span-6">
          <div className="rounded-xl border border-[#E5DEC9] bg-white p-5">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span className="font-semibold text-[#9A3412]">{verse.topic}</span>
              <span>King James Version</span>
            </div>
            <blockquote
              data-testid="daily-verse-text"
              className="font-display mt-3 text-2xl leading-snug font-semibold text-[#1C1917]"
            >
              “{verse.text}”
            </blockquote>
            <p
              data-testid="daily-verse-reference"
              className="mt-3 text-sm font-bold text-[#1E3A5F]"
            >
              — {verse.reference}
            </p>
            <p className="mt-3 border-t border-[#F2ECE1] pt-3 text-sm leading-relaxed text-[#57534E]">
              {reflection}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyVerse}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#D6CEBE] px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:border-[#1E3A5F]"
              >
                {copiedVerse ? <Check className="h-3.5 w-3.5 text-[#14532D]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedVerse ? 'Verse Copied' : 'Copy Verse'}</span>
              </button>
            </div>
          </div>

          {/* Image Generator Prompt Box */}
          <div className="space-y-3.5 rounded-xl border border-[#E5DEC9] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#9A3412]" />
                <h2 className="font-display text-2xl font-bold text-[#1C1917]">
                  Image Generator Prompt
                </h2>
              </div>
              <span className="text-xs text-[#57534E]">
                {generatingPrompt ? 'Crafting prompt...' : 'Ready to copy'}
              </span>
            </div>

            <div>
              <label htmlFor="art-style-select" className="block text-xs font-semibold text-[#44403C]">
                Visual Art Style
              </label>
              <select
                id="art-style-select"
                value={artStyle}
                onChange={(e) => handleStyleChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              >
                {ART_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="image-prompt-textarea" className="block text-xs font-semibold text-[#44403C]">
                Prompt (Editable)
              </label>
              <textarea
                id="image-prompt-textarea"
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] p-3 text-sm leading-relaxed text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#162C49]"
              >
                {copiedPrompt ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPrompt ? 'Prompt Copied' : 'Copy Image Prompt'}</span>
              </button>
              <button
                type="button"
                onClick={() => requestPromptGeneration(verse, artStyle)}
                disabled={generatingPrompt}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#D6CEBE] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:border-[#9A3412]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#9A3412]" />
                <span>Refine Prompt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Shareable Canvas Card Preview */}
        <div className="space-y-5 rounded-xl border border-[#E5DEC9] bg-white p-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Shareable Verse Card
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {CARD_PALETTES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPaletteKey(p.key)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    paletteKey === p.key
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-[#F2ECE1] text-[#44403C] hover:bg-[#E5DEC9]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#E5DEC9] bg-[#FAF7F2]">
            <canvas
              ref={canvasRef}
              data-testid="verse-card-canvas"
              aria-label={`Shareable scripture card for ${verse.reference}`}
              className="block aspect-square w-full h-auto"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162C49]"
            >
              <Download className="h-4 w-4" />
              <span>Download PNG Card</span>
            </button>
            <button
              type="button"
              onClick={handleShareCard}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#9A3412] bg-white px-4 py-2.5 text-sm font-semibold text-[#9A3412] transition-colors hover:bg-[#9A3412] hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Verse Card</span>
            </button>
          </div>

          {shareFeedback && (
            <p role="status" className="text-center text-xs font-medium text-[#14532D]">
              {shareFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
