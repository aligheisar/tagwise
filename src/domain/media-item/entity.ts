type MediaTags = {
  // Basic
  title?: string[];
  artist?: string[];
  album?: string[];
  comment?: string[];
  genre?: string[];
  year?: number;
  track?: number;

  // Extended
  date?: string | string[];
  albumArtist?: string[];
  composer?: string[];
  conductor?: string[];
  copyright?: string[];
  encodedBy?: string[];
  isrc?: string[];
  lyricist?: string[];
  titleSort?: string[];
  artistSort?: string[];
  albumSort?: string[];
  albumArtistSort?: string[];
  composerSort?: string[];
  label?: string[];
  subtitle?: string[];
  producer?: string[];
  originalArtist?: string[];
  originalAlbum?: string[];
  originalDate?: string[];
  acoustidFingerprint?: string[];
  acoustidId?: string[];
  musicbrainzTrackId?: string[];
  musicbrainzReleaseId?: string[];
  musicbrainzArtistId?: string[];
  musicbrainzReleaseGroupId?: string[];
  replayGainTrackGain?: string[];
  replayGainTrackPeak?: string[];
  replayGainAlbumGain?: string[];
  replayGainAlbumPeak?: string[];
  appleSoundCheck?: string[];
  discNumber?: number;
  totalTracks?: number;
  totalDiscs?: number;
  bpm?: number;
  compilation?: boolean;
};

type AudioProperties = {
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
  codec?: string;
  bitRateMode?: string;
};

type MediaItem =
  | {
      status: "ok";
      path: string;
      tags: MediaTags;
      properties?: AudioProperties;
      hasCoverArt?: boolean;
    }
  | {
      status: "error";
      path: string;
      error: string;
    };

type ScanResult = {
  items: MediaItem[];
  duration: number;
};

type Library = {
  items: MediaItem[];
  root: string;
  cachedAt: Date;
};

export type { AudioProperties, Library, MediaItem, MediaTags, ScanResult };
