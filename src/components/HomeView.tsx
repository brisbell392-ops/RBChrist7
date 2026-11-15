import { useState } from 'react';
import { ArrowRight, BookOpen, Download, ExternalLink, FileText, Sparkles, Tv } from 'lucide-react';
import type { ActiveTab, MinistryProfile, VideoItem } from '../types/ministry';
import { downloadMinistryExport } from '../utils/download';
import { buildYouTubeEmbedUrl, buildYouTubeWatchUrl } from '../utils/youtube';
import { VideoThumbnail } from './VideoThumbnail';

interface HomeViewProps {
  profile: MinistryProfile;
  videos: VideoItem[];
  activeVideo: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onNavigate: (tab: ActiveTab) => void;
  songCount: number;
}

export function HomeView({
  profile,
  videos,
  activeVideo,
  onSelectVideo,
  onNavigate,
  songCount,
}: HomeViewProps) {
  const featuredList = videos.slice(0, 6);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleSaveWebpage = async () => {
    setDownloadingHtml(true);
    setDownloadStatus('');
    try {
      const result = await downloadMinistryExport('webpage');
      const kb = Math.max(1, Math.round(result.sizeBytes / 1024));
      setDownloadStatus(`Saved ${result.fileName} (${kb} KB) to your device.`);
    } catch (err) {
      setDownloadStatus(err instanceof Error ? err.message : 'Download failed.');
    } finally {
      setDownloadingHtml(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Editorial Hero with Ministry Emblem & Brief Ministry Description */}
      <section className="border-b border-[#E5DEC9] bg-gradient-to-b from-[#FAF7F2] to-[#F2ECE1]/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
          <div className="space-y-6 lg:col-span-7">
            <p className="text-xs font-medium tracking-widest text-[#9A3412] uppercase">
              {profile.serviceSchedule}
            </p>
            <h1
              className="font-display text-4xl leading-[1.08] font-bold tracking-tight text-[#1C1917] sm:text-5xl lg:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              {profile.name}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#44403C]">
              {profile.aboutShort}
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-[#57534E]">
              {profile.aboutExtended}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('sermons')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1E3A5F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#162C49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
              >
                <Tv className="h-4 w-4" />
                <span>Explore {videos.length} Sermons</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('bible')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#D6CEBE] bg-white px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:border-[#9A3412] hover:text-[#9A3412]"
              >
                <BookOpen className="h-4 w-4" />
                <span>Parallel Bible</span>
              </button>
              <button
                type="button"
                onClick={handleSaveWebpage}
                disabled={downloadingHtml}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#D6CEBE] bg-white px-5 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                <span>{downloadingHtml ? 'Preparing Webpage...' : 'Download Webpage'}</span>
              </button>
            </div>
            {downloadStatus && (
              <p role="status" className="text-xs font-medium text-[#14532D]">
                {downloadStatus}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E5DEC9] pt-5 text-xs text-[#57534E]">
              <span className="font-mono tabular-nums">{videos.length} Video Teachings</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">4 Bible Versions & 20 Languages</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {songCount > 0 ? `${songCount} Song PDFs` : 'Song PDF Hymnal'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <figure className="overflow-hidden rounded-xl border border-[#E5DEC9] bg-white p-3 shadow-sm">
              <div className="aspect-square overflow-hidden rounded-lg bg-[#FDF3D7]">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-15_at_11.03.38_PM_218d6ff4.jpeg"
                  alt="Righteous Branch of Christ Ministry Cross and Living Vine Emblem"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 flex items-center justify-between px-1 text-xs text-[#57534E]">
                <span className="font-serif italic">“I am the vine, ye are the branches” — John 15:5</span>
                <span>{profile.location}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Featured Inline Sermon Player */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DEC9] pb-4">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
              Sanctuary Broadcast
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold text-[#1C1917]">
              Watch Directly on the Page
            </h2>
          </div>
          <a
            href={buildYouTubeWatchUrl(activeVideo.youtubeId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E3A5F] hover:text-[#9A3412]"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
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
            <div className="mt-4 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                <span className="font-medium text-[#9A3412]">{activeVideo.category}</span>
                <span aria-hidden="true">·</span>
                <span>Righteous Branch of Christ Ministry</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1C1917]">
                {activeVideo.title}
              </h3>
              {activeVideo.description && (
                <p className="text-sm leading-relaxed text-[#57534E]">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-[#E5DEC9] bg-white p-5 lg:col-span-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <h3 className="font-display text-xl font-bold text-[#1C1917]">
                  Up Next in Ministry
                </h3>
                <span className="font-mono text-xs text-[#57534E] tabular-nums">
                  {videos.length} total
                </span>
              </div>
              <div className="divide-y divide-[#F2ECE1]">
                {featuredList.map((video) => {
                  const selected = video.id === activeVideo.id;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => onSelectVideo(video)}
                      className={`flex w-full cursor-pointer flex-col gap-1 py-3 text-left transition-colors hover:bg-[#FAF7F2] ${
                        selected ? 'bg-[#FAF7F2] px-2 -mx-2 rounded-md' : ''
                      }`}
                    >
                      <span className="text-xs font-medium text-[#9A3412]">
                        {video.category}
                      </span>
                      <span className="line-clamp-2 text-sm font-semibold text-[#1C1917]">
                        {video.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('sermons')}
              className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-[#1E3A5F] transition-colors hover:bg-[#1E3A5F] hover:text-white"
            >
              <span>Browse All {videos.length} Videos</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Ministry Portals Directory */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-[#E5DEC9] pb-4">
          <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
            Ministry Resources
          </p>
          <h2 className="font-display mt-1 text-3xl font-bold text-[#1C1917]">
            Scripture, Daily Devotion & Worship Hymns
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-xl border border-[#E5DEC9] bg-white p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#57534E]">
                <span>01. Scripture Study</span>
                <BookOpen className="h-4 w-4 text-[#1E3A5F]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1C1917]">
                Parallel Bible Reader
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Read KJV, ASV, WEB, and BBE side by side, or enable Google Translator parallel columns in Tamil, Hindi, Telugu, Spanish, Hebrew, and 15+ more languages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('bible')}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#9A3412]"
            >
              <span>Open Parallel Bible</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-[#E5DEC9] bg-white p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#57534E]">
                <span>02. Daily Scripture Art</span>
                <Sparkles className="h-4 w-4 text-[#9A3412]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1C1917]">
                Daily Verse Generator
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Generate a random Bible verse with a tailored AI image generator prompt and export a ready-to-share devotional verse card image.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('daily-verse')}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#9A3412]"
            >
              <span>Generate Daily Verse</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-[#E5DEC9] bg-white p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#57534E]">
                <span>03. Congregational Hymnal</span>
                <FileText className="h-4 w-4 text-[#1E3A5F]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1C1917]">
                Song PDF Library
              </h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Upload worship song PDF sheets for the congregation and read or download every hymn directly inside the browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('songs')}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#9A3412]"
            >
              <span>Open Song PDFs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Sermons Preview Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between border-b border-[#E5DEC9] pb-4">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
              Video Archive
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold text-[#1C1917]">
              Featured Teachings
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sermons')}
            className="cursor-pointer text-sm font-semibold text-[#1E3A5F] hover:text-[#9A3412]"
          >
            View Full Library
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((video) => (
            <article
              key={video.id}
              className="group overflow-hidden rounded-xl border border-[#E5DEC9] bg-white transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectVideo(video);
                  window.scrollTo({ top: 450, behavior: 'smooth' });
                }}
                aria-label={`Play sermon: ${video.title}`}
                className="block w-full cursor-pointer text-left"
              >
                <VideoThumbnail
                  youtubeId={video.youtubeId}
                  title={video.title}
                  isPlaying={video.id === activeVideo.id}
                />
                <div className="space-y-1.5 p-4">
                  <p className="text-xs text-[#57534E]">{video.category}</p>
                  <h3 className="line-clamp-2 font-display text-xl font-bold leading-snug text-[#1C1917] group-hover:text-[#9A3412]">
                    {video.title}
                  </h3>
                </div>
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
