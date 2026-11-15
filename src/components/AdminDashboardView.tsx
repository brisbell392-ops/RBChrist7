import { useMemo, useState } from 'react';
import {
  Check,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type { MinistryProfile, SongPdfItem, VideoCategory, VideoItem } from '../types/ministry';
import { buildYouTubeEmbedUrl, categorizeSermonTitle, extractYouTubeId } from '../utils/youtube';

interface AdminDashboardViewProps {
  isAuthenticated: boolean;
  onAuthChange: (authenticated: boolean) => void;
  videos: VideoItem[];
  onVideoAdded: (video: VideoItem) => void;
  onVideoUpdated: (video: VideoItem) => void;
  onVideoDeleted: (id: string) => void;
  songs: SongPdfItem[];
  onSongAdded: (song: SongPdfItem) => void;
  onSongDeleted: (id: string) => void;
  profile: MinistryProfile;
  onProfileUpdated: (profile: MinistryProfile) => void;
}

const VIDEO_CATEGORIES: Array<Exclude<VideoCategory, 'All'>> = [
  'Prophecy & End Times',
  'Names & Titles of Christ',
  'Old Testament & Symbolism',
  'Kingdom & Discipleship',
  'Grace & Salvation',
  'Worship & Praise',
];

type AdminSubTab = 'add-video' | 'manage-videos' | 'songs' | 'ministry';

export function AdminDashboardView({
  isAuthenticated,
  onAuthChange,
  videos,
  onVideoAdded,
  onVideoUpdated,
  onVideoDeleted,
  songs,
  onSongAdded,
  onSongDeleted,
  profile,
  onProfileUpdated,
}: AdminDashboardViewProps) {
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [subTab, setSubTab] = useState<AdminSubTab>('add-video');

  // Add video state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState<Exclude<VideoCategory, 'All'>>(
    'Kingdom & Discipleship'
  );
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFeatured, setVideoFeatured] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoFeedback, setVideoFeedback] = useState('');
  const [videoError, setVideoError] = useState('');

  // Manage videos state
  const [manageQuery, setManageQuery] = useState('');

  // Song upload inside admin
  const [songTitle, setSongTitle] = useState('');
  const [songNumber, setSongNumber] = useState('');
  const [songLanguage, setSongLanguage] = useState('English');
  const [songComposer, setSongComposer] = useState('');
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songFeedback, setSongFeedback] = useState('');
  const [songError, setSongError] = useState('');
  const [uploadingSong, setUploadingSong] = useState(false);

  // Ministry profile form
  const [profileForm, setProfileForm] = useState<MinistryProfile>(profile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState('');

  const previewYoutubeId = extractYouTubeId(youtubeUrl);

  const filteredManageVideos = useMemo(() => {
    const q = manageQuery.trim().toLowerCase();
    if (!q) return videos.slice(0, 40);
    return videos
      .filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.youtubeId.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [videos, manageQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!passcode.trim()) {
      setLoginError('Please enter the admin passcode.');
      return;
    }

    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = (await res.json()) as { authenticated?: boolean; error?: string };
      if (!res.ok || !data.authenticated) {
        throw new Error(data.error || 'Authentication failed.');
      }
      setPasscode('');
      onAuthChange(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    onAuthChange(false);
  };

  const handleFetchYouTubeMeta = async () => {
    if (!previewYoutubeId) {
      setVideoError('Enter a valid YouTube URL first.');
      return;
    }
    setFetchingMeta(true);
    setVideoError('');
    try {
      const res = await fetch('/api/videos/oembed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      if (res.ok) {
        const data = (await res.json()) as { title?: string };
        if (data.title) {
          setVideoTitle(data.title);
          setVideoCategory(categorizeSermonTitle(data.title));
        }
      }
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError('');
    setVideoFeedback('');

    if (!previewYoutubeId) {
      setVideoError('Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=...).');
      return;
    }
    if (!videoTitle.trim()) {
      setVideoError('Please enter a title for the sermon video.');
      return;
    }

    setSavingVideo(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          title: videoTitle.trim(),
          category: videoCategory,
          description: videoDescription.trim(),
          featured: videoFeatured,
        }),
      });
      const data = (await res.json()) as VideoItem & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not add video.');
      }
      onVideoAdded(data);
      setYoutubeUrl('');
      setVideoTitle('');
      setVideoDescription('');
      setVideoFeatured(false);
      setVideoFeedback(`Published "${data.title}" to the Sermons library.`);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Failed to publish video.');
    } finally {
      setSavingVideo(false);
    }
  };

  const handleToggleFeatured = async (video: VideoItem) => {
    const res = await fetch(`/api/videos/${video.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !video.featured }),
    });
    if (res.ok) {
      const updated = (await res.json()) as VideoItem;
      onVideoUpdated(updated);
    }
  };

  const handleDeleteVideo = async (video: VideoItem) => {
    const res = await fetch(`/api/videos/${video.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      onVideoDeleted(video.id);
    }
  };

  const handleAdminSongUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSongError('');
    setSongFeedback('');
    if (!songTitle.trim() || !songFile) {
      setSongError('Song title and PDF file are required.');
      return;
    }
    setUploadingSong(true);
    try {
      const formData = new FormData();
      formData.append('title', songTitle.trim());
      formData.append('hymnNumber', songNumber.trim() || `Hymn ${songs.length + 1}`);
      formData.append('language', songLanguage.trim() || 'English');
      formData.append('composer', songComposer.trim() || 'Righteous Branch Choir');
      formData.append('pdf', songFile);

      const res = await fetch('/api/songs', { method: 'POST', body: formData });
      const data = (await res.json()) as SongPdfItem & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Song upload failed.');

      onSongAdded(data);
      setSongTitle('');
      setSongNumber('');
      setSongComposer('');
      setSongFile(null);
      setSongFeedback(`Uploaded "${data.title}".`);
    } catch (err) {
      setSongError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingSong(false);
    }
  };

  const handleDeleteSong = async (song: SongPdfItem) => {
    const res = await fetch(`/api/songs/${song.id}`, { method: 'DELETE' });
    if (res.ok) {
      onSongDeleted(song.id);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback('');
    try {
      const res = await fetch('/api/ministry', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const updated = (await res.json()) as MinistryProfile;
        onProfileUpdated(updated);
        setProfileFeedback('Ministry profile updated on Home page.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E3A5F] text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#1C1917]">
                Ministry Admin Dashboard
              </h1>
              <p className="text-xs text-[#57534E]">
                Protected video, hymnal, and ministry management
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-xs font-semibold text-[#44403C]">
                Admin Passcode
              </label>
              <input
                id="admin-passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                className="mt-1.5 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A5F] focus:outline-none"
              />
            </div>

            {loginError && (
              <div role="alert" className="rounded-md border border-[#9A3412]/30 bg-[#9A3412]/5 px-3 py-2 text-xs font-medium text-[#9A3412]">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full cursor-pointer rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162C49] disabled:opacity-60"
            >
              {loggingIn ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-5 border-t border-[#F2ECE1] pt-4 text-xs text-[#57534E]">
            Default initial passcode: <span className="font-mono text-[#1C1917]">rbcm-admin-2026</span> (configurable via <span className="font-mono">ADMIN_PASSWORD</span> environment variable).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DEC9] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
            Steward Administration
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold text-[#1C1917]">
            Ministry Management Console
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#D6CEBE] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:border-[#9A3412] hover:text-[#9A3412]"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#F2ECE1] p-1.5">
        {[
          { id: 'add-video' as const, label: 'Add Video by Link' },
          { id: 'manage-videos' as const, label: `Manage Videos (${videos.length})` },
          { id: 'songs' as const, label: `Song PDFs (${songs.length})` },
          { id: 'ministry' as const, label: 'Home Page About' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`cursor-pointer rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
              subTab === tab.id
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Add Video by Link */}
      {subTab === 'add-video' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleAddVideoSubmit}
            className="space-y-5 rounded-xl border border-[#E5DEC9] bg-white p-6 lg:col-span-7"
          >
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Embed New YouTube Video by Link
            </h2>

            {videoError && (
              <div role="alert" className="rounded-md border border-[#9A3412]/30 bg-[#9A3412]/5 px-3.5 py-2.5 text-sm text-[#9A3412]">
                {videoError}
              </div>
            )}

            {videoFeedback && (
              <div role="status" className="rounded-md border border-[#14532D]/30 bg-[#14532D]/5 px-3.5 py-2.5 text-sm font-medium text-[#14532D]">
                {videoFeedback}
              </div>
            )}

            <div>
              <label htmlFor="admin-yt-url" className="block text-xs font-semibold text-[#44403C]">
                YouTube Video URL or Video ID *
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="admin-yt-url"
                  type="text"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
                />
                <button
                  type="button"
                  onClick={handleFetchYouTubeMeta}
                  disabled={!previewYoutubeId || fetchingMeta}
                  className="cursor-pointer whitespace-nowrap rounded-md border border-[#D6CEBE] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] disabled:opacity-50"
                >
                  {fetchingMeta ? 'Fetching...' : 'Auto-Fill Title'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="admin-yt-title" className="block text-xs font-semibold text-[#44403C]">
                Sermon Title *
              </label>
              <input
                id="admin-yt-title"
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter sermon title"
                className="mt-1.5 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              />
            </div>

            <div>
              <label htmlFor="admin-yt-category" className="block text-xs font-semibold text-[#44403C]">
                Ministry Category
              </label>
              <select
                id="admin-yt-category"
                value={videoCategory}
                onChange={(e) =>
                  setVideoCategory(e.target.value as Exclude<VideoCategory, 'All'>)
                }
                className="mt-1.5 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              >
                {VIDEO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="admin-yt-desc" className="block text-xs font-semibold text-[#44403C]">
                Short Sermon Note (Optional)
              </label>
              <textarea
                id="admin-yt-desc"
                rows={3}
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Scripture references or brief summary..."
                className="mt-1.5 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] p-3 text-sm text-[#1C1917]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#1C1917]">
              <input
                type="checkbox"
                checked={videoFeatured}
                onChange={(e) => setVideoFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[#D6CEBE] accent-[#9A3412]"
              />
              <span>Feature this video on the Home page</span>
            </label>

            <button
              type="submit"
              disabled={savingVideo}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>{savingVideo ? 'Publishing...' : 'Publish Video to Page'}</span>
            </button>
          </form>

          {/* Live Embed Preview */}
          <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 lg:col-span-5">
            <h3 className="font-display text-xl font-bold text-[#1C1917]">
              Live Embed Preview
            </h3>
            <p className="mt-1 text-xs text-[#57534E]">
              Verify playback before publishing to the congregation.
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-[#E5DEC9] bg-[#FAF7F2]">
              {previewYoutubeId ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={buildYouTubeEmbedUrl(previewYoutubeId)}
                    title="YouTube video preview"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center p-6 text-center text-xs text-[#78716C]">
                  Paste a valid YouTube watch, share, live, or shorts link to preview the embedded player.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Videos */}
      {subTab === 'manage-videos' && (
        <div className="space-y-4 rounded-xl border border-[#E5DEC9] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
              <input
                type="search"
                value={manageQuery}
                onChange={(e) => setManageQuery(e.target.value)}
                placeholder="Filter videos by title or YouTube ID..."
                className="w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] py-2 pr-4 pl-9 text-sm text-[#1C1917]"
              />
            </div>
            <span className="font-mono text-xs text-[#57534E] tabular-nums">
              {videos.length} total videos
            </span>
          </div>

          <div className="divide-y divide-[#F2ECE1]">
            {filteredManageVideos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm text-[#1C1917]">
                    {video.title}
                  </p>
                  <p className="text-xs text-[#57534E]">
                    {video.category} · <span className="font-mono">{video.youtubeId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(video)}
                    aria-label={
                      video.featured
                        ? `Unfeature ${video.title}`
                        : `Feature ${video.title}`
                    }
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                      video.featured
                        ? 'border-[#B45309] bg-[#FEF3C7] text-[#92400E]'
                        : 'border-[#D6CEBE] text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    <span>{video.featured ? 'Featured' : 'Feature'}</span>
                  </button>
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${video.title} on YouTube`}
                    className="rounded-md border border-[#D6CEBE] p-1.5 text-[#57534E] hover:text-[#1E3A5F]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video)}
                    aria-label={`Delete ${video.title}`}
                    className="cursor-pointer rounded-md border border-[#D6CEBE] p-1.5 text-[#9A3412] hover:bg-[#9A3412] hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manage Song PDFs */}
      {subTab === 'songs' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            onSubmit={handleAdminSongUpload}
            className="space-y-4 rounded-xl border border-[#E5DEC9] bg-white p-6 lg:col-span-5"
          >
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Upload Song PDF
            </h2>
            {songError && (
              <p role="alert" className="text-xs font-medium text-[#9A3412]">
                {songError}
              </p>
            )}
            {songFeedback && (
              <p role="status" className="text-xs font-medium text-[#14532D]">
                {songFeedback}
              </p>
            )}
            <div>
              <label htmlFor="adm-song-title" className="block text-xs font-semibold text-[#44403C]">
                Song Title *
              </label>
              <input
                id="adm-song-title"
                type="text"
                required
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="adm-song-num" className="block text-xs font-semibold text-[#44403C]">
                  Hymn #
                </label>
                <input
                  id="adm-song-num"
                  type="text"
                  value={songNumber}
                  onChange={(e) => setSongNumber(e.target.value)}
                  placeholder="Hymn 04"
                  className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="adm-song-lang" className="block text-xs font-semibold text-[#44403C]">
                  Language
                </label>
                <input
                  id="adm-song-lang"
                  type="text"
                  value={songLanguage}
                  onChange={(e) => setSongLanguage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="adm-song-comp" className="block text-xs font-semibold text-[#44403C]">
                Composer
              </label>
              <input
                id="adm-song-comp"
                type="text"
                value={songComposer}
                onChange={(e) => setSongComposer(e.target.value)}
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-song-pdf" className="block text-xs font-semibold text-[#44403C]">
                PDF File *
              </label>
              <input
                id="adm-song-pdf"
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(e) => setSongFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={uploadingSong}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white"
            >
              <Upload className="h-4 w-4" />
              <span>{uploadingSong ? 'Uploading...' : 'Upload Song PDF'}</span>
            </button>
          </form>

          <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 lg:col-span-7">
            <h2 className="font-display mb-4 text-2xl font-bold text-[#1C1917]">
              Uploaded Song Sheets
            </h2>
            <div className="divide-y divide-[#F2ECE1]">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">
                      {song.hymnNumber} — {song.title}
                    </p>
                    <p className="text-xs text-[#57534E]">
                      {song.composer} · {song.language}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSong(song)}
                    aria-label={`Delete song ${song.title}`}
                    className="cursor-pointer rounded-md border border-[#D6CEBE] p-1.5 text-[#9A3412] hover:bg-[#9A3412] hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Ministry Home Page Profile */}
      {subTab === 'ministry' && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-3xl space-y-4 rounded-xl border border-[#E5DEC9] bg-white p-6"
        >
          <h2 className="font-display text-2xl font-bold text-[#1C1917]">
            Home Page Ministry Description
          </h2>
          {profileFeedback && (
            <p role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14532D]">
              <Check className="h-4 w-4" />
              <span>{profileFeedback}</span>
            </p>
          )}
          <div>
            <label htmlFor="min-name" className="block text-xs font-semibold text-[#44403C]">
              Ministry Name
            </label>
            <input
              id="min-name"
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="min-short" className="block text-xs font-semibold text-[#44403C]">
              Home Page Brief Description
            </label>
            <textarea
              id="min-short"
              rows={3}
              value={profileForm.aboutShort}
              onChange={(e) => setProfileForm({ ...profileForm, aboutShort: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] p-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="min-ext" className="block text-xs font-semibold text-[#44403C]">
              Extended Fellowship Mission
            </label>
            <textarea
              id="min-ext"
              rows={3}
              value={profileForm.aboutExtended}
              onChange={(e) =>
                setProfileForm({ ...profileForm, aboutExtended: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] p-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="min-sched" className="block text-xs font-semibold text-[#44403C]">
                Service Schedule
              </label>
              <input
                id="min-sched"
                type="text"
                value={profileForm.serviceSchedule}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, serviceSchedule: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="min-email" className="block text-xs font-semibold text-[#44403C]">
                Contact Email
              </label>
              <input
                id="min-email"
                type="email"
                value={profileForm.contactEmail}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, contactEmail: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="cursor-pointer rounded-md bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162C49]"
          >
            {savingProfile ? 'Saving...' : 'Save Ministry Description'}
          </button>
        </form>
      )}
    </div>
  );
}
