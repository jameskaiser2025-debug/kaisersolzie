import type {
  LiveStreamConfig,
  MusicPlatformLink,
  MusicTrack,
  TourCity,
  VideoPlaylistItem,
} from '../types';

export const TOUR_POSTERS = {
  comicAcoustic: {
    src: '/assets/aistudio/Messenger_creation_523E70B8-33C9-4069-A47F-ACDB65C0C4B8_0197f5d5.jpeg',
    title: '10 by 10 DIY Punk Rock / Home Tour',
    caption: 'Acoustic home tour artwork featuring Amtrak outside the living room window.',
  },
  routeMap: {
    src: '/assets/aistudio/Messenger_creation_7061A20F-4CFF-418A-BB1B-95C4488682BD_1538ba47.jpeg',
    title: 'Coast-to-Coast Amtrak Rail Pass Route Map',
    caption: '10 Cities, 10 Days, 100 Private Sets — USA Rail Pass Dash.',
  },
  railTourPoster: {
    src: '/assets/aistudio/Messenger_creation_826E3A68-D98F-40CB-928B-9896AED7A5B3_6c36a7c7.jpeg',
    title: 'The 10by10 Rail Tour — Full Bill',
    caption: '10 cities, 10 individual performances each city, $10 per set.',
  },
  howToClaim: {
    src: '/assets/aistudio/Messenger_creation_C19B8D9E-292B-46BC-B899-F8E8727AD112_2f919955.jpeg',
    title: 'How to Claim Your 30-Minute Mythical Blip',
    caption: 'From spot submission and vetting to arrival day.',
  },
  railPassDash: {
    src: '/assets/aistudio/Messenger_creation_E7B0CE5F-2BC2-42DC-A02E-1615C06C1C9B_cc8d1940.jpeg',
    title: 'The 10by10 Rail Pass Dash',
    caption: '100 patrons, 1 impossible Amtrak dash.',
  },
  vintageCream: {
    src: '/assets/aistudio/Messenger_creation_299E3C3B-2ABF-48DD-9469-521051B2DA63_baa8d6f7.jpeg',
    title: 'Coast-to-Coast Rail Tour Poster',
    caption: 'Early-morning Amtrak arrivals and late-night departures for 11+ hours per city.',
  },
  collectorHandbill: {
    src: '/assets/aistudio/Messenger_creation_0A99CCE8-6F79-45E8-9F54-0F14FEB4E2B8_13b838c4.jpeg',
    title: '10by10 Rail Tour Handbill',
    caption: 'Shareable official tour flyer.',
  },
} as const;

