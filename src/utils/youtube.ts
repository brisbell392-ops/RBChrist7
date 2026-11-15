import type { VideoCategory, VideoItem } from '../types/ministry.ts';

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'youtu.be') {
    const candidate = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
    return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
  }

  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    const vParam = parsed.searchParams.get('v');
    if (vParam && YOUTUBE_ID_REGEX.test(vParam)) {
      return vParam;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (
      segments.length >= 2 &&
      (segments[0] === 'embed' ||
        segments[0] === 'shorts' ||
        segments[0] === 'live' ||
        segments[0] === 'v')
    ) {
      const candidate = segments[1];
      return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
    }
  }

  return null;
}

export function buildYouTubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function buildYouTubeEmbedUrl(youtubeId: string, autoplay = false): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
  });
  if (autoplay) {
    params.set('autoplay', '1');
  }
  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

export function buildYouTubeThumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function categorizeSermonTitle(title: string): Exclude<VideoCategory, 'All'> {
  const lower = title.toLowerCase();

  if (
    /revelation|prophec|prophetic|seal|trumpet|vial|beast|little horn|babylon|rapture|tribulation|last days|last witnesses|second coming|wormwood|four horns|fig tree|day of judgment|final hour|ezekiel|hosea|witnesses/.test(
      lower
    )
  ) {
    return 'Prophecy & End Times';
  }

  if (
    /praises|praise|thanksgiving|worship|song of songs|incense|1000|one thousand names|psalm/.test(
      lower
    )
  ) {
    return 'Worship & Praise';
  }

  if (
    /tabernacle|allegory|ark|naomi|ruth|boaz|jonah|isaiah|pascha|feasts|eden|israel|abraham|david|hebrew names|old testament|covenant with animals|two eagles/.test(
      lower
    )
  ) {
    return 'Old Testament & Symbolism';
  }

  if (
    /names of|king of|prince of peace|high priest|chief shepherd|ambassador|governor|head of church|captain|guardian|healer|counselor|blameless|author and finisher|yeshua|most high|el elyon|son of man|first begotten|wonderful|true and faithful|righteous judge|noble master|lord of lords|word of god|star of the east|rising star|mighty/.test(
      lower
    )
  ) {
    return 'Names & Titles of Christ';
  }

  if (
    /grace|salvation|redemption|merciful|gracious|kindness|caring|comforting|fountain|bride|marriage|love|hope|promises|gospel|saved|chosen/.test(
      lower
    )
  ) {
    return 'Grace & Salvation';
  }

  return 'Kingdom & Discipleship';
}

export function filterVideos(
  videos: VideoItem[],
  searchQuery: string,
  selectedCategory: VideoCategory
): VideoItem[] {
  const tokens = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return videos.filter((video) => {
    if (selectedCategory !== 'All' && video.category !== selectedCategory) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }
    const haystack = `${video.title} ${video.description ?? ''} ${video.category}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

