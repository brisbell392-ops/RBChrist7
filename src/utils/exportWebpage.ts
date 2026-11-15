import type {
  BibleChapterData,
  BibleVersionKey,
  CuratedVerse,
  MinistryProfile,
  SongPdfItem,
  VideoCategory,
  VideoItem,
} from '../types/ministry.ts';

export interface ExportWebpagePayload {
  profile: MinistryProfile;
  videos: VideoItem[];
  songs: SongPdfItem[];
  chapters: BibleChapterData[];
  verses: CuratedVerse[];
  emblemDataUri?: string;
  songPdfDataUris?: Record<string, string>;
  generatedAt?: string;
}

const EXPORT_CATEGORIES: VideoCategory[] = [
  'All',
  'Prophecy & End Times',
  'Names & Titles of Christ',
  'Old Testament & Symbolism',
  'Kingdom & Discipleship',
  'Grace & Salvation',
  'Worship & Praise',
];

const EXPORT_VERSIONS: BibleVersionKey[] = ['KJV', 'ASV', 'WEB', 'BBE'];

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function generateStandaloneHtml(payload: ExportWebpagePayload): string {
  const {
    profile,
    videos,
    songs,
    chapters,
    verses,
    emblemDataUri,
    songPdfDataUris = {},
    generatedAt = new Date().toISOString(),
  } = payload;

  const initialVideo = videos.find((v) => v.featured) ?? videos[0] ?? null;

  const embeddedState = {
    profile,
    videos,
    songs,
    chapters,
    verses,
    categories: EXPORT_CATEGORIES,
    versions: EXPORT_VERSIONS,
    songPdfDataUris,
    generatedAt,
  };

  const emblemMarkup = emblemDataUri
    ? `<img src="${escapeHtml(emblemDataUri)}" alt="${escapeHtml(profile.name)} Emblem" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:8px;" />`
    : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#FDF3D7;color:#9A3412;font-family:Georgia,serif;font-size:28px;font-weight:700;border-radius:8px;padding:24px;text-align:center;">${escapeHtml(profile.name)}</div>`;

  const initialPlayerSrc = initialVideo
    ? `https://www.youtube.com/embed/${encodeURIComponent(initialVideo.youtubeId)}?rel=0&modestbranding=1`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(profile.name)} — Offline Sanctuary Archive</title>
  <meta name="description" content="${escapeHtml(profile.aboutShort)}" />
  <style>
    :root {
      --bg: #FAF7F2;
      --surface: #FFFFFF;
      --surface-muted: #F2ECE1;
      --border: #E5DEC9;
      --border-strong: #D6CEBE;
      --ink: #1C1917;
      --muted: #57534E;
      --accent: #9A3412;
      --navy: #1E3A5F;
      --navy-hover: #162C49;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--ink);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, .serif {
      font-family: Georgia, "Times New Roman", Times, serif;
    }
    a { color: var(--navy); text-decoration: none; }
    a:hover { color: var(--accent); }
    button, input, select { font: inherit; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    header.topbar {
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgba(250, 247, 242, 0.96);
      backdrop-filter: blur(6px);
      border-bottom: 1px solid var(--border);
    }
    .topbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 14px 20px;
      max-width: 1200px;
      margin: 0 auto;
      flex-wrap: wrap;
    }
    .brand {
      background: none;
      border: 0;
      padding: 0;
      cursor: pointer;
      font-family: Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--ink);
      white-space: nowrap;
    }
    nav.nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .nav-btn {
      background: none;
      border: 0;
      border-bottom: 2px solid transparent;
      padding: 4px 0;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: var(--muted);
      white-space: nowrap;
    }
    .nav-btn[aria-current="page"] {
      color: var(--ink);
      border-bottom-color: var(--accent);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .btn-primary { background: var(--navy); color: #fff; }
    .btn-primary:hover { background: var(--navy-hover); color: #fff; }
    .btn-secondary { background: var(--surface); color: var(--ink); border-color: var(--border-strong); }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
    .hero {
      border-bottom: 1px solid var(--border);
      background: linear-gradient(to bottom, #FAF7F2, rgba(242, 236, 225, 0.55));
      padding: 44px 0;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 36px;
      align-items: center;
    }
    .kicker {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 10px;
    }
    .hero h1 {
      font-size: clamp(32px, 4vw, 52px);
      line-height: 1.08;
      margin: 0 0 16px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
    .player-layout {
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      gap: 24px;
      align-items: stretch;
    }
    .video-frame {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .video-frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .video-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      text-align: left;
      padding: 0;
      cursor: pointer;
    }
    .video-card.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .thumb-wrap {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #EFE7D6;
      overflow: hidden;
    }
    .thumb-wrap img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      background: var(--surface-muted);
      padding: 6px;
      border-radius: 8px;
    }
    .filter-tab {
      background: transparent;
      border: 0;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
    }
    .filter-tab.active {
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }
    .search-input {
      width: 100%;
      max-width: 440px;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid var(--border-strong);
      background: var(--surface);
      color: var(--ink);
      font-size: 14px;
    }
    .section { padding: 36px 0; }
    .hidden { display: none !important; }
    .verse-row {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px;
      margin-bottom: 14px;
    }
    .verse-cols {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 10px;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    footer.site-footer {
      border-top: 1px solid var(--border);
      background: rgba(242, 236, 225, 0.65);
      padding: 28px 0;
      margin-top: 48px;
      font-size: 12px;
      color: var(--muted);
    }
    @media (max-width: 900px) {
      .hero-grid, .player-layout, .grid-3, .grid-2 {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <button type="button" class="brand" data-tab-target="home">Righteous Branch</button>
      <nav class="nav-links" aria-label="Offline website navigation">
        <button type="button" class="nav-btn" data-tab-target="home" aria-current="page">Home</button>
        <button type="button" class="nav-btn" data-tab-target="sermons">Sermons (${videos.length})</button>
        <button type="button" class="nav-btn" data-tab-target="bible">Bible</button>
        <button type="button" class="nav-btn" data-tab-target="daily-verse">Daily Verse</button>
        <button type="button" class="nav-btn" data-tab-target="songs">Songs (${songs.length})</button>
      </nav>
      <a class="btn btn-primary" href="${escapeHtml(profile.youtubeChannelUrl)}" target="_blank" rel="noopener noreferrer">YouTube Channel</a>
    </div>
  </header>

  <main>
    <section id="view-home">
      <div class="hero">
        <div class="container hero-grid">
          <div>
            <p class="kicker">${escapeHtml(profile.serviceSchedule)}</p>
            <h1>${escapeHtml(profile.name)}</h1>
            <p style="font-size:18px;color:#44403C;margin:0 0 12px;">${escapeHtml(profile.aboutShort)}</p>
            <p style="font-size:14px;color:var(--muted);margin:0 0 22px;">${escapeHtml(profile.aboutExtended)}</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
              <button type="button" class="btn btn-primary" data-tab-target="sermons">Explore ${videos.length} Sermons</button>
              <button type="button" class="btn btn-secondary" data-tab-target="bible">Parallel Bible</button>
              <button type="button" class="btn btn-secondary" data-tab-target="songs">Song Hymnal</button>
            </div>
            <div class="mono" style="font-size:12px;color:var(--muted);border-top:1px solid var(--border);padding-top:14px;">
              ${videos.length} Video Teachings · ${chapters.length} Offline Study Chapters · ${songs.length} Song Sheets
            </div>
          </div>
          <div class="card" style="padding:12px;">
            <div style="aspect-ratio:1/1;overflow:hidden;border-radius:8px;background:#FDF3D7;">
              ${emblemMarkup}
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);padding:10px 4px 2px;">
              <span class="serif" style="font-style:italic;">“I am the vine, ye are the branches” — John 15:5</span>
              <span>${escapeHtml(profile.location)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="container section">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:24px;">
          <div>
            <p class="kicker">Sanctuary Broadcast</p>
            <h2 style="margin:0;font-size:28px;">Featured Teaching</h2>
          </div>
          <button type="button" class="btn btn-secondary" data-tab-target="sermons">Browse All Sermons</button>
        </div>
        <div class="player-layout">
          <div>
            <div class="video-frame">
              <iframe id="home-player-iframe" src="${escapeHtml(initialPlayerSrc)}" title="${escapeHtml(initialVideo?.title ?? profile.name)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <h3 id="home-player-title" style="margin:14px 0 6px;font-size:22px;">${escapeHtml(initialVideo?.title ?? '')}</h3>
            <p id="home-player-meta" style="margin:0;font-size:13px;color:var(--muted);">${escapeHtml(initialVideo?.category ?? '')}</p>
          </div>
          <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <h3 style="margin:0 0 12px;font-size:20px;border-bottom:1px solid var(--border);padding-bottom:10px;">Up Next in Ministry</h3>
              <div id="home-up-next"></div>
            </div>
            <button type="button" class="btn btn-secondary" style="width:100%;margin-top:16px;" data-tab-target="sermons">View Full Archive</button>
          </div>
        </div>
      </div>
    </section>

    <section id="view-sermons" class="container section hidden">
      <div style="border-bottom:1px solid var(--border);padding-bottom:18px;margin-bottom:24px;">
        <p class="kicker">YouTube Sermon Library</p>
        <h1 style="margin:0 0 8px;font-size:34px;">Sermons &amp; Prophetic Teachings</h1>
        <p style="margin:0;color:var(--muted);font-size:14px;">Search by title or description keywords. Video playback streams from YouTube when connected to the internet.</p>
      </div>

      <div class="player-layout" style="margin-bottom:28px;">
        <div class="video-frame">
          <iframe id="sermon-player-iframe" src="${escapeHtml(initialPlayerSrc)}" title="${escapeHtml(initialVideo?.title ?? '')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <p id="sermon-active-cat" class="kicker" style="margin-bottom:8px;">${escapeHtml(initialVideo?.category ?? '')}</p>
            <h2 id="sermon-active-title" style="margin:0 0 12px;font-size:24px;">${escapeHtml(initialVideo?.title ?? '')}</h2>
            <p id="sermon-active-desc" style="margin:0;font-size:14px;color:var(--muted);"></p>
          </div>
          <div style="margin-top:20px;border-top:1px solid var(--border);padding-top:14px;">
            <a id="sermon-active-link" class="btn btn-secondary" style="width:100%;" href="${escapeHtml(initialVideo?.youtubeUrl ?? '#')}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:260px;">
          <label for="offline-sermon-search" class="hidden">Search sermons</label>
          <input id="offline-sermon-search" class="search-input" type="text" placeholder="Search by title or description keywords..." />
          <button type="button" id="offline-clear-search" class="btn btn-secondary hidden">Clear</button>
        </div>
        <span id="offline-video-count" class="mono" style="font-size:12px;color:var(--muted);"></span>
      </div>

      <div id="offline-category-bar" class="filter-bar" style="margin-bottom:24px;"></div>
      <div id="offline-sermon-grid" class="grid-3"></div>
      <div style="text-align:center;margin-top:24px;">
        <button type="button" id="offline-load-more" class="btn btn-secondary hidden">Load More Sermons</button>
      </div>
    </section>

    <section id="view-bible" class="container section hidden">
      <div style="border-bottom:1px solid var(--border);padding-bottom:18px;margin-bottom:24px;">
        <p class="kicker">Parallel Scripture Study</p>
        <h1 style="margin:0 0 8px;font-size:34px;">Parallel Bible Reader</h1>
        <p style="margin:0;color:var(--muted);font-size:14px;">Offline study chapters included with KJV, ASV, WEB, and BBE side by side.</p>
      </div>
      <div class="card" style="margin-bottom:20px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;">
        <div>
          <label for="offline-chapter-select" style="font-size:12px;font-weight:700;display:block;margin-bottom:6px;">Study Chapter</label>
          <select id="offline-chapter-select" class="search-input" style="min-width:240px;"></select>
        </div>
        <div id="offline-version-toggles" style="display:flex;gap:12px;flex-wrap:wrap;"></div>
      </div>
      <div id="offline-bible-verses"></div>
    </section>

    <section id="view-daily-verse" class="container section hidden">
      <div style="border-bottom:1px solid var(--border);padding-bottom:18px;margin-bottom:24px;">
        <p class="kicker">Shareable Scripture Inspiration</p>
        <h1 style="margin:0 0 8px;font-size:34px;">Daily Verse Generator</h1>
        <p style="margin:0;color:var(--muted);font-size:14px;">Generate a random verse from the curated ministry collection along with an AI image generator prompt.</p>
      </div>
      <div class="grid-2">
        <div class="card" style="background:linear-gradient(135deg,#1E3A5F,#162C49);color:#FAF7F2;display:flex;flex-direction:column;justify-content:space-between;min-height:300px;">
          <p id="offline-verse-topic" class="kicker" style="color:#FDE68A;"></p>
          <blockquote id="offline-verse-text" class="serif" style="margin:12px 0;font-size:26px;line-height:1.35;"></blockquote>
          <p id="offline-verse-ref" style="margin:0;font-weight:700;color:#FDE68A;"></p>
        </div>
        <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
          <div>
            <h2 style="margin:0 0 10px;font-size:22px;">Image Generator Prompt</h2>
            <p id="offline-verse-prompt" style="margin:0;font-size:14px;color:var(--muted);background:var(--bg);padding:14px;border-radius:8px;border:1px solid var(--border);"></p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" id="offline-random-verse-btn" class="btn btn-primary">Generate Random Verse</button>
            <button type="button" id="offline-copy-prompt-btn" class="btn btn-secondary">Copy Prompt</button>
          </div>
        </div>
      </div>
    </section>

    <section id="view-songs" class="container section hidden">
      <div style="border-bottom:1px solid var(--border);padding-bottom:18px;margin-bottom:24px;">
        <p class="kicker">Congregational Hymnal</p>
        <h1 style="margin:0 0 8px;font-size:34px;">Worship Song Sheets &amp; Lyrics</h1>
        <p style="margin:0;color:var(--muted);font-size:14px;">Read ministry hymns offline or save embedded PDF song sheets directly to your device.</p>
      </div>
      <div id="offline-songs-list" class="grid-2"></div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;">
      <div>
        <strong class="serif" style="font-size:16px;color:var(--ink);">${escapeHtml(profile.name)}</strong>
        <div>${escapeHtml(profile.serviceSchedule)} · Offline snapshot exported ${escapeHtml(generatedAt.slice(0, 10))}</div>
      </div>
      <div>
        <a href="mailto:${escapeHtml(profile.contactEmail)}">${escapeHtml(profile.contactEmail)}</a>
      </div>
    </div>
  </footer>

  <script id="rbcm-export-data" type="application/json">${safeJsonForScript(embeddedState)}</script>
  <script>
    (function () {
      var raw = document.getElementById('rbcm-export-data').textContent || '{}';
      var state = JSON.parse(raw);
      var currentTab = 'home';
      var selectedCategory = 'All';
      var searchQuery = '';
      var visibleCount = 24;
      var activeVideo = (state.videos && (state.videos.find(function (v) { return v.featured; }) || state.videos[0])) || null;
      var activeVersions = ['KJV', 'ASV', 'WEB'];
      var currentVerseIndex = 0;

      function switchTab(tab) {
        currentTab = tab;
        var views = ['home', 'sermons', 'bible', 'daily-verse', 'songs'];
        views.forEach(function (id) {
          var el = document.getElementById('view-' + id);
          if (el) el.classList.toggle('hidden', id !== tab);
        });
        document.querySelectorAll('.nav-btn').forEach(function (btn) {
          if (btn.getAttribute('data-tab-target') === tab) {
            btn.setAttribute('aria-current', 'page');
          } else {
            btn.removeAttribute('aria-current');
          }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      document.querySelectorAll('[data-tab-target]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          switchTab(btn.getAttribute('data-tab-target'));
        });
      });

      function setVideo(video) {
        if (!video) return;
        activeVideo = video;
        var embedUrl = 'https://www.youtube.com/embed/' + encodeURIComponent(video.youtubeId) + '?rel=0&modestbranding=1';
        var homeIframe = document.getElementById('home-player-iframe');
        var sermonIframe = document.getElementById('sermon-player-iframe');
        if (homeIframe) homeIframe.src = embedUrl;
        if (sermonIframe) sermonIframe.src = embedUrl;
        var hTitle = document.getElementById('home-player-title');
        var hMeta = document.getElementById('home-player-meta');
        if (hTitle) hTitle.textContent = video.title;
        if (hMeta) hMeta.textContent = video.category;
        var sCat = document.getElementById('sermon-active-cat');
        var sTitle = document.getElementById('sermon-active-title');
        var sDesc = document.getElementById('sermon-active-desc');
        var sLink = document.getElementById('sermon-active-link');
        if (sCat) sCat.textContent = video.category;
        if (sTitle) sTitle.textContent = video.title;
        if (sDesc) sDesc.textContent = video.description || 'Expository teaching from Righteous Branch of Christ Ministry.';
        if (sLink) sLink.href = video.youtubeUrl;
        renderHomeUpNext();
        renderSermons();
      }

      function renderHomeUpNext() {
        var container = document.getElementById('home-up-next');
        if (!container) return;
        container.innerHTML = '';
        (state.videos || []).slice(0, 6).forEach(function (v) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid #F2ECE1;padding:10px 4px;cursor:pointer;';
          var cat = document.createElement('div');
          cat.style.cssText = 'font-size:11px;font-weight:700;color:#9A3412;';
          cat.textContent = v.category;
          var ttl = document.createElement('div');
          ttl.style.cssText = 'font-size:13px;font-weight:600;color:#1C1917;margin-top:2px;';
          ttl.textContent = v.title;
          btn.appendChild(cat);
          btn.appendChild(ttl);
          btn.addEventListener('click', function () { setVideo(v); });
          container.appendChild(btn);
        });
      }

      function filterVideoList() {
        var tokens = searchQuery.trim().toLowerCase().split(/\\s+/).filter(Boolean);
        return (state.videos || []).filter(function (v) {
          if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
          if (tokens.length === 0) return true;
          var haystack = (v.title + ' ' + (v.description || '') + ' ' + v.category).toLowerCase();
          return tokens.every(function (t) { return haystack.indexOf(t) !== -1; });
        });
      }

      function renderCategoryBar() {
        var bar = document.getElementById('offline-category-bar');
        if (!bar) return;
        bar.innerHTML = '';
        (state.categories || []).forEach(function (cat) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'filter-tab' + (selectedCategory === cat ? ' active' : '');
          btn.textContent = cat;
          btn.addEventListener('click', function () {
            selectedCategory = cat;
            visibleCount = 24;
            renderCategoryBar();
            renderSermons();
          });
          bar.appendChild(btn);
        });
      }

      function renderSermons() {
        var grid = document.getElementById('offline-sermon-grid');
        var countEl = document.getElementById('offline-video-count');
        var loadMoreBtn = document.getElementById('offline-load-more');
        var clearBtn = document.getElementById('offline-clear-search');
        if (!grid) return;

        if (clearBtn) clearBtn.classList.toggle('hidden', !searchQuery);

        var filtered = filterVideoList();
        var slice = filtered.slice(0, visibleCount);
        if (countEl) countEl.textContent = 'Showing ' + slice.length + ' of ' + filtered.length + ' sermons';

        grid.innerHTML = '';
        if (slice.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'card';
          empty.style.gridColumn = '1 / -1';
          empty.textContent = 'No matching sermons found. Try clearing your search filter.';
          grid.appendChild(empty);
        } else {
          slice.forEach(function (v) {
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'video-card' + (activeVideo && activeVideo.id === v.id ? ' active' : '');
            var thumbWrap = document.createElement('div');
            thumbWrap.className = 'thumb-wrap';
            var img = document.createElement('img');
            img.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(v.youtubeId) + '/hqdefault.jpg';
            img.alt = v.title;
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            thumbWrap.appendChild(img);

            var body = document.createElement('div');
            body.style.padding = '14px';
            var meta = document.createElement('div');
            meta.style.cssText = 'font-size:12px;color:#57534E;margin-bottom:6px;';
            meta.textContent = v.category;
            var h3 = document.createElement('h3');
            h3.style.cssText = 'margin:0;font-size:18px;line-height:1.3;color:#1C1917;';
            h3.textContent = v.title;
            body.appendChild(meta);
            body.appendChild(h3);
            if (v.description) {
              var desc = document.createElement('p');
              desc.style.cssText = 'margin:6px 0 0;font-size:12px;color:#57534E;';
              desc.textContent = v.description;
              body.appendChild(desc);
            }
            card.appendChild(thumbWrap);
            card.appendChild(body);
            card.addEventListener('click', function () {
              setVideo(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            grid.appendChild(card);
          });
        }

        if (loadMoreBtn) {
          var remaining = filtered.length - slice.length;
          loadMoreBtn.classList.toggle('hidden', remaining <= 0);
          loadMoreBtn.textContent = 'Load More Sermons (' + remaining + ' remaining)';
        }
      }

      var searchInput = document.getElementById('offline-sermon-search');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          searchQuery = e.target.value;
          visibleCount = 24;
          renderSermons();
        });
      }
      var clearSearchBtn = document.getElementById('offline-clear-search');
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function () {
          searchQuery = '';
          visibleCount = 24;
          if (searchInput) searchInput.value = '';
          renderSermons();
        });
      }
      var loadMoreBtn = document.getElementById('offline-load-more');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
          visibleCount += 24;
          renderSermons();
        });
      }

      function renderBible() {
        var select = document.getElementById('offline-chapter-select');
        var toggles = document.getElementById('offline-version-toggles');
        var versesEl = document.getElementById('offline-bible-verses');
        if (!select || !toggles || !versesEl || !state.chapters || state.chapters.length === 0) return;

        if (select.options.length === 0) {
          state.chapters.forEach(function (c, idx) {
            var opt = document.createElement('option');
            opt.value = String(idx);
            opt.textContent = c.book + ' ' + c.chapter + ' — ' + c.title;
            select.appendChild(opt);
          });
          select.addEventListener('change', renderBible);
        }

        toggles.innerHTML = '';
        (state.versions || []).forEach(function (ver) {
          var label = document.createElement('label');
          label.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;';
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = activeVersions.indexOf(ver) !== -1;
          cb.addEventListener('change', function () {
            if (cb.checked && activeVersions.indexOf(ver) === -1) {
              activeVersions.push(ver);
            } else if (!cb.checked && activeVersions.length > 1) {
              activeVersions = activeVersions.filter(function (v) { return v !== ver; });
            }
            renderBible();
          });
          label.appendChild(cb);
          label.appendChild(document.createTextNode(ver));
          toggles.appendChild(label);
        });

        var chapter = state.chapters[Number(select.value || 0)] || state.chapters[0];
        versesEl.innerHTML = '';
        chapter.verses.forEach(function (v) {
          var row = document.createElement('div');
          row.className = 'verse-row';
          var head = document.createElement('div');
          head.className = 'mono';
          head.style.cssText = 'font-size:12px;font-weight:700;color:#9A3412;';
          head.textContent = chapter.book + ' ' + chapter.chapter + ':' + v.verse;
          var cols = document.createElement('div');
          cols.className = 'verse-cols';
          activeVersions.forEach(function (ver) {
            var col = document.createElement('div');
            var tag = document.createElement('div');
            tag.style.cssText = 'font-size:11px;font-weight:700;color:#1E3A5F;margin-bottom:4px;';
            tag.textContent = ver;
            var txt = document.createElement('p');
            txt.style.cssText = 'margin:0;font-size:14px;color:#1C1917;';
            txt.textContent = (v.versions && v.versions[ver]) || '';
            col.appendChild(tag);
            col.appendChild(txt);
            cols.appendChild(col);
          });
          row.appendChild(head);
          row.appendChild(cols);
          versesEl.appendChild(row);
        });
      }

      function renderDailyVerse() {
        if (!state.verses || state.verses.length === 0) return;
        var verse = state.verses[currentVerseIndex % state.verses.length];
        document.getElementById('offline-verse-topic').textContent = 'Daily Scripture · ' + verse.topic;
        document.getElementById('offline-verse-text').textContent = '“' + verse.text + '”';
        document.getElementById('offline-verse-ref').textContent = verse.reference;
        document.getElementById('offline-verse-prompt').textContent =
          'Sacred Christian devotional artwork illustrating "' + verse.reference + '": radiant dawn light over a living grapevine branch and ancient open scripture scroll, warm parchment gold and deep sanctuary indigo palette, painterly museum editorial style, no embedded text.';
      }

      var randVerseBtn = document.getElementById('offline-random-verse-btn');
      if (randVerseBtn) {
        randVerseBtn.addEventListener('click', function () {
          currentVerseIndex = Math.floor(Math.random() * (state.verses ? state.verses.length : 1));
          renderDailyVerse();
        });
      }
      var copyPromptBtn = document.getElementById('offline-copy-prompt-btn');
      if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', function () {
          var promptText = document.getElementById('offline-verse-prompt').textContent || '';
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(promptText).then(function () {
              copyPromptBtn.textContent = 'Copied Prompt';
              setTimeout(function () { copyPromptBtn.textContent = 'Copy Prompt'; }, 1800);
            });
          }
        });
      }

      function renderSongs() {
        var list = document.getElementById('offline-songs-list');
        if (!list) return;
        list.innerHTML = '';
        (state.songs || []).forEach(function (song) {
          var card = document.createElement('div');
          card.className = 'card';
          var meta = document.createElement('div');
          meta.style.cssText = 'font-size:12px;color:#9A3412;font-weight:700;';
          meta.textContent = song.hymnNumber + ' · ' + song.language;
          var title = document.createElement('h2');
          title.style.cssText = 'margin:4px 0 6px;font-size:22px;';
          title.textContent = song.title;
          var comp = document.createElement('div');
          comp.style.cssText = 'font-size:12px;color:#57534E;margin-bottom:12px;';
          comp.textContent = song.composer;
          var lyrics = document.createElement('pre');
          lyrics.style.cssText = 'margin:0 0 14px;white-space:pre-wrap;font-family:Georgia,serif;font-size:14px;line-height:1.65;color:#1C1917;background:#FAF7F2;padding:14px;border-radius:8px;border:1px solid #E5DEC9;';
          lyrics.textContent = song.lyricsExcerpt || '';

          card.appendChild(meta);
          card.appendChild(title);
          card.appendChild(comp);
          card.appendChild(lyrics);

          var pdfUri = state.songPdfDataUris && state.songPdfDataUris[song.id];
          if (pdfUri) {
            var dl = document.createElement('a');
            dl.className = 'btn btn-secondary';
            dl.href = pdfUri;
            dl.download = song.fileName || (song.title + '.pdf');
            dl.textContent = 'Save Song PDF';
            card.appendChild(dl);
          }
          list.appendChild(card);
        });
      }

      renderHomeUpNext();
      renderCategoryBar();
      renderSermons();
      renderBible();
      renderDailyVerse();
      renderSongs();
    })();
  </script>
</body>
</html>`;
}
