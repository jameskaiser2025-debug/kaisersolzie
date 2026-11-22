import React, { useEffect, useState } from 'react';
import { ArrowDown, Menu, Train, X } from 'lucide-react';
import { AdminLogisticsView } from './components/AdminLogisticsView';
import { BookingModal } from './components/BookingModal';
import { MediaHub } from './components/MediaHub';
import { ShareSection } from './components/ShareSection';
import {
  EIGHT_COLLECTOR_ITEMS,
  INITIAL_CITIES,
  INITIAL_LIVE_STREAM,
  TOUR_POSTERS,
} from './data/tourData';
import type { LiveStreamConfig, SetBooking, TourCity } from './types';

const STORAGE_KEYS = {
  cities: 'ks_10x10_cities_v1',
  bookings: 'ks_10x10_bookings_v1',
  live: 'ks_10x10_live_v1',
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [cities, setCities] = useState<TourCity[]>(() =>
    readStorage<TourCity[]>(STORAGE_KEYS.cities, INITIAL_CITIES),
  );
  const [bookings, setBookings] = useState<SetBooking[]>(() =>
    readStorage<SetBooking[]>(STORAGE_KEYS.bookings, []),
  );
  const [liveConfig, setLiveConfig] = useState<LiveStreamConfig>(() =>
    readStorage<LiveStreamConfig>(STORAGE_KEYS.live, INITIAL_LIVE_STREAM),
  );

  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>(INITIAL_CITIES[0].id);

  const heroPosters = [
    TOUR_POSTERS.comicAcoustic,
    TOUR_POSTERS.railTourPoster,
    TOUR_POSTERS.routeMap,
    TOUR_POSTERS.howToClaim,
  ];
  const [activePosterIdx, setActivePosterIdx] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.cities, JSON.stringify(cities));
    } catch {
      // Ignore storage quota errors
    }
  }, [cities]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.live, JSON.stringify(liveConfig));
    } catch {
      // Ignore storage quota errors
    }
  }, [liveConfig]);

  const openBookingForCity = (cityId: string) => {
    setSelectedCityId(cityId);
    setBookingModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleConfirmBooking = (booking: SetBooking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  const handleUpdateCity = (cityId: string, patch: Partial<TourCity>) => {
    setCities((prev) => prev.map((c) => (c.id === cityId ? { ...c, ...patch } : c)));
  };

  const handleUpdateBooking = (bookingId: string, patch: Partial<SetBooking>) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...patch } : b)));
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleResetDemoData = () => {
    setCities(INITIAL_CITIES);
    setBookings([]);
    setLiveConfig(INITIAL_LIVE_STREAM);
  };

  const totalSpotsLeft = cities.reduce((acc, c) => {
    const used = bookings.filter((b) => b.cityId === c.id).length;
    return acc + Math.max(0, c.maxSpots - used);
  }, 0);

  const navigateToSection = (sectionId: string) => {
    setViewMode('public');
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 30);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#f4f1ea] flex flex-col">
      {/* STICKY RESPONSIVE HEADER */}
      <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur-sm border-b border-[#2e2e2e]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setViewMode('public');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-2xl sm:text-[26px] font-extrabold uppercase tracking-tight text-[#f4f1ea] hover:text-[#e63946] transition-colors whitespace-nowrap shrink-0"
          >
            KAISER SOLZIE 10x10
          </a>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#b5b0a4]">
            <button
              type="button"
              onClick={() => navigateToSection('the-deal')}
              className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap shrink-0"
            >
              The Deal
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('tour-dates')}
              className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap shrink-0"
            >
              Tour Dates
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('media')}
              className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap shrink-0"
            >
              Media Hub
            </button>
            <button
              type="button"
              onClick={() => openBookingForCity(selectedCityId)}
              className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap shrink-0"
            >
              Book a Set
            </button>
          </nav>

          {/* Zone 3: Admin / Logistics Toggle + Mobile Menu Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setViewMode((m) => (m === 'public' ? 'admin' : 'public'));
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'admin'
                  ? 'bg-[#f4f1ea] text-[#111111]'
                  : 'bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea]'
              }`}
            >
              {viewMode === 'admin' ? 'Exit Admin' : 'Admin / Logistics'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              className="md:hidden w-10 h-10 rounded-lg bg-[#1b1b1b] border border-[#2e2e2e] flex items-center justify-center text-[#f4f1ea]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2e2e2e] bg-[#161616] px-4 py-3 flex flex-col gap-1">
            {[
              { label: 'The Deal', action: () => navigateToSection('the-deal') },
              { label: 'Tour Dates', action: () => navigateToSection('tour-dates') },
              { label: 'Media Hub', action: () => navigateToSection('media') },
              { label: 'Spread the Word', action: () => navigateToSection('share') },
              { label: 'Book a $10 Set', action: () => openBookingForCity(selectedCityId) },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#f4f1ea] hover:bg-[#1b1b1b] rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* LIVE DISPATCH BANNER (only when Kaiser activates live mode) */}
      {viewMode === 'public' && liveConfig.isLiveActive && (
        <div className="bg-[#e63946] text-[#f4f1ea]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold uppercase tracking-wider">Live Dispatch</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold">{liveConfig.announcementTitle}</span>
              {liveConfig.announcementBody && (
                <span className="text-[#f4f1ea]/90 hidden sm:inline">
                  — {liveConfig.announcementBody}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigateToSection('media')}
              className="font-mono underline font-semibold whitespace-nowrap shrink-0"
            >
              Open Live Player
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT OR ADMIN / LOGISTICS DASHBOARD */}
      {viewMode === 'admin' ? (
        <main className="flex-1">
          <AdminLogisticsView
            cities={cities}
            bookings={bookings}
            onUpdateCity={handleUpdateCity}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onResetDemoData={handleResetDemoData}
            onExitAdmin={() => setViewMode('public')}
          />
        </main>
      ) : (
        <main id="top" className="flex-1">
          {/* 1. HERO SECTION */}
          <section className="py-12 md:py-20">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Column: Exact Copy & CTA */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <p className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#e63946]">
                    KAISER SOLZIE PRESENTS
                  </p>

                  <h1 className="font-display text-6xl sm:text-7xl xl:text-[84px] font-extrabold uppercase tracking-tight leading-[0.94] text-[#f4f1ea] mt-3 [text-wrap:balance]">
                    10 CITIES. 10 PEOPLE. $10.
                  </h1>

                  <p className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#f4f1ea] mt-4">
                    Your spot. Your set. Yours to own.
                  </p>

                  <p className="text-base sm:text-lg text-[#b5b0a4] mt-5 max-w-[62ch] leading-relaxed">
                    No venues. No promoters. No crowd standing between you and the music. Kaiser Solzie is riding the rails across 10 cities to play 100 completely private, one-on-one acoustic sets—and for ten bucks, one of them is yours.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigateToSection('tour-dates')}
                      className="px-7 py-3.5 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-sm font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Claim Your $10 Set</span>
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToSection('media')}
                      className="px-5 py-3.5 rounded-lg bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#f4f1ea]/50 text-[#f4f1ea] text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
                    >
                      Listen &amp; Watch
                    </button>
                  </div>

                  {/* Clean Unboxed Tour Telemetry Strip */}
                  <div className="mt-10 pt-6 border-t border-[#2e2e2e] grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="font-mono text-2xl font-bold text-[#f4f1ea] tabular-nums">10</p>
                      <p className="text-xs text-[#b5b0a4] mt-0.5">Amtrak Rail Cities</p>
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold text-[#f4f1ea] tabular-nums">30 MIN</p>
                      <p className="text-xs text-[#b5b0a4] mt-0.5">Private Acoustic Set</p>
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold text-[#e63946] tabular-nums">$10</p>
                      <p className="text-xs text-[#b5b0a4] mt-0.5">Flat · Zero Fees</p>
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold text-[#f4f1ea] tabular-nums">
                        {totalSpotsLeft} / 100
                      </p>
                      <p className="text-xs text-[#b5b0a4] mt-0.5">Total Spots Open</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Official Uploaded Tour Artwork Showcase */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4">
                  <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-[#111111] border border-[#2e2e2e]">
                    <img
                      src={heroPosters[activePosterIdx].src}
                      alt={heroPosters[activePosterIdx].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-3.5 flex items-center justify-between gap-2">
                    <p className="text-xs text-[#b5b0a4] truncate">
                      {heroPosters[activePosterIdx].title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {heroPosters.map((poster, idx) => (
                        <button
                          key={poster.src}
                          type="button"
                          onClick={() => setActivePosterIdx(idx)}
                          aria-label={`View artwork ${idx + 1}: ${poster.title}`}
                          className={`w-8 h-8 rounded overflow-hidden border transition-colors ${
                            idx === activePosterIdx
                              ? 'border-[#e63946]'
                              : 'border-[#2e2e2e] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={poster.src}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="rail-track-line" aria-hidden="true" />
          </div>

          {/* 2. WHAT YOU GET FOR $10 (3-COLUMN CARD GRID) */}
          <section id="the-deal" className="py-16 md:py-24">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mb-10">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
                  The $10 Deal · No Catch
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea] mt-1">
                  What You Get for $10
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <article className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-xs text-[#e63946] mb-3">01 · LIVE PERFORMANCE</p>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea]">
                      A Private 30-Minute Acoustic Set
                    </h3>
                    <p className="text-sm text-[#b5b0a4] mt-3 leading-relaxed">
                      You pick the spot. Your living room, your front porch, a park bench, or your favorite local hangout. Kaiser shows up, plays a full 30-minute set just for you, and keeps it completely personal.
                    </p>
                  </div>
                </article>

                <article className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-xs text-[#e63946] mb-3">02 · MASTER OWNERSHIP</p>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea]">
                      1-of-1 Recording Rights
                    </h3>
                    <p className="text-sm text-[#b5b0a4] mt-3 leading-relaxed">
                      Every single set is recorded live—and the master is yours. You get 100% ownership rights to your recording. Post it, press it, sample it, sell it, or lock it in a vault. Nobody else on earth owns that performance.
                    </p>
                  </div>
                </article>

                <article className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-xs text-[#e63946] mb-3">03 · BESPOKE PACKAGE</p>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea]">
                      8 Custom Collector Items
                    </h3>
                    <p className="text-sm text-[#b5b0a4] mt-3 leading-relaxed">
                      Walk away with a bespoke 8-piece collector package built specifically for your stop on the tour. No mass-produced filler—just custom, limited-run pieces tied directly to your private show.
                    </p>
                  </div>
                </article>
              </div>

              {/* Clean Collector Pack Breakdown */}
              <div className="mt-6 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2e2e2e]">
                  <p className="font-display text-2xl font-bold uppercase tracking-tight text-[#f4f1ea]">
                    Inside Your 8-Piece Custom Collector Package
                  </p>
                  <span className="font-mono text-xs text-[#b5b0a4]">
                    Handed over on arrival day · Included in $10
                  </span>
                </div>
                <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-[#f4f1ea]">
                  {EIGHT_COLLECTOR_ITEMS.map((item, idx) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-[#e63946] tabular-nums mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span className="text-[#b5b0a4]">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* 3. HOW IT WORKS (3 NUMBERED STEPS) */}
          <section className="py-16 md:py-20 border-t border-[#2e2e2e]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mb-10">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
                  Simple &amp; Direct
                </p>
                <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea] mt-1">
                  How It Works
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6">
                  <span className="font-display text-5xl font-extrabold text-[#e63946] leading-none tabular-nums">
                    01
                  </span>
                  <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-3">
                    Pick Your City &amp; Pay $10
                  </h3>
                  <p className="text-sm text-[#b5b0a4] mt-2.5 leading-relaxed">
                    Lock in one of the 10 available spots for your city. Once all 10 are claimed, that city is sold out.
                  </p>
                </div>

                <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6">
                  <span className="font-display text-5xl font-extrabold text-[#e63946] leading-none tabular-nums">
                    02
                  </span>
                  <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-3">
                    Choose Your Location &amp; Time Window
                  </h3>
                  <p className="text-sm text-[#b5b0a4] mt-2.5 leading-relaxed">
                    Submit your preferred spot and 3 available time blocks. We’ll coordinate the daily route so Kaiser can get to you via Amtrak and local transit.
                  </p>
                </div>

                <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6">
                  <span className="font-display text-5xl font-extrabold text-[#e63946] leading-none tabular-nums">
                    03
                  </span>
                  <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-3">
                    Show Up &amp; Own the Moment
                  </h3>
                  <p className="text-sm text-[#b5b0a4] mt-2.5 leading-relaxed">
                    Sit back for 30 minutes of live, stripped-down folk-punk, grab your 8 custom collector items, and take home the rights to a recording that exists nowhere else.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. WHY THE RAILS? WHY $10? */}
          <section className="py-16 md:py-20 border-t border-[#2e2e2e]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
                    Amtrak USA Rail Pass · 10 Segments
                  </p>
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea]">
                    Why the Rails? Why $10?
                  </h2>
                  <p className="text-base sm:text-lg text-[#b5b0a4] leading-relaxed max-w-[60ch]">
                    Traditional touring is broken—bloated ticket fees, middlemen, and rooms where you can barely hear the songs. The 10x10 Tour strips it all back to an Amtrak Rail Pass, an acoustic guitar, and a direct connection between artist and listener.
                  </p>
                  <blockquote className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6">
                    <p className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#f4f1ea]">
                      “100 people. 100 unique recordings. Zero middlemen.”
                    </p>
                    <footer className="font-mono text-xs text-[#b5b0a4] mt-2">
                      — Kaiser Solzie · Coast-to-Coast Amtrak Dash
                    </footer>
                  </blockquote>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-3">
                    <img
                      src={TOUR_POSTERS.routeMap.src}
                      alt={TOUR_POSTERS.routeMap.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. TENTATIVE 10-CITY SCHEDULE & BOOKING GRID */}
          <section id="tour-dates" className="py-16 md:py-24 border-t border-[#2e2e2e]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
                    Coast-to-Coast Amtrak Rail Pass · 10 Stops
                  </p>
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea] mt-1">
                    Tentative 10-City Schedule
                  </h2>
                </div>
                <p className="text-sm text-[#b5b0a4] max-w-md leading-relaxed">
                  Dates remain marked <span className="text-[#f4f1ea] font-mono">TBA / Pending</span> until each Amtrak Rail Pass segment is confirmed in the coordinator backend. Claim your $10 spot early—each city caps strictly at 10 people.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {cities.map((city) => {
                  const booked = bookings.filter((b) => b.cityId === city.id).length;
                  const spotsLeft = Math.max(0, city.maxSpots - booked);
                  const soldOut = spotsLeft === 0;
                  const isConfirmed = city.status === 'confirmed';

                  return (
                    <div
                      key={city.id}
                      className="bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#b5b0a4]/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                          <span className="text-[#b5b0a4] tabular-nums">
                            STOP {city.segmentNumber.toString().padStart(2, '0')}
                          </span>
                          <span aria-hidden="true" className="text-[#2e2e2e]">
                            /
                          </span>
                          <span
                            className={
                              isConfirmed
                                ? 'text-emerald-400 font-semibold uppercase'
                                : 'text-[#e63946] font-semibold uppercase'
                            }
                          >
                            {isConfirmed ? `Confirmed · ${city.dateText}` : 'TBA / Pending'}
                          </span>
                          <span aria-hidden="true" className="text-[#2e2e2e]">
                            /
                          </span>
                          <span className="text-[#b5b0a4] tabular-nums">
                            {spotsLeft} / {city.maxSpots} Spots Left
                          </span>
                        </div>

                        <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] truncate">
                          {city.name}, {city.state}
                        </h3>

                        <p className="text-xs text-[#b5b0a4] flex items-center gap-1.5 truncate">
                          <Train className="w-3.5 h-3.5 text-[#b5b0a4] shrink-0" />
                          <span className="truncate">
                            {city.amtrakStation} ({city.stationCode}) · {city.arrivalTime}–{city.departureTime}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          disabled={soldOut}
                          onClick={() => openBookingForCity(city.id)}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                            soldOut
                              ? 'bg-[#111111] border border-[#2e2e2e] text-[#b5b0a4] cursor-not-allowed'
                              : 'bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea]'
                          }`}
                        >
                          {soldOut ? 'City Sold Out' : 'Book $10 Set'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Orlando Finale Callout */}
              <div className="mt-6 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase text-[#e63946]">
                    Tour Finale Gathering · Tentative
                  </p>
                  <p className="font-display text-2xl font-bold uppercase text-[#f4f1ea] mt-0.5">
                    Orlando, FL — Friends &amp; Family of Vans Warped Tour
                  </p>
                </div>
                <span className="font-mono text-xs text-[#b5b0a4] shrink-0">
                  Following Stop 10 · Exact Date TBA
                </span>
              </div>
            </div>
          </section>

          {/* 6. MEDIA HUB (MUSIC + VIDEO + LIVE STREAM) */}
          <MediaHub liveConfig={liveConfig} onUpdateLiveConfig={setLiveConfig} />

          {/* 7. SOCIAL SHARE CTA SECTION */}
          <ShareSection cities={cities} />
        </main>
      )}

      {/* QUIET FOOTER */}
      <footer className="border-t border-[#2e2e2e] bg-[#111111] py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#b5b0a4]">
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-tight text-[#f4f1ea]">
              KAISER SOLZIE 10x10 TOUR
            </p>
            <p className="mt-1">
              10 Cities · 10 People · $10 · Coast-to-Coast Amtrak Rail Pass Acoustic Run
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://kaisersolzie.bandcamp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f4f1ea] transition-colors"
            >
              Bandcamp
            </a>
            <button
              type="button"
              onClick={() => navigateToSection('tour-dates')}
              className="hover:text-[#f4f1ea] transition-colors"
            >
              Tour Dates
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('media')}
              className="hover:text-[#f4f1ea] transition-colors"
            >
              Media Hub
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#f4f1ea] transition-colors"
            >
              Admin / Logistics
            </button>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        cities={cities}
        bookings={bookings}
        initialCityId={selectedCityId}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
}
