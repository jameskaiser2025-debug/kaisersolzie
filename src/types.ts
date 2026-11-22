export type CityStatus = 'pending' | 'confirmed';
export type TransitMode = 'Train Station' | 'Walk' | 'Public Transit' | 'Rideshare' | 'Host Pickup';

export interface TourCity {
  id: string;
  segmentNumber: number;
  name: string;
  state: string;
  dateText: string; // empty until confirmed by admin
  transitZone: string; // locked active neighborhood / transit zone once routed
  status: CityStatus;
  maxSpots: number;
  amtrakStation: string;
  stationCode: string;
  trainNumber: string;
  arrivalTime: string;
  departureTime: string;
  railPassBooked: boolean;
  transitNotes: string;
}

export interface SetBooking {
  id: string;
  receiptCode: string;
  cityId: string;
  cityName: string;
  buyerName: string;
  buyerEmail: string;
  settingType: string;
  locationDetails: string;
  preferredTimeBlocks: [string, string, string];
  confirmedTimeBlock: string;
  stopOrder: number | null;
  transitMode: TransitMode;
  transitMinutes: number;
  railPassAddonUsd: number;
  totalUsd: number;
  collectorPackReady: boolean;
  masterDelivered: boolean;
  notes: string;
  createdAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  album: string;
  durationSec: number;
  bpm: number;
  keyLabel: string;
  chords: number[][];
}

export interface MusicPlatformLink {
  id: 'bandcamp' | 'youtube-music' | 'spotify' | 'apple-music';
  name: string;
  url: string;
  subtitle: string;
}

export interface VideoPlaylistItem {
  id: string;
  title: string;
  category: string;
  embedUrl: string;
  watchUrl: string;
  posterUrl: string;
}

export interface LiveStreamConfig {
  liveUrl: string;
  embedUrl: string;
  announcementTitle: string;
  announcementBody: string;
  isLiveActive: boolean;
  updatedAt: string;
}
