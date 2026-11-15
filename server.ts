import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

import { generateStandaloneHtml } from './src/utils/exportWebpage.ts';

import { DEFAULT_MINISTRY_PROFILE, SEED_VIDEOS } from './src/data/seedVideos.ts';
import type {
  BibleChapterData,
  MinistryProfile,
  SongPdfItem,
  VideoCategory,
  VideoItem,
} from './src/types/ministry.ts';
import {
  buildYouTubeWatchUrl,
  categorizeSermonTitle,
  extractYouTubeId,
} from './src/utils/youtube.ts';
import {
  BIBLE_CHAPTERS,
  CURATED_VERSES,
  buildDefaultImagePrompt,
  pickRandomVerse,
} from './src/utils/bible.ts';

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const ADMIN_PASSCODE = process.env.ADMIN_PASSWORD || 'rbcm-admin-2026';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`rbcm-session-${ADMIN_PASSCODE}`).digest('hex');
const COOKIE_NAME = 'rbcm_admin_session';

interface DatabaseSchema {
  ministry: MinistryProfile;
  videos: VideoItem[];
  songs: SongPdfItem[];
  translationCache: Record<string, string>;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function createSamplePdf(
  filePath: string,
  title: string,
  hymnNumber: string,
  composer: string,
  language: string,
  stanzas: string[]
): Promise<number> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const sansRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { height } = page.getSize();
  let y = height - 72;

  page.drawText('RIGHTEOUS BRANCH OF CHRIST MINISTRY · HYMNAL', {
    x: 64,
    y,
    size: 10,
    font: sansRegular,
    color: rgb(0.45, 0.25, 0.12),
  });

  y -= 30;
  page.drawText(`${hymnNumber} — ${title}`, {
    x: 64,
    y,
    size: 22,
    font: serifBold,
    color: rgb(0.11, 0.1, 0.09),
  });

  y -= 22;
  page.drawText(`Composer / Source: ${composer}  |  Language: ${language}`, {
    x: 64,
    y,
    size: 11,
    font: sansRegular,
    color: rgb(0.35, 0.33, 0.3),
  });

  y -= 16;
  page.drawLine({
    start: { x: 64, y },
    end: { x: 548, y },
    thickness: 1,
    color: rgb(0.82, 0.78, 0.7),
  });

  y -= 32;
  for (const stanza of stanzas) {
    const lines = stanza.split('\n');
    for (const line of lines) {
      if (y < 72) break;
      page.drawText(line, {
        x: 64,
        y,
        size: 13,
        font: serifRegular,
        color: rgb(0.15, 0.14, 0.13),
      });
      y -= 20;
    }
    y -= 14;
  }

  page.drawText('Righteous Branch of Christ Ministry · Sanctuary Song Sheet', {
    x: 64,
    y: 44,
    size: 9,
    font: sansRegular,
    color: rgb(0.45, 0.42, 0.38),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return pdfBytes.byteLength;
}

async function ensureInitialized(): Promise<DatabaseSchema> {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
      if (parsed.videos && parsed.ministry && parsed.songs) {
        return {
          ministry: parsed.ministry,
          videos: parsed.videos,
          songs: parsed.songs,
          translationCache: parsed.translationCache ?? {},
        };
      }
    } catch {
      // Re-seed if db file was corrupted
    }
  }

