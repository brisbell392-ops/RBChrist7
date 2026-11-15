import { useState } from 'react';
import { Play } from 'lucide-react';
import { buildYouTubeThumbnailUrl } from '../utils/youtube';

interface VideoThumbnailProps {
  youtubeId: string;
  title: string;
  isPlaying?: boolean;
}

export function VideoThumbnail({ youtubeId, title, isPlaying = false }: VideoThumbnailProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#231B15]">
      {!imgFailed ? (
        <img
          src={buildYouTubeThumbnailUrl(youtubeId)}
          alt={title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#2C1A12] via-[#1E3A5F] to-[#1C1917] p-4 text-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 36 36"
            className="mb-2 h-8 w-8 text-[#EAB308]/80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M18 4v28M9 13h18" />
          </svg>
          <p className="line-clamp-2 font-display text-sm font-semibold text-[#FAF7F2]">
            {title}
          </p>
        </div>
      )}

      <div
        className={`absolute inset-0 flex items-center justify-center transition-colors duration-200 ${
          isPlaying
            ? 'bg-black/45'
            : 'bg-gradient-to-t from-black/65 via-black/15 to-transparent group-hover:bg-black/40'
        }`}
      >
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105 ${
            isPlaying
              ? 'border-[#EAB308] bg-[#9A3412] text-white'
              : 'border-white/70 bg-black/55 text-white'
          }`}
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </span>
      </div>
    </div>
  );
}
