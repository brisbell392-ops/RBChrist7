import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MINISTRY_PROFILE, SEED_VIDEOS } from '../data/seedVideos';
import { BIBLE_CHAPTERS, CURATED_VERSES } from './bible';
import { escapeHtml, generateStandaloneHtml, safeJsonForScript } from './exportWebpage';

test('escapeHtml neutralizes HTML special characters', () => {
  assert.equal(
    escapeHtml(`<script>alert("x'&")</script>`),
    '&lt;script&gt;alert(&quot;x&#39;&amp;&quot;)&lt;/script&gt;'
  );
});

test('safeJsonForScript prevents closing script tag injection', () => {
  const serialized = safeJsonForScript({ title: '</script><script>alert(1)</script>' });
  assert.equal(serialized.includes('</script>'), false);
  assert.equal(serialized.includes('\\u003c/script\\u003e'), true);
});

test('generateStandaloneHtml outputs self-contained webpage with all videos, Bible chapters, verses, and songs', () => {
  const html = generateStandaloneHtml({
    profile: DEFAULT_MINISTRY_PROFILE,
    videos: SEED_VIDEOS.slice(0, 5),
    songs: [
      {
        id: 'song-test',
        title: 'Living Branch <Hymn>',
        hymnNumber: 'Hymn 01',
        language: 'English',
        composer: 'Sanctuary Choir',
        fileName: 'hymn-01.pdf',
        fileSizeBytes: 1200,
        lyricsExcerpt: 'Praise the Lord our Righteousness.',
        uploadedAt: '2026-11-15T00:00:00.000Z',
      },
    ],
    chapters: BIBLE_CHAPTERS,
    verses: CURATED_VERSES,
    emblemDataUri: 'data:image/jpeg;base64,ZmFrZQ==',
    songPdfDataUris: {
      'song-test': 'data:application/pdf;base64,JVBERi0=',
    },
    generatedAt: '2026-11-15T12:00:00.000Z',
  });

  assert.match(html, /^<!doctype html>/i);
  assert.ok(html.includes(DEFAULT_MINISTRY_PROFILE.name));
  assert.ok(html.includes('Sermons (5)'));
  assert.ok(html.includes('data:image/jpeg;base64,ZmFrZQ=='));
  assert.ok(html.includes('data:application/pdf;base64,JVBERi0='));
  assert.ok(html.includes(SEED_VIDEOS[0].youtubeId));
  assert.equal(html.includes('Living Branch <Hymn>'), false);
  assert.ok(html.includes('Living Branch \\u003cHymn\\u003e'));
});
