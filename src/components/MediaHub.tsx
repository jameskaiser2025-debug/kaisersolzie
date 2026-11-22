import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  ExternalLink,
  Link2,
  MonitorUp,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ALBUM_TRACKS, STREAMING_PLATFORMS, VIDEO_PLAYLIST } from '../data/tourData';
import type { LiveStreamConfig } from '../types';

interface MediaHubProps {
  liveConfig: LiveStreamConfig;
  onUpdateLiveConfig: (next: LiveStreamConfig) => void;
}

function PlatformLogo({ id }: { id: 'bandcamp' | 'youtube-music' | 'spotify' | 'apple-music' }) {
  switch (id) {
    case 'bandcamp':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#1DA0C3" />
          <polygon points="6.2,15.8 9.6,8.2 17.8,8.2 14.4,15.8" fill="#FFFFFF" />
        </svg>
      );
    case 'youtube-music':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10.5" fill="#FF0000" />
          <circle cx="12" cy="12" r="6.3" fill="none" stroke="#FFFFFF" strokeWidth="1.4" />
          <polygon points="10.3,9.1 15.4,12 10.3,14.9" fill="#FFFFFF" />
        </svg>
      );
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10.5" fill="#1DB954" />
          <path
            d="M7.3 9.7c3.1-.9 6.6-.7 9.4.7M8 12.6c2.6-.7 5.5-.5 7.9.6M8.7 15.3c2-.5 4.4-.4 6.4.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'apple-music':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="#FA243C" />
          <path
            d="M15.5 7.2v7.3a2.1 2.1 0 1 1-1.3-1.95V9.3l-4.2.95v5.15a2.1 2.1 0 1 1-1.3-1.95V8.6l6.8-1.4Z"
            fill="#FFFFFF"
          />
        </svg>
      );
  }
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

function toSafeEmbedUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    const host = parsed.hostname.toLowerCase();
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '').trim();
      if (/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (host.endsWith('youtube.com')) {
      const list = parsed.searchParams.get('list');
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{6,20}$/.test(v)) {
        return `https://www.youtube.com/embed/${v}`;
      }
      if (parsed.pathname.startsWith('/live/')) {
        const id = parsed.pathname.replace('/live/', '').split('/')[0];
        if (/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }
      if (list && /^[a-zA-Z0-9_-]{10,60}$/.test(list)) {
        return `https://www.youtube.com/embed/videoseries?list=${list}`;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return trimmed;
      }
    }
    return trimmed;
  } catch {
    return '';
  }
}