export const INITIAL_CITIES: TourCity[] = [
  {
    id: 'nyc',
    segmentNumber: 1,
    name: 'New York City',
    state: 'NY',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Moynihan Train Hall / NY Penn',
    stationCode: 'NYP',
    trainNumber: 'Lake Shore Limited #49',
    arrivalTime: '07:30 AM',
    departureTime: '09:40 PM',
    railPassBooked: false,
    transitNotes: 'Subway loop across Brooklyn & Manhattan; leave 40 min buffer back to NYP.',
  },
  {
    id: 'chi',
    segmentNumber: 2,
    name: 'Chicago',
    state: 'IL',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Chicago Union Station',
    stationCode: 'CHI',
    trainNumber: 'Southwest Chief #3',
    arrivalTime: '09:50 AM',
    departureTime: '10:15 PM',
    railPassBooked: false,
    transitNotes: 'CTA Blue & Red lines from Union Station into Logan Square, Pilsen, and Wicker Park.',
  },
  {
    id: 'lax',
    segmentNumber: 3,
    name: 'Los Angeles',
    state: 'CA',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'LA Union Station',
    stationCode: 'LAX',
    trainNumber: 'Pacific Surfliner #590',
    arrivalTime: '08:15 AM',
    departureTime: '09:10 PM',
    railPassBooked: false,
    transitNotes: 'Cluster Eastside / DTLA / Silver Lake sets to stay ahead of afternoon traffic.',
  },
  {
    id: 'san',
    segmentNumber: 4,
    name: 'San Diego',
    state: 'CA',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Santa Fe Depot',
    stationCode: 'SAN',
    trainNumber: 'Pacific Surfliner Connector',
    arrivalTime: '08:30 AM',
    departureTime: '08:45 PM',
    railPassBooked: false,
    transitNotes: 'Walkable Downtown + Trolley & quick rideshare into North Park and Ocean Beach.',
  },
  {
    id: 'sfo',
    segmentNumber: 5,
    name: 'San Francisco',
    state: 'CA',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Emeryville / SF Ferry Thruway',
    stationCode: 'EMY',
    trainNumber: 'Coast Starlight / Thruway',
    arrivalTime: '08:15 AM',
    departureTime: '09:00 PM',
    railPassBooked: false,
    transitNotes: 'BART + Muni corridor across Oakland, Mission District, and Haight.',
  },
  {
    id: 'lvs',
    segmentNumber: 6,
    name: 'Las Vegas',
    state: 'NV',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Las Vegas Amtrak Thruway Hub',
    stationCode: 'LVS',
    trainNumber: 'Amtrak Thruway Connector',
    arrivalTime: '08:45 AM',
    departureTime: '09:30 PM',
    railPassBooked: false,
    transitNotes: 'Arts District & neighborhood living-room hops via local rideshare.',
  },
  {
    id: 'sas',
    segmentNumber: 7,
    name: 'San Antonio',
    state: 'TX',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'San Antonio Station',
    stationCode: 'SAS',
    trainNumber: 'Texas Eagle #22',
    arrivalTime: '07:00 AM',
    departureTime: '08:30 PM',
    railPassBooked: false,
    transitNotes: 'Early morning arrival near Sunset Station; acoustic setup ready for porch & living-room blocks.',
  },
  {
    id: 'aus',
    segmentNumber: 8,
    name: 'Austin',
    state: 'TX',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Austin Amtrak Station',
    stationCode: 'AUS',
    trainNumber: 'Texas Eagle #22',
    arrivalTime: '09:30 AM',
    departureTime: '09:30 PM',
    railPassBooked: false,
    transitNotes: 'East Austin & South Congress corridor accessible within 15 minutes of Lamar station.',
  },
  {
    id: 'dal',
    segmentNumber: 9,
    name: 'Dallas',
    state: 'TX',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'EBJ Union Station',
    stationCode: 'DAL',
    trainNumber: 'Texas Eagle / Crescent Transfer',
    arrivalTime: '08:30 AM',
    departureTime: '09:15 PM',
    railPassBooked: false,
    transitNotes: 'DART Rail direct from Union Station to Deep Ellum, Bishop Arts, and Oak Cliff.',
  },
  {
    id: 'atl',
    segmentNumber: 10,
    name: 'Atlanta / St. Pete',
    state: 'GA / FL',
    dateText: '',
    transitZone: '',
    status: 'pending',
    maxSpots: 10,
    amtrakStation: 'Peachtree Station (ATL) / St. Pete Thruway',
    stationCode: 'ATL',
    trainNumber: 'Crescent #20 / Floridian',
    arrivalTime: '08:15 AM',
    departureTime: '09:00 PM',
    railPassBooked: false,
    transitNotes: 'Final 10x10 Rail Pass leg leading into the Orlando Friends & Family gathering.',
  },
];

export interface CityAnchorState {
  stage: 'anchor_needed' | 'routing' | 'confirmed';
  label: string;
  neededForAnchor: number;
}

export function getCityAnchorState(city: TourCity, bookedCount: number): CityAnchorState {
  const cleanDate = city.dateText.trim();
  if (city.status === 'confirmed' && cleanDate.length > 0 && cleanDate.toUpperCase() !== 'TBA') {
    return {
      stage: 'confirmed',
      label: `CONFIRMED: ${cleanDate}`,
      neededForAnchor: 0,
    };
  }
  if (bookedCount >= 3) {
    return {
      stage: 'routing',
      label: '3 HITS REACHED — ROUTING IN PROGRESS',
      neededForAnchor: 0,
    };
  }
  const needed = Math.max(1, 3 - bookedCount);
  return {
    stage: 'anchor_needed',
    label: `TBA / NEED ${needed} MORE TO LOCK DATE`,
    neededForAnchor: needed,
  };
}

export const TIME_BLOCK_CHOICES = [
  'Morning (9:00 AM – 11:30 AM)',
  'Early Afternoon (12:00 PM – 2:30 PM)',
  'Late Afternoon (3:00 PM – 5:30 PM)',
  'Evening (6:00 PM – 8:30 PM)',
] as const;

export const SETTING_OPTIONS = [
  'Living Room',
  'Front Porch',
  'Park Bench',
  'Backyard / Patio',
  'Local Hangout',
  'Rooftop',
  'Garage / Basement',
] as const;

export const EIGHT_COLLECTOR_ITEMS = [
  'Custom 10x10 Tour T-Shirt',
  'Serialized Patron Ticket (#1–#100)',
  'Limited Railway Tour Poster',
  'DIY Lyric & Rail Journal Zine',
  'Stamped Guitar Pick Tin',
  '10x10 Enamel Pin Pack',
  'Custom Cassette USB (with your 1-of-1 master)',
  'Hand-Signed Setlist & Ownership Certificate',
] as const;