  const seedSongsSpec = [
    {
      id: 'song-1',
      title: 'The Righteous Branch Shall Reign',
      hymnNumber: 'Hymn 01',
      language: 'English',
      composer: 'Righteous Branch Sanctuary Choir',
      fileName: 'hymn-01-righteous-branch.pdf',
      stanzas: [
        '1. Behold the days of promise dawn,\nThe Branch of David rises bright;\nIn righteousness our King shall reign,\nAnd fill the earth with holy light.',
        'Chorus:\nWorthy is the Lamb, the Living Vine,\nIn Him our weary souls abide;\nThe Lord our Righteousness is near,\nOur Shepherd, Saviour, King, and Guide.',
        '2. As living branches in the Vine,\nWe bear the fruit of love and grace;\nBuilt up a temple in the Lord,\nTo magnify His holy Name.',
      ],
    },
    {
      id: 'song-2',
      title: 'Christ in You, the Hope of Glory',
      hymnNumber: 'Hymn 02',
      language: 'English',
      composer: 'Righteous Branch Worship Fellowship',
      fileName: 'hymn-02-hope-of-glory.pdf',
      stanzas: [
        '1. Hidden treasure of the ages,\nMystery revealed in grace;\nChrist within His living temple,\nShining in the secret place.',
        'Chorus:\nChrist in us, the hope of glory,\nAnchor of the steadfast soul;\nEvery nation hears the story,\nJesus makes the broken whole.',
        '2. From the footstool to the throne room,\nWorshipping in spirit true;\nSealed unto the day of promise,\nAll things made forever new.',
      ],
    },
    {
      id: 'song-3',
      title: 'Yeshua Ha Messiah, Prince of Peace',
      hymnNumber: 'Hymn 03',
      language: 'English / Hebrew',
      composer: 'Sanctuary Praise Ensemble',
      fileName: 'hymn-03-yeshua-prince-of-peace.pdf',
      stanzas: [
        '1. El Elyon, Most High Creator,\nAuthor of our steadfast faith;\nGuardian of the souls who trust Thee,\nStronger than the power of death.',
        'Chorus:\nYeshua Ha Messiah, King of kings,\nTo Thy altar praise we bring;\nGreat Chief Shepherd of the flock,\nOur eternal Cornerstone and Rock.',
        '2. Holy High Priest, true and faithful,\nSoon returning for Thy bride;\nKeep our lamps forever burning,\nClose within Thy wounded side.',
      ],
    },
  ];

  const songs: SongPdfItem[] = [];
  for (const spec of seedSongsSpec) {
    const filePath = path.join(UPLOADS_DIR, spec.fileName);
    const size = await createSamplePdf(
      filePath,
      spec.title,
      spec.hymnNumber,
      spec.composer,
      spec.language,
      spec.stanzas
    );
    songs.push({
      id: spec.id,
      title: spec.title,
      hymnNumber: spec.hymnNumber,
      language: spec.language,
      composer: spec.composer,
      fileName: spec.fileName,
      fileSizeBytes: size,
      lyricsExcerpt: spec.stanzas.join('\n\n'),
      uploadedAt: new Date(Date.UTC(2026, 10, 10)).toISOString(),
    });
  }

  const initialDb: DatabaseSchema = {
    ministry: DEFAULT_MINISTRY_PROFILE,
    videos: SEED_VIDEOS,
    songs,
    translationCache: {},
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(db: DatabaseSchema): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function signSessionToken(payload: { role: 'admin'; exp: number }): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return false;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    out[key] = val;
  }
  return out;
}

function extractTokenFromRequest(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME];
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromRequest(req);
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}

