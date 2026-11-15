import { useMemo, useState } from 'react';
import { ExternalLink, Plus, Search, X } from 'lucide-react';
import type { VideoCategory, VideoItem } from '../types/ministry';
import { buildYouTubeEmbedUrl, buildYouTubeWatchUrl, filterVideos } from '../utils/youtube';
import { VideoThumbnail } from './VideoThumbnail';

interface SermonsViewProps {
  videos: VideoItem[];
  activeVideo: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onOpenAdminUpload: () => void;
}

const CATEGORIES: VideoCategory[] = [
  'All',
  'Prophecy & End Times',
  'Names & Titles of Christ',
  'Old Testament & Symbolism',
  'Kingdom & Discipleship',
  'Grace & Salvation',
  'Worship & Praise',
];

const PAGE_SIZE = 24;

export function SermonsView({
  videos,
  activeVideo,
  onSelectVideo,
  onOpenAdminUpload,
}: SermonsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredVideos = useMemo(
    () => filterVideos(videos, searchQuery, selectedCategory),
    [videos, searchQuery, selectedCategory]
  );

  const displayedVideos = filteredVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVideos.length;

  const handleCategoryChange = (cat: VideoCategory) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Direct Upload Shortcut */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
            YouTube Sermon Library
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold text-[#1C1917]">
            Sermons & Prophetic Teachings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#57534E]">
            Stream every message from the Righteous Branch of Christ YouTube channel directly on this page.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAdminUpload}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162C49]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Video by Link</span>
        </button>
      </div>

      {/* Embedded On-Page YouTube Player */}
      <section aria-label="Active Sermon Video Player" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-[#E5DEC9] bg-black shadow-sm">
            <div className="aspect-video w-full">
              <iframe
                key={activeVideo.youtubeId}
                src={buildYouTubeEmbedUrl(activeVideo.youtubeId)}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#E5DEC9] bg-white p-6 lg:col-span-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span className="font-semibold text-[#9A3412]">{activeVideo.category}</span>
              <span className="font-mono tabular-nums">Now Playing</span>
            </div>
            <h2 className="font-display text-2xl font-bold leading-snug text-[#1C1917]">
              {activeVideo.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#57534E]">
              {activeVideo.description ||
                'Expository teaching from the Righteous Branch of Christ Ministry. Select any sermon from the catalog below to switch playback immediately.'}
            </p>
          </div>

          <div className="mt-6 space-y-3 border-t border-[#E5DEC9] pt-4">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span>YouTube Video ID</span>
              <span className="font-mono tabular-nums text-[#1C1917]">
                {activeVideo.youtubeId}
              </span>
            </div>
            <a
              href={buildYouTubeWatchUrl(activeVideo.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Search and Topic Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <label htmlFor="sermon-search" className="sr-only">
              Search sermons by title or description keywords
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
            <input
              id="sermon-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search by title or description keywords..."
              className="w-full rounded-md border border-[#D6CEBE] bg-white py-2.5 pr-10 pl-10 text-sm text-[#1C1917] placeholder-[#78716C] focus:border-[#1E3A5F] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(PAGE_SIZE);
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#57534E] hover:text-[#1C1917]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="font-mono text-xs text-[#57534E] tabular-nums" data-testid="video-count">
            Showing {displayedVideos.length} of {filteredVideos.length} sermons
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#F2ECE1] p-1.5">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`cursor-pointer whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white text-[#1C1917] shadow-sm'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Video Grid */}
      {displayedVideos.length === 0 ? (
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-12 text-center">
          <p className="font-display text-2xl font-semibold text-[#1C1917]">
            No matching sermons found
          </p>
          <p className="mt-2 text-sm text-[#57534E]">
            Try clearing your search filter or choosing another topic category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 cursor-pointer rounded-md bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="sermon-grid"
          >
            {displayedVideos.map((video) => {
              const isPlaying = video.id === activeVideo.id;
              return (
                <article
                  key={video.id}
                  className={`group overflow-hidden rounded-xl border bg-white transition-all ${
                    isPlaying
                      ? 'border-[#9A3412] ring-1 ring-[#9A3412]'
                      : 'border-[#E5DEC9] hover:shadow-md'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectVideo(video);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    aria-label={`Play ${video.title}`}
                    className="block w-full cursor-pointer text-left"
                  >
                    <VideoThumbnail
                      youtubeId={video.youtubeId}
                      title={video.title}
                      isPlaying={isPlaying}
                    />
                    <div className="space-y-1.5 p-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
                        <span>{video.category}</span>
                        {isPlaying && (
                          <span className="font-semibold text-[#9A3412]">Playing</span>
                        )}
                      </div>
                      <h3 className="line-clamp-2 font-display text-xl font-bold leading-snug text-[#1C1917] group-hover:text-[#9A3412]">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-[#57534E]">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </button>
                </article>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="cursor-pointer rounded-md border border-[#D6CEBE] bg-white px-6 py-2.5 text-sm font-semibold text-[#1C1917] transition-colors hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
              >
                Load More Sermons ({filteredVideos.length - displayedVideos.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
