export type VideoCategory =
  | 'All'
  | 'Prophecy & End Times'
  | 'Names & Titles of Christ'
  | 'Old Testament & Symbolism'
  | 'Kingdom & Discipleship'
  | 'Grace & Salvation'
  | 'Worship & Praise';

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  category: Exclude<VideoCategory, 'All'>;
  description?: string;
  featured?: boolean;
  addedAt: string;
}

export interface MinistryProfile {
  name: string;
  tagline: string;
  aboutShort: string;
  aboutExtended: string;
  serviceSchedule: string;
  youtubeChannelUrl: string;
  contactEmail: string;
  location: string;
}

export type BibleVersionKey = 'KJV' | 'ASV' | 'WEB' | 'BBE';

export interface BibleVerseEntry {
  verse: number;
  versions: Record<BibleVersionKey, string>;
}

export interface BibleChapterData {
  id: string;
  book: string;
  chapter: number;
  title: string;
  verses: BibleVerseEntry[];
}

export interface CuratedVerse {
  id: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  topic: 'Promises' | 'Prophecy' | 'Worship' | 'Grace' | 'Wisdom';
  text: string;
}

export interface DailyVersePackage {
  verse: CuratedVerse;
  imagePrompt: string;
  reflection: string;
  artStyle: string;
}

export interface SongPdfItem {
  id: string;
  title: string;
  hymnNumber: string;
  language: string;
  composer: string;
  fileName: string;
  fileSizeBytes: number;
  lyricsExcerpt: string;
  uploadedAt: string;
}

export type ActiveTab = 'home' | 'sermons' | 'bible' | 'daily-verse' | 'songs' | 'admin';