async function googleTranslateText(text: string, targetLang: string): Promise<string> {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Google Translate HTTP ${response.status}`);
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected Google Translate response');
  }
  const translated = (data[0] as unknown[])
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
    .join('');

  if (!translated.trim()) {
    throw new Error('Empty translation returned');
  }
  return translated;
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 48);
    cb(null, `${Date.now()}-${safeBase || 'song'}.pdf`);
  },
});

const uploadPdf = multer({
  storage: uploadStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      cb(new Error('Only PDF files (.pdf) are permitted.'));
      return;
    }
    cb(null, true);
  },
});

async function startServer() {
  const db = await ensureInitialized();
  const app = express();

  app.use(express.json({ limit: '2mb' }));

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', videos: db.videos.length, songs: db.songs.length });
  });

  // Admin Auth
  app.get('/api/admin/session', (req, res) => {
    const token = extractTokenFromRequest(req);
    const authenticated = verifySessionToken(token);
    res.json({ authenticated });
  });

  app.post('/api/admin/login', (req, res) => {
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
    const inputBuf = Buffer.from(passcode);
    const expectedBuf = Buffer.from(ADMIN_PASSCODE);
    const matches =
      inputBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(inputBuf, expectedBuf);

    if (!matches) {
      res.status(401).json({ error: 'Invalid admin passcode. Please try again.' });
      return;
    }

    const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
    const token = signSessionToken({ role: 'admin', exp });
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}`
    );
    res.json({ authenticated: true, token });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );
    res.json({ authenticated: false });
  });

  // Ministry Profile
  app.get('/api/ministry', (_req, res) => {
    res.json(db.ministry);
  });

  app.put('/api/ministry', requireAdmin, (req, res) => {
    const body = req.body as Partial<MinistryProfile>;
    db.ministry = {
      name: body.name?.trim() || db.ministry.name,
      tagline: body.tagline?.trim() || db.ministry.tagline,
      aboutShort: body.aboutShort?.trim() || db.ministry.aboutShort,
      aboutExtended: body.aboutExtended?.trim() || db.ministry.aboutExtended,
      serviceSchedule: body.serviceSchedule?.trim() || db.ministry.serviceSchedule,
      youtubeChannelUrl: body.youtubeChannelUrl?.trim() || db.ministry.youtubeChannelUrl,
      contactEmail: body.contactEmail?.trim() || db.ministry.contactEmail,
      location: body.location?.trim() || db.ministry.location,
    };
    saveDb(db);
    res.json(db.ministry);
  });

  // Videos API
  app.get('/api/videos', (_req, res) => {
    res.json(db.videos);
  });

  app.post('/api/videos/oembed', requireAdmin, async (req, res) => {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url : '';
    const youtubeId = extractYouTubeId(rawUrl);
    if (!youtubeId) {
      res.status(400).json({ error: 'Please enter a valid YouTube video URL.' });
      return;
    }

    const watchUrl = buildYouTubeWatchUrl(youtubeId);
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (oembedRes.ok) {
        const data = (await oembedRes.json()) as { title?: string; author_name?: string };
        res.json({
          youtubeId,
          youtubeUrl: watchUrl,
          title: data.title ?? '',
          author: data.author_name ?? '',
        });
        return;
      }
    } catch {
      // Fallback below if YouTube oEmbed is unreachable
    }

    res.json({ youtubeId, youtubeUrl: watchUrl, title: '', author: '' });
  });

  app.post('/api/videos', requireAdmin, async (req, res) => {
    const rawUrl = typeof req.body?.youtubeUrl === 'string' ? req.body.youtubeUrl : '';
    let title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const categoryInput = req.body?.category as Exclude<VideoCategory, 'All'> | undefined;
    const description =
      typeof req.body?.description === 'string' ? req.body.description.trim() : undefined;
    const featured = Boolean(req.body?.featured);

    const youtubeId = extractYouTubeId(rawUrl);
    if (!youtubeId) {
      res.status(400).json({ error: 'Please enter a valid YouTube video link or 11-character ID.' });
      return;
    }

    const watchUrl = buildYouTubeWatchUrl(youtubeId);

    if (!title) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (oembedRes.ok) {
          const data = (await oembedRes.json()) as { title?: string };
          if (data.title) title = data.title.trim();
        }
      } catch {
        // Ignore oEmbed failure
      }
    }

    if (!title) {
      res.status(400).json({ error: 'Please provide a sermon or video title.' });
      return;
    }

    const newVideo: VideoItem = {
      id: `vid-${Date.now()}`,
      title,
      youtubeUrl: watchUrl,
      youtubeId,
      category: categoryInput || categorizeSermonTitle(title),
      description,
      featured,
      addedAt: new Date().toISOString(),
    };

    db.videos = [newVideo, ...db.videos];
    saveDb(db);
    res.status(201).json(newVideo);
  });

  app.patch('/api/videos/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const idx = db.videos.findIndex((v) => v.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Video not found.' });
      return;
    }

    const existing = db.videos[idx];
    const nextTitle =
      typeof req.body?.title === 'string' && req.body.title.trim()
        ? req.body.title.trim()
        : existing.title;
    const nextCategory =
      (req.body?.category as Exclude<VideoCategory, 'All'> | undefined) || existing.category;
    const nextFeatured =
      typeof req.body?.featured === 'boolean' ? req.body.featured : existing.featured;
    const nextDescription =
      typeof req.body?.description === 'string' ? req.body.description.trim() : existing.description;

    db.videos[idx] = {
      ...existing,
      title: nextTitle,
      category: nextCategory,
      featured: nextFeatured,
      description: nextDescription,
    };
    saveDb(db);
    res.json(db.videos[idx]);
  });

  app.delete('/api/videos/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const before = db.videos.length;
    db.videos = db.videos.filter((v) => v.id !== id);
    if (db.videos.length === before) {
      res.status(404).json({ error: 'Video not found.' });
      return;
    }
    saveDb(db);
    res.json({ deleted: id });
  });

  // Bible Lookup & Google Translate Parallel Endpoint
  app.get('/api/bible/chapter', async (req, res) => {
    const book = String(req.query.book || '').trim();
    const chapterNum = Number(req.query.chapter || 1);

    if (!book || !Number.isFinite(chapterNum) || chapterNum < 1) {
      res.status(400).json({ error: 'Valid book name and chapter number are required.' });
      return;
    }

    const local = BIBLE_CHAPTERS.find(
      (c) => c.book.toLowerCase() === book.toLowerCase() && c.chapter === chapterNum
    );
    if (local) {
      res.json(local);
      return;
    }

    // Fetch live chapter across multiple versions via bible-api.com
    try {
      const ref = encodeURIComponent(`${book} ${chapterNum}`);
      const [kjvRes, webRes, bbeRes] = await Promise.all([
        fetch(`https://bible-api.com/${ref}?translation=kjv`, { signal: AbortSignal.timeout(7000) }),
        fetch(`https://bible-api.com/${ref}?translation=web`, { signal: AbortSignal.timeout(7000) }),
        fetch(`https://bible-api.com/${ref}?translation=bbe`, { signal: AbortSignal.timeout(7000) }),
      ]);

      if (!kjvRes.ok) {
        res.status(404).json({ error: `Could not find ${book} chapter ${chapterNum}.` });
        return;
      }

      const kjvJson = (await kjvRes.json()) as {
        reference?: string;
        verses?: Array<{ verse: number; text: string }>;
      };
      const webJson = webRes.ok
        ? ((await webRes.json()) as { verses?: Array<{ verse: number; text: string }> })
        : {};
      const bbeJson = bbeRes.ok
        ? ((await bbeRes.json()) as { verses?: Array<{ verse: number; text: string }> })
        : {};

      const webMap = new Map((webJson.verses ?? []).map((v) => [v.verse, v.text.trim()]));
      const bbeMap = new Map((bbeJson.verses ?? []).map((v) => [v.verse, v.text.trim()]));

      const verses = (kjvJson.verses ?? []).slice(0, 45).map((v) => {
        const cleanKjv = v.text.replace(/\s+/g, ' ').trim();
        const cleanWeb = (webMap.get(v.verse) || cleanKjv).replace(/\s+/g, ' ').trim();
        const cleanBbe = (bbeMap.get(v.verse) || cleanWeb).replace(/\s+/g, ' ').trim();
        return {
          verse: v.verse,
          versions: {
            KJV: cleanKjv,
            ASV: cleanKjv,
            WEB: cleanWeb,
            BBE: cleanBbe,
          },
        };
      });

      if (verses.length === 0) {
        res.status(404).json({ error: `No verses found for ${book} ${chapterNum}.` });
        return;
      }

      const result: BibleChapterData = {
        id: `${book.toLowerCase()}-${chapterNum}`,
        book,
        chapter: chapterNum,
        title: kjvJson.reference || `${book} ${chapterNum}`,
        verses,
      };
      res.json(result);
    } catch {
      res.status(502).json({
        error:
          'Live Bible chapter lookup is temporarily unavailable. Select one of the built-in study chapters.',
      });
    }
  });

  app.post('/api/bible/translate', async (req, res) => {
    const targetLanguage = String(req.body?.targetLanguage || '').trim();
    const targetLanguageName = String(req.body?.targetLanguageName || targetLanguage).trim();
    const verses = Array.isArray(req.body?.verses)
      ? (req.body.verses as Array<{ verse: number; text: string }>)
      : [];

    if (!targetLanguage || verses.length === 0) {
      res.status(400).json({ error: 'targetLanguage and verses array are required.' });
      return;
    }

    const translations: Record<number, string> = {};
    const uncached: Array<{ verse: number; text: string; cacheKey: string }> = [];

    for (const item of verses) {
      const hash = crypto
        .createHash('sha1')
        .update(`${targetLanguage}:${item.text}`)
        .digest('hex');
      if (db.translationCache[hash]) {
        translations[item.verse] = db.translationCache[hash];
      } else {
        uncached.push({ verse: item.verse, text: item.text, cacheKey: hash });
      }
    }

    if (uncached.length > 0) {
      let cacheUpdated = false;

      // Primary: Google Translate endpoint
      const remainingForAi: typeof uncached = [];
      await Promise.all(
        uncached.map(async (item) => {
          try {
            const translated = await googleTranslateText(item.text, targetLanguage);
            translations[item.verse] = translated;
            db.translationCache[item.cacheKey] = translated;
            cacheUpdated = true;
          } catch {
            remainingForAi.push(item);
          }
        })
      );

      // Secondary fallback: Gemini 4 Hydrogen if Google Translate blocked/rate-limited
      if (remainingForAi.length > 0) {
        const ai = getGeminiClient();
        if (ai) {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-4-hydrogen',
              contents: `Translate the following Bible verses accurately and reverently into ${targetLanguageName} (${targetLanguage}). Return JSON array matching verse numbers.\n\n${JSON.stringify(
                remainingForAi.map((u) => ({ verse: u.verse, text: u.text }))
              )}`,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      verse: { type: Type.INTEGER },
                      translated: { type: Type.STRING },
                    },
                  },
                },
              },
            });
            const parsed = JSON.parse((response.text ?? '[]').trim()) as Array<{
              verse: number;
              translated: string;
            }>;
            for (const row of parsed) {
              if (row.translated) {
                translations[row.verse] = row.translated;
                const match = remainingForAi.find((u) => u.verse === row.verse);
                if (match) {
                  db.translationCache[match.cacheKey] = row.translated;
                  cacheUpdated = true;
                }
              }
            }
          } catch {
            // Leave untranslated items to fallback gracefully
          }
        }
      }

      if (cacheUpdated) {
        saveDb(db);
      }
    }

    res.json({ targetLanguage, translations });
  });

  // Daily Verse & Image Prompt Generator
  app.post('/api/daily-verse/prompt', async (req, res) => {
    const verseId = typeof req.body?.verseId === 'string' ? req.body.verseId : undefined;
    const topic = req.body?.topic;
    const artStyle =
      typeof req.body?.artStyle === 'string' && req.body.artStyle.trim()
        ? req.body.artStyle.trim()
        : 'Sacred Botanical Light';

    const verse =
      CURATED_VERSES.find((v) => v.id === verseId) ?? pickRandomVerse(topic, undefined);

    const fallbackPrompt = buildDefaultImagePrompt(verse, artStyle);
    const fallbackReflection = `Meditation on ${verse.reference}: Abide in Christ, the Righteous Branch, and let His Word anchor your heart in peace, hope, and faithful fruitfulness today.`;

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        verse,
        imagePrompt: fallbackPrompt,
        reflection: fallbackReflection,
        artStyle,
        source: 'curated',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `You are serving Righteous Branch of Christ Ministry. Given this Bible verse:
Reference: ${verse.reference}
Text: "${verse.text}"
Desired Visual Style: ${artStyle}

1) Write a vivid, reverent "imagePrompt" (45-70 words) suitable for an AI image generator to create a shareable sacred devotional artwork card backdrop (specify lighting, symbolism, palette, composition, and end with "no embedded text").
2) Write a brief 2-sentence Christian devotional "reflection" grounded in the verse.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              imagePrompt: { type: Type.STRING },
              reflection: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        imagePrompt?: string;
        reflection?: string;
      };

      res.json({
        verse,
        imagePrompt: parsed.imagePrompt?.trim() || fallbackPrompt,
        reflection: parsed.reflection?.trim() || fallbackReflection,
        artStyle,
        source: 'gemini',
      });
    } catch {
      res.json({
        verse,
        imagePrompt: fallbackPrompt,
        reflection: fallbackReflection,
        artStyle,
        source: 'curated',
      });
    }
  });

  // Song PDF Library API
  app.get('/api/songs', (_req, res) => {
    res.json(db.songs);
  });

  app.get('/api/songs/:id/pdf', (req, res) => {
    const song = db.songs.find((s) => s.id === req.params.id);
    if (!song) {
      res.status(404).json({ error: 'Song PDF not found.' });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, path.basename(song.fileName));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'PDF file missing on server.' });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${song.fileName.replace(/"/g, '')}"`
    );
    fs.createReadStream(filePath).pipe(res);
  });

  app.post('/api/songs', (req, res) => {
    uploadPdf.single('pdf')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'PDF upload failed.' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'Please select a PDF file to upload.' });
        return;
      }

      const title = String(req.body?.title || '').trim();
      if (!title) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({ error: 'Song title is required.' });
        return;
      }

      const hymnNumber = String(req.body?.hymnNumber || `Hymn ${db.songs.length + 1}`).trim();
      const language = String(req.body?.language || 'English').trim();
      const composer = String(req.body?.composer || 'Righteous Branch Congregation').trim();
      const lyricsExcerpt = String(
        req.body?.lyricsExcerpt || 'Open the PDF reader above to view the complete song sheet.'
      ).trim();

      const newSong: SongPdfItem = {
        id: `song-${Date.now()}`,
        title,
        hymnNumber,
        language,
        composer,
        fileName: req.file.filename,
        fileSizeBytes: req.file.size,
        lyricsExcerpt,
        uploadedAt: new Date().toISOString(),
      };

      db.songs = [newSong, ...db.songs];
      saveDb(db);
      res.status(201).json(newSong);
    });
  });

  app.delete('/api/songs/:id', requireAdmin, (req, res) => {
    const song = db.songs.find((s) => s.id === req.params.id);
    if (!song) {
      res.status(404).json({ error: 'Song PDF not found.' });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, path.basename(song.fileName));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    db.songs = db.songs.filter((s) => s.id !== song.id);
    saveDb(db);
    res.json({ deleted: song.id });
  });

  // Webpage & Full Site Archive Export
  const buildExportAssets = () => {
    const publicEmblem = path.resolve(
      process.cwd(),
      'public/assets/aistudio/WhatsApp_Image_2026-11-15_at_11.03.38_PM_218d6ff4.jpeg'
    );
    const distEmblem = path.resolve(
      process.cwd(),
      'dist/assets/aistudio/WhatsApp_Image_2026-11-15_at_11.03.38_PM_218d6ff4.jpeg'
    );
    const emblemPath = fs.existsSync(publicEmblem) ? publicEmblem : distEmblem;
    let emblemBuffer: Buffer | null = null;
    let emblemDataUri: string | undefined;
    if (fs.existsSync(emblemPath)) {
      emblemBuffer = fs.readFileSync(emblemPath);
      emblemDataUri = `data:image/jpeg;base64,${emblemBuffer.toString('base64')}`;
    }

    const songPdfDataUris: Record<string, string> = {};
    const songPdfBuffers: Array<{ fileName: string; buffer: Buffer }> = [];

    for (const song of db.songs) {
      const safeName = path.basename(song.fileName);
      const pdfPath = path.join(UPLOADS_DIR, safeName);
      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        songPdfBuffers.push({ fileName: safeName, buffer: pdfBuffer });
        if (pdfBuffer.byteLength <= 2 * 1024 * 1024) {
          songPdfDataUris[song.id] = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
        }
      }
    }

    return { emblemBuffer, emblemDataUri, songPdfDataUris, songPdfBuffers };
  };

  app.get('/api/export/webpage', (_req, res) => {
    const { emblemDataUri, songPdfDataUris } = buildExportAssets();
    const html = generateStandaloneHtml({
      profile: db.ministry,
      videos: db.videos,
      songs: db.songs,
      chapters: BIBLE_CHAPTERS,
      verses: CURATED_VERSES,
      emblemDataUri,
      songPdfDataUris,
      generatedAt: new Date().toISOString(),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="righteous-branch-of-christ-ministry.html"'
    );
    res.send(html);
  });

  app.get('/api/export/archive', async (_req, res) => {
    try {
      const { emblemBuffer, emblemDataUri, songPdfDataUris, songPdfBuffers } = buildExportAssets();
      const generatedAt = new Date().toISOString();

      const html = generateStandaloneHtml({
        profile: db.ministry,
        videos: db.videos,
        songs: db.songs,
        chapters: BIBLE_CHAPTERS,
        verses: CURATED_VERSES,
        emblemDataUri,
        songPdfDataUris,
        generatedAt,
      });

      const zip = new JSZip();
      zip.file('index.html', html);

      if (emblemBuffer) {
        zip.file('assets/emblem.jpeg', emblemBuffer);
      }

      for (const pdf of songPdfBuffers) {
        zip.file(`songs/${pdf.fileName}`, pdf.buffer);
      }

      zip.file(
        'data/ministry-backup.json',
        JSON.stringify(
          {
            exportedAt: generatedAt,
            ministry: db.ministry,
            videos: db.videos,
            songs: db.songs,
          },
          null,
          2
        )
      );

      zip.file(
        'README.txt',
        [
          `${db.ministry.name} — Offline Website Archive`,
          `Exported: ${generatedAt}`,
          '',
          'Contents:',
          '- index.html: Complete standalone webpage (open in any browser on desktop or mobile)',
          '- assets/emblem.jpeg: Ministry cross & vine emblem image',
          '- songs/*.pdf: Uploaded congregation song sheet PDFs',
          '- data/ministry-backup.json: Complete backup of ministry profile, video links, and song metadata',
          '',
          'Note: YouTube sermon playback inside index.html streams directly from YouTube when online.',
        ].join('\n')
      );

      const archiveBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="righteous-branch-website-archive.zip"'
      );
      res.send(archiveBuffer);
    } catch {
      res.status(500).json({ error: 'Failed to generate website archive.' });
    }
  });

  // Vite or Static Frontend
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Righteous Branch of Christ Ministry running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