export function MediaHub({ liveConfig, onUpdateLiveConfig }: MediaHubProps) {
  // --- Audio Player State ---
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stepTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const chordStepRef = useRef(0);

  const currentTrack = ALBUM_TRACKS[activeTrackIdx] ?? ALBUM_TRACKS[0];

  const stopAudioEngine = () => {
    if (stepTimerRef.current !== null) {
      window.clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const triggerAcousticStrum = (ctx: AudioContext, gainDest: GainNode, frequencies: number[]) => {
    const now = ctx.currentTime;
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.038);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1550, now + idx * 0.038);
      filter.frequency.exponentialRampToValueAtTime(420, now + idx * 0.038 + 1.3);

      noteGain.gain.setValueAtTime(0.0001, now + idx * 0.038);
      noteGain.gain.linearRampToValueAtTime(0.11 / frequencies.length, now + idx * 0.038 + 0.018);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.038 + 1.45);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(gainDest);

      osc.start(now + idx * 0.038);
      osc.stop(now + idx * 0.038 + 1.5);
    });
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    stopAudioEngine();
    if (!isPlaying || !currentTrack) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = isMuted ? 0 : volume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    const ctx = audioCtxRef.current;
    const gainDest = masterGainRef.current!;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const chordMs = Math.round((60000 / Math.max(70, currentTrack.bpm)) * 2);
    const playStep = () => {
      const chord = currentTrack.chords[chordStepRef.current % currentTrack.chords.length];
      chordStepRef.current += 1;
      triggerAcousticStrum(ctx, gainDest, chord);
    };

    playStep();
    stepTimerRef.current = window.setInterval(playStep, chordMs);
    progressTimerRef.current = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= currentTrack.durationSec) {
          setActiveTrackIdx((i) => (i + 1) % ALBUM_TRACKS.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => stopAudioEngine();
  }, [isPlaying, activeTrackIdx, currentTrack]);

  useEffect(() => {
    return () => {
      stopAudioEngine();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  // --- Video Playlist & Live / Mobile Stream Mode State ---
  const [mode, setMode] = useState<'playlist' | 'live'>(liveConfig.isLiveActive ? 'live' : 'playlist');
  const [activeVideoId, setActiveVideoId] = useState(VIDEO_PLAYLIST[0].id);

  // Live URL / Announcement form fields
  const [draftUrl, setDraftUrl] = useState(liveConfig.liveUrl);
  const [draftTitle, setDraftTitle] = useState(liveConfig.announcementTitle);
  const [draftBody, setDraftBody] = useState(liveConfig.announcementBody);
  const [liveFormError, setLiveFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Direct device camera/screen preview
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startDeviceCamera = async (kind: 'camera' | 'screen') => {
    setCameraError(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices) {
        setCameraError('Device media capture is unavailable in this browser.');
        return;
      }
      const stream =
        kind === 'camera'
          ? await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      setCameraActive(true);
      stream.getVideoTracks()[0]?.addEventListener('ended', () => stopCamera());
      window.setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          void liveVideoRef.current.play().catch(() => undefined);
        }
      }, 60);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Camera or screen permission was denied.');
    }
  };

  const handlePublishLive = (e: React.FormEvent) => {
    e.preventDefault();
    setLiveFormError(null);
    const trimmedUrl = draftUrl.trim();
    let embedUrl = '';
    if (trimmedUrl) {
      embedUrl = toSafeEmbedUrl(trimmedUrl);
      if (!embedUrl) {
        setLiveFormError('Please paste a valid https:// YouTube Live or video stream URL.');
        return;
      }
    }
    onUpdateLiveConfig({
      liveUrl: trimmedUrl,
      embedUrl,
      announcementTitle: draftTitle.trim() || 'Live Tour Update from Kaiser Solzie',
      announcementBody: draftBody.trim(),
      isLiveActive: true,
      updatedAt: new Date().toISOString(),
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2400);
  };

  const handleClearLive = () => {
    stopCamera();
    setDraftUrl('');
    onUpdateLiveConfig({
      ...liveConfig,
      liveUrl: '',
      embedUrl: '',
      isLiveActive: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const activeVideo = VIDEO_PLAYLIST.find((v) => v.id === activeVideoId) ?? VIDEO_PLAYLIST[0];

  return (
    <section id="media" className="py-16 md:py-24 border-t border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
              Media Hub · Music, Video &amp; Live Dispatch
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea] mt-1">
              Listen &amp; Watch Kaiser Solzie
            </h2>
          </div>
          <p className="text-sm text-[#b5b0a4] max-w-md leading-relaxed">
            Spin acoustic tracks from <span className="text-[#f4f1ea] italic">This Ones For Friends and Family: Acoustic Tales Of Years</span>, watch official videos &amp; Warped Tour interviews, or tune in when Kaiser goes live from the rails.
          </p>
        </div>

        {/* PART 1: MUSIC PLAYER + STREAMING LINKS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-stretch">
          <div className="lg:col-span-7 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
                <div>
                  <p className="font-mono text-xs text-[#b5b0a4]">
                    This Ones For Friends and Family: Acoustic Tales Of Years
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-1">
                    {currentTrack.title}
                  </h3>
                  <p className="font-mono text-xs text-[#b5b0a4] mt-1">
                    Kaiser Solzie · {currentTrack.keyLabel} · {currentTrack.bpm} BPM · Acoustic Preview
                  </p>
                </div>
                <span className="font-mono text-xs text-[#b5b0a4] tabular-nums shrink-0">
                  {formatTime(elapsedSec)} / {formatTime(currentTrack.durationSec)}
                </span>
              </div>

              {/* Scrubber */}
              <div className="mt-5">
                <input
                  type="range"
                  min={0}
                  max={currentTrack.durationSec}
                  value={elapsedSec}
                  onChange={(e) => setElapsedSec(Number(e.target.value))}
                  aria-label="Audio playback progress"
                  className="w-full h-1.5 bg-[#2e2e2e] rounded-lg accent-[#e63946] cursor-pointer"
                />
              </div>

              {/* Transport Controls */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTrackIdx((i) => (i - 1 + ALBUM_TRACKS.length) % ALBUM_TRACKS.length);
                      setElapsedSec(0);
                    }}
                    aria-label="Previous track"
                    className="w-10 h-10 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#b5b0a4] text-[#f4f1ea] flex items-center justify-center transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="px-5 h-10 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play Preview'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTrackIdx((i) => (i + 1) % ALBUM_TRACKS.length);
                      setElapsedSec(0);
                    }}
                    aria-label="Next track"
                    className="w-10 h-10 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#b5b0a4] text-[#f4f1ea] flex items-center justify-center transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    className="p-2 text-[#b5b0a4] hover:text-[#f4f1ea] transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setIsMuted(false);
                      setVolume(Number(e.target.value));
                    }}
                    aria-label="Volume control"
                    className="w-24 accent-[#e63946] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Tracklist */}
            <div className="mt-6 pt-4 border-t border-[#2e2e2e] divide-y divide-[#2e2e2e]">
              {ALBUM_TRACKS.map((track, idx) => {
                const active = idx === activeTrackIdx;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      setActiveTrackIdx(idx);
                      setElapsedSec(0);
                      chordStepRef.current = 0;
                      setIsPlaying(true);
                    }}
                    className={`w-full py-2.5 px-2.5 flex items-center justify-between gap-3 text-left transition-colors rounded ${
                      active
                        ? 'bg-[#e63946]/15 text-[#f4f1ea]'
                        : 'text-[#b5b0a4] hover:bg-[#111111] hover:text-[#f4f1ea]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`font-mono text-xs tabular-nums w-5 ${active ? 'text-[#e63946] font-semibold' : 'text-[#b5b0a4]'}`}>
                        0{idx + 1}
                      </span>
                      <span className="text-sm font-medium truncate">{track.title}</span>
                    </div>
                    <span className="font-mono text-xs tabular-nums shrink-0">
                      {formatTime(track.durationSec)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Streaming Platforms & Full Bandcamp CTA */}
          <div className="lg:col-span-5 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#b5b0a4]">
                Official Streaming Platforms
              </p>
              <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-1">
                Stream the Full Catalog
              </h3>
              <p className="text-sm text-[#b5b0a4] mt-2 leading-relaxed">
                Listen to the complete studio recordings on Bandcamp or follow Kaiser Solzie across your favorite platform.
              </p>

              <a
                href="https://kaisersolzie.bandcamp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full px-4 py-3.5 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-sm font-semibold flex items-center justify-between gap-2 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <PlatformLogo id="bandcamp" />
                  <span>Open Full Album on Bandcamp</span>
                </span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <div className="mt-4 space-y-2.5">
                {STREAMING_PLATFORMS.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#f4f1ea]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlatformLogo id={platform.id} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#f4f1ea] truncate">{platform.name}</p>
                        <p className="text-xs text-[#b5b0a4] truncate">{platform.subtitle}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#b5b0a4] group-hover:text-[#f4f1ea] shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            <p className="mt-5 pt-4 border-t border-[#2e2e2e] font-mono text-[11px] text-[#b5b0a4]">
              kaisersolzie.bandcamp.com · kaiserskorner.com
            </p>
          </div>
        </div>

        {/* PART 2: YOUTUBE VIDEO PLAYER + LIVE / MOBILE STREAM MODE */}
        <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#f4f1ea]">
              <Radio className="w-4 h-4 text-[#e63946]" />
              <span className="font-display text-xl uppercase tracking-wide">
                Video Archive &amp; Live Rail Broadcast
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#111111] border border-[#2e2e2e] rounded-lg">
              <button
                type="button"
                onClick={() => setMode('playlist')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'playlist'
                    ? 'bg-[#2e2e2e] text-[#f4f1ea]'
                    : 'text-[#b5b0a4] hover:text-[#f4f1ea]'
                }`}
              >
                YouTube Playlist ({VIDEO_PLAYLIST.length})
              </button>
              <button
                type="button"
                onClick={() => setMode('live')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  mode === 'live'
                    ? 'bg-[#e63946] text-[#f4f1ea]'
                    : 'text-[#b5b0a4] hover:text-[#f4f1ea]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live / Mobile Stream Mode</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Main Video Viewport */}
            <div className="lg:col-span-8 bg-[#0b0b0b] flex flex-col">
              {mode === 'playlist' ? (
                <>
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      key={activeVideo.id}
                      src={activeVideo.embedUrl}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5 bg-[#161616] border-t border-[#2e2e2e] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-[#e63946] uppercase">{activeVideo.category}</p>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-0.5">
                        {activeVideo.title}
                      </h3>
                    </div>
                    <a
                      href={activeVideo.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#f4f1ea]/60 text-xs font-semibold text-[#f4f1ea] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Live Viewport */}
                  <div className="relative aspect-video w-full bg-[#0c0c0c] flex items-center justify-center overflow-hidden">
                    {cameraActive ? (
                      <video
                        ref={liveVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : liveConfig.embedUrl ? (
                      <iframe
                        key={liveConfig.embedUrl}
                        src={liveConfig.embedUrl}
                        title={liveConfig.announcementTitle}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="p-6 sm:p-10 text-center max-w-lg">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
                          Live / Mobile Broadcast Stage
                        </p>
                        <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#f4f1ea] mt-2">
                          {liveConfig.announcementTitle}
                        </h3>
                        <p className="text-sm text-[#b5b0a4] mt-3 leading-relaxed">
                          {liveConfig.announcementBody}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => void startDeviceCamera('camera')}
                            className="px-4 py-2.5 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Go Live from Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void startDeviceCamera('screen')}
                            className="px-4 py-2.5 rounded-lg bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#f4f1ea]/50 text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                          >
                            <MonitorUp className="w-4 h-4" />
                            <span>Share Screen</span>
                          </button>
                        </div>
                        {cameraError && (
                          <p className="mt-4 text-xs text-[#e63946] bg-[#e63946]/10 border border-[#e63946]/30 rounded-lg px-3 py-2">
                            {cameraError}
                          </p>
                        )}
                      </div>
                    )}

                    {(cameraActive || liveConfig.isLiveActive) && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#111111]/85 border border-[#e63946] text-[#f4f1ea] text-xs font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
                        <span>{cameraActive ? 'LIVE DEVICE CAMERA' : 'LIVE BROADCAST ACTIVE'}</span>
                      </div>
                    )}
                  </div>

                  {/* Live Broadcast / Paste URL Bar */}
                  <form
                    onSubmit={handlePublishLive}
                    className="p-5 bg-[#161616] border-t border-[#2e2e2e] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs uppercase tracking-wider text-[#f4f1ea]">
                        Mobile Stream URL or Tour Announcement Dispatch
                      </p>
                      <div className="flex items-center gap-2">
                        {cameraActive && (
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-1.5 rounded bg-[#2e2e2e] hover:bg-[#3a3a3a] text-[#f4f1ea] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                          >
                            <CameraOff className="w-3.5 h-3.5" />
                            <span>Stop Camera</span>
                          </button>
                        )}
                        {liveConfig.isLiveActive && (
                          <button
                            type="button"
                            onClick={handleClearLive}
                            className="px-3 py-1.5 rounded bg-[#111111] border border-[#2e2e2e] hover:border-[#e63946] text-[#b5b0a4] hover:text-[#f4f1ea] text-xs font-medium whitespace-nowrap shrink-0"
                          >
                            Clear Live Feed
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="live-url" className="block text-[11px] font-mono text-[#b5b0a4] mb-1">
                          Paste YouTube Live / Stream URL (Optional)
                        </label>
                        <div className="relative">
                          <Link2 className="w-3.5 h-3.5 text-[#b5b0a4] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="live-url"
                            type="url"
                            value={draftUrl}
                            onChange={(e) => setDraftUrl(e.target.value)}
                            placeholder="https://youtube.com/live/..."
                            className="w-full pl-8 pr-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/50 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="live-title" className="block text-[11px] font-mono text-[#b5b0a4] mb-1">
                          Broadcast Announcement Headline
                        </label>
                        <input
                          id="live-title"
                          type="text"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          placeholder="Live from Chicago Union Station..."
                          className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        placeholder="Quick dispatch message for fans (train status, next city set, soundcheck note)..."
                        className="flex-1 px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/50 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
                      >
                        {savedNotice ? 'Broadcast Live' : 'Push to Player'}
                      </button>
                    </div>
                    {liveFormError && <p className="text-xs text-[#e63946]">{liveFormError}</p>}
                  </form>
                </div>
              )}
            </div>

            {/* Playlist Sidebar */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#2e2e2e] bg-[#161616] flex flex-col">
              <div className="px-4 py-3 border-b border-[#2e2e2e] flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#b5b0a4]">
                  Official Video Playlist
                </span>
                <span className="font-mono text-xs text-[#b5b0a4] tabular-nums">
                  {VIDEO_PLAYLIST.length} Videos
                </span>
              </div>
              <div className="divide-y divide-[#2e2e2e]">
                {VIDEO_PLAYLIST.map((video, idx) => {
                  const selected = mode === 'playlist' && activeVideo.id === video.id;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => {
                        setActiveVideoId(video.id);
                        setMode('playlist');
                      }}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${
                        selected
                          ? 'bg-[#e63946]/15 text-[#f4f1ea]'
                          : 'hover:bg-[#1b1b1b] text-[#b5b0a4] hover:text-[#f4f1ea]'
                      }`}
                    >
                      <img
                        src={video.posterUrl}
                        alt={video.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-10 object-cover rounded shrink-0 border border-[#2e2e2e]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-mono text-[11px] ${selected ? 'text-[#e63946]' : 'text-[#b5b0a4]'}`}>
                          0{idx + 1} · {video.category}
                        </p>
                        <p className="text-xs font-semibold leading-snug text-[#f4f1ea] line-clamp-2 mt-0.5">
                          {video.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
