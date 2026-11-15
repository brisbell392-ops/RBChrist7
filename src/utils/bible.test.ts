import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIBLE_CHAPTERS,
  CURATED_VERSES,
  pickRandomVerse,
  buildDefaultImagePrompt,
  alignParallelVerses,
} from './bible';

test('pickRandomVerse respects topic filter and excludes current verse', () => {
  const first = CURATED_VERSES.find((v) => v.topic === 'Prophecy')!;
  const picked = pickRandomVerse('Prophecy', first.id, () => 0);
  assert.equal(picked.topic, 'Prophecy');
  assert.notEqual(picked.id, first.id);
});

test('buildDefaultImagePrompt includes verse reference and chosen style', () => {
  const verse = CURATED_VERSES[0];
  const prompt = buildDefaultImagePrompt(verse, 'Stained Glass Cathedral');
  assert.ok(prompt.includes(verse.reference));
  assert.ok(prompt.includes('stained-glass'));
});

test('alignParallelVerses pairs versions and translated verses cleanly', () => {
  const chapter = BIBLE_CHAPTERS[0];
  const rows = alignParallelVerses(chapter, 'KJV', 'WEB', { 5: 'Tamil verse 5' });
  assert.equal(rows.length, chapter.verses.length);
  assert.equal(rows[0].verseNumber, 5);
  assert.ok(rows[0].leftText.includes('saith the LORD'));
  assert.equal(rows[0].rightText, 'Tamil verse 5');
  assert.ok(rows[1].rightText.includes('Yahweh our righteousness'));
});
