import { useMemo, useState } from 'react';
import { Download, FileText, Music, Search, Upload, X } from 'lucide-react';
import type { SongPdfItem } from '../types/ministry';

interface SongsViewProps {
  songs: SongPdfItem[];
  onSongUploaded: (song: SongPdfItem) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SongsView({ songs, onSongUploaded }: SongsViewProps) {
  const supportsInlinePdf =
    typeof navigator !== 'undefined' && navigator.pdfViewerEnabled === true;

  const [selectedSong, setSelectedSong] = useState<SongPdfItem | null>(songs[0] ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readerMode, setReaderMode] = useState<'pdf' | 'lyrics'>(
    supportsInlinePdf ? 'pdf' : 'lyrics'
  );
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [title, setTitle] = useState('');
  const [hymnNumber, setHymnNumber] = useState('');
  const [language, setLanguage] = useState('English');
  const [composer, setComposer] = useState('');
  const [lyricsExcerpt, setLyricsExcerpt] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.hymnNumber.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.composer.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  const activeSong =
    selectedSong && songs.some((s) => s.id === selectedSong.id)
      ? selectedSong
      : songs[0] ?? null;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!title.trim()) {
      setUploadError('Please enter a song title.');
      return;
    }
    if (!pdfFile) {
      setUploadError('Please choose a PDF file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('hymnNumber', hymnNumber.trim() || `Hymn ${songs.length + 1}`);
      formData.append('language', language.trim() || 'English');
      formData.append('composer', composer.trim() || 'Righteous Branch Congregation');
      formData.append('lyricsExcerpt', lyricsExcerpt.trim());
      formData.append('pdf', pdfFile);

      const res = await fetch('/api/songs', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as SongPdfItem & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not upload song PDF.');
      }

      onSongUploaded(data);
      setSelectedSong(data);
      setTitle('');
      setHymnNumber('');
      setComposer('');
      setLyricsExcerpt('');
      setPdfFile(null);
      setUploadSuccess(`Uploaded "${data.title}" to the ministry hymnal.`);
      setShowUploadForm(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#9A3412] uppercase">
            Congregational Hymnal
          </p>
          <h1 className="font-display mt-1 text-4xl font-bold text-[#1C1917]">
            Worship Song PDF Library
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#57534E]">
            Browse, read directly in-browser, download, or upload worship song PDF sheets for the congregation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUploadForm((prev) => !prev);
            setUploadError('');
            setUploadSuccess('');
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162C49]"
        >
          {showUploadForm ? <X className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          <span>{showUploadForm ? 'Close Upload Form' : 'Upload Song PDF'}</span>
        </button>
      </div>

      {uploadSuccess && (
        <div role="status" className="rounded-lg border border-[#14532D]/30 bg-[#14532D]/5 px-4 py-3 text-sm font-medium text-[#14532D]">
          {uploadSuccess}
        </div>
      )}

      {/* Upload Song PDF Drawer */}
      {showUploadForm && (
        <form
          onSubmit={handleUploadSubmit}
          className="space-y-5 rounded-xl border border-[#E5DEC9] bg-white p-6"
        >
          <div className="border-b border-[#F2ECE1] pb-3">
            <h2 className="font-display text-2xl font-bold text-[#1C1917]">
              Upload New Song PDF Sheet
            </h2>
            <p className="text-xs text-[#57534E]">
              Accepted format: PDF (.pdf up to 15 MB). Once uploaded, all visitors can read and download it immediately.
            </p>
          </div>

          {uploadError && (
            <div role="alert" className="rounded-md border border-[#9A3412]/30 bg-[#9A3412]/5 px-3.5 py-2.5 text-sm text-[#9A3412]">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="song-title-input" className="block text-xs font-semibold text-[#44403C]">
                Song Title *
              </label>
              <input
                id="song-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Praise to the Righteous Branch"
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              />
            </div>

            <div>
              <label htmlFor="song-number-input" className="block text-xs font-semibold text-[#44403C]">
                Hymn / Sheet Number
              </label>
              <input
                id="song-number-input"
                type="text"
                value={hymnNumber}
                onChange={(e) => setHymnNumber(e.target.value)}
                placeholder="e.g. Hymn 04"
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              />
            </div>

            <div>
              <label htmlFor="song-lang-input" className="block text-xs font-semibold text-[#44403C]">
                Language
              </label>
              <input
                id="song-lang-input"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English / Tamil"
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="song-composer-input" className="block text-xs font-semibold text-[#44403C]">
                Composer / Choir
              </label>
              <input
                id="song-composer-input"
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Righteous Branch Choir"
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C1917]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="song-pdf-file" className="block text-xs font-semibold text-[#44403C]">
                PDF File *
              </label>
              <input
                id="song-pdf-file"
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full cursor-pointer rounded-md border border-[#D6CEBE] bg-[#FAF7F2] px-3 py-1.5 text-sm text-[#1C1917] file:mr-3 file:rounded file:border-0 file:bg-[#1E3A5F] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="song-lyrics-input" className="block text-xs font-semibold text-[#44403C]">
                Lyrics Summary / First Stanza (Optional for quick text reading)
              </label>
              <textarea
                id="song-lyrics-input"
                rows={3}
                value={lyricsExcerpt}
                onChange={(e) => setLyricsExcerpt(e.target.value)}
                placeholder="Optional chorus or verses for quick mobile text view..."
                className="mt-1 w-full rounded-md border border-[#D6CEBE] bg-[#FAF7F2] p-3 text-sm text-[#1C1917]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="cursor-pointer rounded-md border border-[#D6CEBE] px-4 py-2 text-sm font-medium text-[#44403C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#9A3412] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7C2D12] disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading PDF...' : 'Publish Song PDF'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Split Hymnal Directory & Reader */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Song List */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="relative">
            <label htmlFor="song-search" className="sr-only">
              Search song PDFs
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
            <input
              id="song-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hymns or language..."
              className="w-full rounded-md border border-[#D6CEBE] bg-white py-2.5 pr-4 pl-9 text-sm text-[#1C1917]"
            />
          </div>

          <div className="divide-y divide-[#F2ECE1] overflow-hidden rounded-xl border border-[#E5DEC9] bg-white">
            {filteredSongs.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#57534E]">
                No song PDFs match your search.
              </p>
            ) : (
              filteredSongs.map((song) => {
                const isSelected = activeSong?.id === song.id;
                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => setSelectedSong(song)}
                    className={`flex w-full cursor-pointer flex-col gap-1 p-4 text-left transition-colors ${
                      isSelected ? 'bg-[#FAF7F2]' : 'hover:bg-[#FAF7F2]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#57534E]">
                      <span className="font-semibold text-[#9A3412]">
                        {song.hymnNumber}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatBytes(song.fileSizeBytes)}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#1C1917]">
                      {song.title}
                    </h2>
                    <p className="text-xs text-[#57534E]">
                      {song.composer} · {song.language}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Active PDF Reader */}
        <section className="lg:col-span-8">
          {!activeSong ? (
            <div className="rounded-xl border border-[#E5DEC9] bg-white p-12 text-center">
              <Music className="mx-auto h-8 w-8 text-[#9A3412]" />
              <p className="font-display mt-3 text-2xl font-semibold text-[#1C1917]">
                Select a Song PDF to Read
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E5DEC9] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DEC9] bg-[#FAF7F2] px-6 py-4">
                <div>
                  <p className="text-xs font-medium text-[#9A3412]">
                    {activeSong.hymnNumber} · {activeSong.language}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-[#1C1917]">
                    {activeSong.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md bg-[#F2ECE1] p-1">
                    <button
                      type="button"
                      onClick={() => setReaderMode('pdf')}
                      className={`cursor-pointer rounded px-3 py-1 text-xs font-medium transition-colors ${
                        readerMode === 'pdf'
                          ? 'bg-white text-[#1C1917] shadow-sm'
                          : 'text-[#57534E]'
                      }`}
                    >
                      PDF Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderMode('lyrics')}
                      className={`cursor-pointer rounded px-3 py-1 text-xs font-medium transition-colors ${
                        readerMode === 'lyrics'
                          ? 'bg-white text-[#1C1917] shadow-sm'
                          : 'text-[#57534E]'
                      }`}
                    >
                      Lyrics Sheet
                    </button>
                  </div>

                  <a
                    href={`/api/songs/${activeSong.id}/pdf`}
                    download={activeSong.fileName}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1E3A5F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#162C49]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {readerMode === 'pdf' ? (
                supportsInlinePdf ? (
                  <div className="bg-[#525659]/10">
                    <iframe
                      key={activeSong.id}
                      src={`/api/songs/${activeSong.id}/pdf`}
                      title={`PDF reader for ${activeSong.title}`}
                      className="h-[640px] w-full border-0"
                    />
                    <div className="flex items-center justify-between border-t border-[#E5DEC9] bg-[#FAF7F2] px-6 py-3 text-xs text-[#57534E]">
                      <span>Having trouble viewing inline? Switch to Lyrics Sheet or open in a new tab.</span>
                      <a
                        href={`/api/songs/${activeSong.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#1E3A5F] hover:text-[#9A3412]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Open Full Tab</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-8 text-center">
                    <FileText className="mx-auto h-10 w-10 text-[#1E3A5F]" />
                    <h3 className="font-display text-2xl font-bold text-[#1C1917]">
                      {activeSong.title} — PDF Ready
                    </h3>
                    <p className="mx-auto max-w-md text-sm text-[#57534E]">
                      This browser environment does not embed PDF files inline. Read the formatted song sheet directly in Lyrics Sheet mode, or download the PDF file below.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setReaderMode('lyrics')}
                        className="cursor-pointer rounded-md border border-[#D6CEBE] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917]"
                      >
                        Read Lyrics Sheet
                      </button>
                      <a
                        href={`/api/songs/${activeSong.id}/pdf`}
                        download={activeSong.fileName}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF ({formatBytes(activeSong.fileSizeBytes)})</span>
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4 p-8">
                  <div className="border-b border-[#F2ECE1] pb-3 text-xs text-[#57534E]">
                    Composer: {activeSong.composer} · File: {activeSong.fileName}
                  </div>
                  <pre className="whitespace-pre-wrap font-display text-xl leading-relaxed text-[#1C1917]">
                    {activeSong.lyricsExcerpt ||
                      'Open the PDF Document view or download the PDF file to read the complete musical score.'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
