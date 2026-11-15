import { useEffect, useState } from 'react';
import { DEFAULT_MINISTRY_PROFILE, SEED_VIDEOS } from './data/seedVideos';
import type {
  ActiveTab,
  CuratedVerse,
  MinistryProfile,
  SongPdfItem,
  VideoItem,
} from './types/ministry';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { SermonsView } from './components/SermonsView';
import { BibleReaderView } from './components/BibleReaderView';
import { DailyVerseView } from './components/DailyVerseView';
import { SongsView } from './components/SongsView';
import { AdminDashboardView } from './components/AdminDashboardView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [profile, setProfile] = useState<MinistryProfile>(DEFAULT_MINISTRY_PROFILE);
  const [videos, setVideos] = useState<VideoItem[]>(SEED_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoItem>(SEED_VIDEOS[0]);
  const [songs, setSongs] = useState<SongPdfItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dailyVerseSeed, setDailyVerseSeed] = useState<CuratedVerse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [ministryRes, videosRes, songsRes, sessionRes] = await Promise.all([
          fetch('/api/ministry'),
          fetch('/api/videos'),
          fetch('/api/songs'),
          fetch('/api/admin/session'),
        ]);

        if (cancelled) return;

        if (ministryRes.ok) {
          const ministryData = (await ministryRes.json()) as MinistryProfile;
          setProfile(ministryData);
        }

        if (videosRes.ok) {
          const videosData = (await videosRes.json()) as VideoItem[];
          if (videosData.length > 0) {
            setVideos(videosData);
            setActiveVideo((prev) =>
              videosData.find((v) => v.id === prev.id) ??
              videosData.find((v) => v.featured) ??
              videosData[0]
            );
          }
        }

        if (songsRes.ok) {
          const songsData = (await songsRes.json()) as SongPdfItem[];
          setSongs(songsData);
        }

        if (sessionRes.ok) {
          const sessionData = (await sessionRes.json()) as { authenticated?: boolean };
          setIsAdmin(Boolean(sessionData.authenticated));
        }
      } catch {
        // Keep seeded fallback data if backend is restarting
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVideo = (video: VideoItem) => {
    setActiveVideo(video);
  };

  const handleSendToDailyVerse = (verse: CuratedVerse) => {
    setDailyVerseSeed(verse);
    handleNavigate('daily-verse');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar activeTab={activeTab} onNavigate={handleNavigate} isAdmin={isAdmin} />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            videos={videos}
            activeVideo={activeVideo}
            onSelectVideo={handleSelectVideo}
            onNavigate={handleNavigate}
            songCount={songs.length}
          />
        )}

        {activeTab === 'sermons' && (
          <SermonsView
            videos={videos}
            activeVideo={activeVideo}
            onSelectVideo={handleSelectVideo}
            onOpenAdminUpload={() => handleNavigate('admin')}
          />
        )}

        {activeTab === 'bible' && (
          <BibleReaderView onSendToDailyVerse={handleSendToDailyVerse} />
        )}

        {activeTab === 'daily-verse' && (
          <DailyVerseView initialVerse={dailyVerseSeed} />
        )}

        {activeTab === 'songs' && (
          <SongsView
            songs={songs}
            onSongUploaded={(song) => setSongs((prev) => [song, ...prev])}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            isAuthenticated={isAdmin}
            onAuthChange={setIsAdmin}
            videos={videos}
            onVideoAdded={(video) => {
              setVideos((prev) => [video, ...prev]);
              setActiveVideo(video);
            }}
            onVideoUpdated={(updated) =>
              setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
            }
            onVideoDeleted={(id) =>
              setVideos((prev) => prev.filter((v) => v.id !== id))
            }
            songs={songs}
            onSongAdded={(song) => setSongs((prev) => [song, ...prev])}
            onSongDeleted={(id) => setSongs((prev) => prev.filter((s) => s.id !== id))}
            profile={profile}
            onProfileUpdated={setProfile}
          />
        )}
      </main>

      <footer className="border-t border-[#E5DEC9] bg-[#F2ECE1]/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 text-xs text-[#57534E] sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-base font-bold text-[#1C1917]">
              {profile.name}
            </p>
            <p className="mt-0.5">{profile.serviceSchedule}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('sermons')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Sermons
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('bible')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Bible
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('daily-verse')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Daily Verse
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('songs')}
              className="cursor-pointer hover:text-[#1C1917]"
            >
              Songs
            </button>
            <span aria-hidden="true">·</span>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="hover:text-[#1C1917]"
            >
              {profile.contactEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
