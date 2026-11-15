import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeId,
  buildYouTubeWatchUrl,
  buildYouTubeEmbedUrl,
  buildYouTubeThumbnailUrl,
  categorizeSermonTitle,
  filterVideos,
} from './youtube';
import type { VideoItem } from '../types/ministry';

test('extractYouTubeId parses standard watch URLs', () => {
  assert.equal(
    extractYouTubeId('https://www.youtube.com/watch?v=yFecv7Y3yc8'),
    'yFecv7Y3yc8'
  );
  assert.equal(
    extractYouTubeId('https://www.youtube.com/watch?v=Z5xVTShHH20&t=120s'),
    'Z5xVTShHH20'
  );
});

test('extractYouTubeId parses short youtu.be, live, shorts, and embed URLs', () => {
  assert.equal(extractYouTubeId('https://youtu.be/j2GEkczGVx8'), 'j2GEkczGVx8');
  assert.equal(extractYouTubeId('https://youtube.com/live/QmQ-tz20Pwk?feature=share'), 'QmQ-tz20Pwk');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/f8QiXCVDTrQ'), 'f8QiXCVDTrQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/embed/ah52nFix1wc'), 'ah52nFix1wc');
  assert.equal(extractYouTubeId('X63y9RD5nSg'), 'X63y9RD5nSg');
});

test('extractYouTubeId rejects invalid or non-YouTube URLs', () => {
  assert.equal(extractYouTubeId(''), null);
  assert.equal(extractYouTubeId('https://vimeo.com/123456'), null);
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=short'), null);
});

test('buildYouTube URL helpers produce expected URLs', () => {
  assert.equal(
    buildYouTubeWatchUrl('yFecv7Y3yc8'),
    'https://www.youtube.com/watch?v=yFecv7Y3yc8'
  );
  assert.equal(
    buildYouTubeEmbedUrl('yFecv7Y3yc8', true),
    'https://www.youtube.com/embed/yFecv7Y3yc8?rel=0&modestbranding=1&autoplay=1'
  );
  assert.equal(
    buildYouTubeThumbnailUrl('yFecv7Y3yc8'),
    'https://i.ytimg.com/vi/yFecv7Y3yc8/hqdefault.jpg'
  );
});

test('categorizeSermonTitle assigns relevant ministry categories', () => {
  assert.equal(
    categorizeSermonTitle('The 7 Churches of Revelation'),
    'Prophecy & End Times'
  );
  assert.equal(
    categorizeSermonTitle('Tabernacle and the 3 types of Baptisms in New Covenant'),
    'Old Testament & Symbolism'
  );
  assert.equal(
    categorizeSermonTitle('Prince of Peace LORD Jesus Christ'),
    'Names & Titles of Christ'
  );
  assert.equal(
    categorizeSermonTitle('Praises of Jesus 1000'),
    'Worship & Praise'
  );
});

test('filterVideos matches title and description keywords across categories', () => {
  const sample: VideoItem[] = [
    {
      id: '1',
      title: 'Temple of Living God: Jesus Christ',
      youtubeUrl: 'https://www.youtube.com/watch?v=yFecv7Y3yc8',
      youtubeId: 'yFecv7Y3yc8',
      category: 'Kingdom & Discipleship',
      description: 'Teaching on 1 Corinthians 3:16 and dwelling in Christ.',
      addedAt: '2026-11-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Mark of God and Mark of Beast',
      youtubeUrl: 'https://www.youtube.com/watch?v=QmQ-tz20Pwk',
      youtubeId: 'QmQ-tz20Pwk',
      category: 'Prophecy & End Times',
      description: 'Revelation 13 and Revelation 14 prophetic study.',
      addedAt: '2026-11-14T00:00:00Z',
    },
  ];

  // Matches title keyword
  assert.equal(filterVideos(sample, 'Temple', 'All').length, 1);
  // Matches description keyword not in title
  const descMatch = filterVideos(sample, 'Corinthians', 'All');
  assert.equal(descMatch.length, 1);
  assert.equal(descMatch[0].id, '1');
  // Matches multi-word keyword across title + description
  assert.equal(filterVideos(sample, 'Beast Revelation', 'All').length, 1);
  // Respects selected category
  assert.equal(filterVideos(sample, 'Corinthians', 'Prophecy & End Times').length, 0);
});

