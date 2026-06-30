import type { FolderScanItem, FolderScanResult } from "taglib-wasm/folder";
import type { MediaItem, ScanResult } from "@/domain/media-item/entity";

function mapScanResult(result: FolderScanResult): ScanResult {
  return {
    duration: result.duration,
    items: result.items.map(mapScanItem),
  };
}

function mapScanItem(item: FolderScanItem): MediaItem {
  if (item.status === "error") {
    return { error: item.error.message, path: item.path, status: "error" };
  }
  return {
    hasCoverArt: item.hasCoverArt,
    path: item.path,
    properties: item.properties
      ? {
          bitRateMode: item.properties.bitrateMode,
          bitrate: item.properties.bitrate,
          bitsPerSample: item.properties.bitsPerSample,
          channels: item.properties.channels,
          codec: item.properties.codec,
          duration: item.properties.duration,
          sampleRate: item.properties.sampleRate,
        }
      : undefined,
    status: "ok",
    tags: {
      acoustidFingerprint: item.tags.acoustidFingerprint,
      acoustidId: item.tags.acoustidId,
      album: item.tags.album,
      albumArtist: item.tags.albumArtist,
      albumArtistSort: item.tags.albumArtistSort,
      albumSort: item.tags.albumSort,
      appleSoundCheck: item.tags.appleSoundCheck,
      artist: item.tags.artist,
      artistSort: item.tags.artistSort,
      bpm: item.tags.bpm,
      comment: item.tags.comment,
      compilation: item.tags.compilation,
      composer: item.tags.composer,
      composerSort: item.tags.composerSort,
      conductor: item.tags.conductor,
      copyright: item.tags.copyright,
      date: item.tags.date,
      discNumber: item.tags.discNumber,
      encodedBy: item.tags.encodedBy,
      genre: item.tags.genre,
      isrc: item.tags.isrc,
      label: item.tags.label,
      lyricist: item.tags.lyricist,
      musicbrainzArtistId: item.tags.musicbrainzArtistId,
      musicbrainzReleaseGroupId: item.tags.musicbrainzReleaseGroupId,
      musicbrainzReleaseId: item.tags.musicbrainzReleaseId,
      musicbrainzTrackId: item.tags.musicbrainzTrackId,
      originalAlbum: item.tags.originalAlbum,
      originalArtist: item.tags.originalArtist,
      originalDate: item.tags.originalDate,
      producer: item.tags.producer,
      replayGainAlbumGain: item.tags.replayGainAlbumGain,
      replayGainAlbumPeak: item.tags.replayGainAlbumPeak,
      replayGainTrackGain: item.tags.replayGainTrackGain,
      replayGainTrackPeak: item.tags.replayGainTrackPeak,
      subtitle: item.tags.subtitle,
      title: item.tags.title,
      titleSort: item.tags.titleSort,
      totalDiscs: item.tags.totalDiscs,
      totalTracks: item.tags.totalTracks,
      track: item.tags.track,
      year: item.tags.year,
    },
  };
}

export { mapScanResult };