export const ALBUM_TRACKS: MusicTrack[] = [
  {
    id: 'finding-the-line',
    title: 'Finding The Line',
    album: 'This Ones For Friends and Family: Acoustic Tales Of Years',
    durationSec: 204,
    bpm: 102,
    keyLabel: 'G Major',
    chords: [
      [196.0, 246.94, 293.66, 392.0],
      [146.83, 185.0, 220.0, 293.66],
      [164.81, 196.0, 246.94, 329.63],
      [130.81, 164.81, 196.0, 261.63],
    ],
  },
  {
    id: 'atl',
    title: 'ATL',
    album: 'This Ones For Friends and Family: Acoustic Tales Of Years',
    durationSec: 186,
    bpm: 112,
    keyLabel: 'D Major',
    chords: [
      [146.83, 220.0, 293.66, 369.99],
      [196.0, 246.94, 293.66, 392.0],
      [220.0, 277.18, 329.63, 440.0],
      [146.83, 220.0, 293.66, 369.99],
    ],
  },
  {
    id: 'occupy',
    title: 'Occupy',
    album: 'This Ones For Friends and Family: Acoustic Tales Of Years',
    durationSec: 178,
    bpm: 118,
    keyLabel: 'E Minor',
    chords: [
      [164.81, 196.0, 246.94, 329.63],
      [130.81, 164.81, 196.0, 261.63],
      [196.0, 246.94, 293.66, 392.0],
      [146.83, 185.0, 220.0, 293.66],
    ],
  },
  {
    id: 'pirate-song',
    title: 'Pirate Song',
    album: 'This Ones For Friends and Family: Acoustic Tales Of Years',
    durationSec: 194,
    bpm: 108,
    keyLabel: 'A Minor',
    chords: [
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
      [130.81, 164.81, 196.0, 261.63],
      [196.0, 246.94, 293.66, 392.0],
    ],
  },
  {
    id: 'outta-my-head',
    title: 'Outta My Head',
    album: 'This Ones For Friends and Family: Acoustic Tales Of Years',
    durationSec: 212,
    bpm: 96,
    keyLabel: 'C Major',
    chords: [
      [130.81, 164.81, 196.0, 261.63],
      [196.0, 246.94, 293.66, 392.0],
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
    ],
  },
];

export const STREAMING_PLATFORMS: MusicPlatformLink[] = [
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    url: 'https://kaisersolzie.bandcamp.com',
    subtitle: 'Full Album & Direct Support',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    url: 'https://music.youtube.com/search?q=Kaiser%20Solzie',
    subtitle: 'Stream Catalog',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://open.spotify.com/search/Kaiser%20Solzie',
    subtitle: 'Artist Search & Tracks',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    url: 'https://music.apple.com/us/search?term=Kaiser%20Solzie',
    subtitle: 'Listen on Apple Music',
  },
];

export const VIDEO_PLAYLIST: VideoPlaylistItem[] = [
  {
    id: 'history-playlist',
    title: 'The History of Kaiser Solzie (Full Playlist)',
    category: 'Full Playlist',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PLlGfisu6ninenO_cDU-i8IAUmcm6C-gjI',
    watchUrl: 'https://www.youtube.com/playlist?list=PLlGfisu6ninenO_cDU-i8IAUmcm6C-gjI',
    posterUrl: TOUR_POSTERS.comicAcoustic.src,
  },
  {
    id: 'bus-invaders',
    title: 'Digital Tour Bus — Bus Invaders (Warped Tour 2018)',
    category: 'Tour Feature',
    embedUrl: 'https://www.youtube.com/embed/xTji5Ho2nDs',
    watchUrl: 'https://www.youtube.com/watch?v=xTji5Ho2nDs',
    posterUrl: TOUR_POSTERS.routeMap.src,
  },
  {
    id: 'b-sides-on-air',
    title: 'B-Sides On-Air Interview (Warped Tour & Origins)',
    category: 'Interview',
    embedUrl: 'https://www.youtube.com/embed/sfBrTcgJOi8',
    watchUrl: 'https://www.youtube.com/watch?v=sfBrTcgJOi8',
    posterUrl: TOUR_POSTERS.railTourPoster.src,
  },
  {
    id: 'key-of-change',
    title: 'Warped Tour Interview (In The Key of Change)',
    category: 'Interview',
    embedUrl: 'https://www.youtube.com/embed/DGWoa_QS3K8',
    watchUrl: 'https://www.youtube.com/watch?v=DGWoa_QS3K8',
    posterUrl: TOUR_POSTERS.railPassDash.src,
  },
  {
    id: 'comfy-corner',
    title: 'Comfy Corner: Kaiser Solzie',
    category: 'Session',
    embedUrl: 'https://www.youtube.com/embed/LOgWk7tKRhk',
    watchUrl: 'https://www.youtube.com/watch?v=LOgWk7tKRhk',
    posterUrl: TOUR_POSTERS.vintageCream.src,
  },
];

export const INITIAL_LIVE_STREAM: LiveStreamConfig = {
  liveUrl: '',
  embedUrl: '',
  announcementTitle: 'Amtrak 10x10 Dispatch — Ready for Live Check-Ins',
  announcementBody:
    'When Kaiser goes live from an Amtrak station, coach car, or host living room, the broadcast or announcement plays right here.',
  isLiveActive: false,
  updatedAt: new Date().toISOString(),
};
