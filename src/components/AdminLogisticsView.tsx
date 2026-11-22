import React, { useMemo, useState } from 'react';
import {
  CalendarCheck,
  Check,
  MapPin,
  RotateCcw,
  Train,
  Trash2,
  Users,
} from 'lucide-react';
import { TIME_BLOCK_CHOICES } from '../data/tourData';
import type { SetBooking, TourCity, TransitMode } from '../types';

interface AdminLogisticsViewProps {
  cities: TourCity[];
  bookings: SetBooking[];
  onUpdateCity: (cityId: string, patch: Partial<TourCity>) => void;
  onUpdateBooking: (bookingId: string, patch: Partial<SetBooking>) => void;
  onDeleteBooking: (bookingId: string) => void;
  onResetDemoData: () => void;
  onExitAdmin: () => void;
}

const TRANSIT_MODES: TransitMode[] = [
  'Train Station',
  'Walk',
  'Public Transit',
  'Rideshare',
  'Host Pickup',
];

export function AdminLogisticsView({
  cities,
  bookings,
  onUpdateCity,
  onUpdateBooking,
  onDeleteBooking,
  onResetDemoData,
  onExitAdmin,
}: AdminLogisticsViewProps) {
  const [activeTab, setActiveTab] = useState<'cities' | 'bookings' | 'itinerary'>('cities');
  const [filterCityId, setFilterCityId] = useState<string>('all');
  const [itineraryCityId, setItineraryCityId] = useState<string>(cities[0]?.id ?? 'nyc');

  const stats = useMemo(() => {
    const confirmedCities = cities.filter((c) => c.status === 'confirmed').length;
    const segmentsBooked = cities.filter((c) => c.railPassBooked).length;
    const setRevenue = bookings.length * 10;
    const railAddonRevenue = bookings.reduce((sum, b) => sum + b.railPassAddonUsd, 0);
    return { confirmedCities, segmentsBooked, setRevenue, railAddonRevenue };
  }, [cities, bookings]);

  const filteredBookings = useMemo(() => {
    if (filterCityId === 'all') return bookings;
    return bookings.filter((b) => b.cityId === filterCityId);
  }, [bookings, filterCityId]);

  const itineraryCity = cities.find((c) => c.id === itineraryCityId) ?? cities[0];
  const itineraryStops = useMemo(() => {
    return bookings
      .filter((b) => b.cityId === itineraryCity.id)
      .slice()
      .sort((a, b) => (a.stopOrder ?? 99) - (b.stopOrder ?? 99));
  }, [bookings, itineraryCity.id]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#f4f1ea] py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Coordinator Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#2e2e2e]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
              Kaiser Solzie 10x10 · Tour Operations
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea] mt-1">
              Admin &amp; Amtrak Logistics Dashboard
            </h1>
            <p className="text-sm text-[#b5b0a4] mt-1">
              Confirm tentative dates, lock patron time blocks, and sequence station-to-set ground routing across all 10 cities. All edits persist automatically in localStorage.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onResetDemoData}
              className="px-3.5 py-2 rounded-lg bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#e63946] text-xs font-medium text-[#b5b0a4] hover:text-[#f4f1ea] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Local Data</span>
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
            >
              Back to Public Site
            </button>
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#b5b0a4]">Confirmed Cities</p>
            <p className="font-mono text-2xl font-bold text-[#f4f1ea] tabular-nums mt-1">
              {stats.confirmedCities} / {cities.length}
            </p>
          </div>
          <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#b5b0a4]">Booked Sets</p>
            <p className="font-mono text-2xl font-bold text-[#f4f1ea] tabular-nums mt-1">
              {bookings.length} / 100
            </p>
          </div>
          <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#b5b0a4]">Rail Pass Segments</p>
            <p className="font-mono text-2xl font-bold text-[#f4f1ea] tabular-nums mt-1">
              {stats.segmentsBooked} / 10 Booked
            </p>
          </div>
          <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#b5b0a4]">Sets + Rail Boost</p>
            <p className="font-mono text-2xl font-bold text-[#e63946] tabular-nums mt-1">
              ${stats.setRevenue + stats.railAddonRevenue}
            </p>
            <p className="font-mono text-[11px] text-[#b5b0a4] tabular-nums mt-0.5">
              ${stats.setRevenue} sets · ${stats.railAddonRevenue} rail
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1b1b1b] border border-[#2e2e2e] rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'cities'
                ? 'bg-[#e63946] text-[#f4f1ea]'
                : 'text-[#b5b0a4] hover:text-[#f4f1ea]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>City &amp; Date Manager</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-[#e63946] text-[#f4f1ea]'
                : 'text-[#b5b0a4] hover:text-[#f4f1ea]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bookings &amp; Patrons ({bookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'itinerary'
                ? 'bg-[#e63946] text-[#f4f1ea]'
                : 'text-[#b5b0a4] hover:text-[#f4f1ea]'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Amtrak &amp; Ground Itinerary</span>
          </button>
        </div>

        {/* TAB 1: CITY & DATE MANAGER */}
        {activeTab === 'cities' && (
          <div className="space-y-4">
            {cities.map((city) => {
              const cityBookedCount = bookings.filter((b) => b.cityId === city.id).length;
              return (
                <div
                  key={city.id}
                  className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2e2e2e]">
                    <div>
                      <p className="font-mono text-xs text-[#b5b0a4]">
                        Segment {city.segmentNumber} of 10 · {city.stationCode} · {cityBookedCount} / {city.maxSpots} Booked
                      </p>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#f4f1ea]">
                        {city.name}, {city.state}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCity(city.id, {
                            status: city.status === 'confirmed' ? 'pending' : 'confirmed',
                            dateText:
                              city.status === 'pending' && city.dateText === 'TBA'
                                ? 'Nov 2026'
                                : city.dateText,
                          })
                        }
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0 ${
                          city.status === 'confirmed'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#111111] border-[#2e2e2e] text-[#b5b0a4] hover:border-[#e63946] hover:text-[#f4f1ea]'
                        }`}
                      >
                        {city.status === 'confirmed' ? 'Status: Confirmed' : 'Status: Pending / TBA'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateCity(city.id, { railPassBooked: !city.railPassBooked })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                          city.railPassBooked
                            ? 'bg-[#e63946]/15 border-[#e63946] text-[#f4f1ea]'
                            : 'bg-[#111111] border-[#2e2e2e] text-[#b5b0a4] hover:text-[#f4f1ea]'
                        }`}
                      >
                        <Train className="w-3.5 h-3.5" />
                        <span>{city.railPassBooked ? 'Rail Segment Locked' : 'Mark Rail Booked'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                        Tour Date (or TBA)
                      </label>
                      <input
                        type="text"
                        value={city.dateText}
                        onChange={(e) => onUpdateCity(city.id, { dateText: e.target.value })}
                        placeholder="e.g., Nov 2, 2026"
                        className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                        Amtrak Station
                      </label>
                      <input
                        type="text"
                        value={city.amtrakStation}
                        onChange={(e) => onUpdateCity(city.id, { amtrakStation: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                        Amtrak Train / Leg
                      </label>
                      <input
                        type="text"
                        value={city.trainNumber}
                        onChange={(e) => onUpdateCity(city.id, { trainNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                        Arrival Time
                      </label>
                      <input
                        type="text"
                        value={city.arrivalTime}
                        onChange={(e) => onUpdateCity(city.id, { arrivalTime: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                        Departure Time
                      </label>
                      <input
                        type="text"
                        value={city.departureTime}
                        onChange={(e) => onUpdateCity(city.id, { departureTime: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none font-mono tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                      On-the-Ground Transit Notes
                    </label>
                    <input
                      type="text"
                      value={city.transitNotes}
                      onChange={(e) => onUpdateCity(city.id, { transitNotes: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: BOOKINGS & PATRON COORDINATOR */}
        {activeTab === 'bookings' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <label htmlFor="filter-city" className="font-mono text-xs uppercase text-[#b5b0a4]">
                  Filter by City
                </label>
                <select
                  id="filter-city"
                  value={filterCityId}
                  onChange={(e) => setFilterCityId(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] rounded-lg text-[#f4f1ea] focus:outline-none focus:border-[#e63946]"
                >
                  <option value="all">All Cities ({bookings.length})</option>
                  {cities.map((c) => {
                    const count = bookings.filter((b) => b.cityId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.state} ({count} / {c.maxSpots})
                      </option>
                    );
                  })}
                </select>
              </div>
              <p className="font-mono text-xs text-[#b5b0a4]">
                Showing {filteredBookings.length} patron booking{filteredBookings.length === 1 ? '' : 's'}
              </p>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-10 text-center">
                <Users className="w-8 h-8 text-[#b5b0a4] mx-auto mb-3" />
                <h3 className="font-display text-2xl font-bold uppercase text-[#f4f1ea]">
                  No Bookings in This View Yet
                </h3>
                <p className="text-sm text-[#b5b0a4] mt-1 max-w-md mx-auto">
                  When fans claim a $10 set from the public tour schedule, their location, 3 preferred time blocks, and receipt code appear right here for scheduling.
                </p>
                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="mt-5 px-4 py-2 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider"
                >
                  Go to Public Schedule
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#2e2e2e]">
                      <div>
                        <p className="font-mono text-xs text-[#e63946]">
                          {booking.receiptCode} · {booking.cityName} · Paid ${booking.totalUsd}
                        </p>
                        <h3 className="font-display text-2xl font-bold uppercase text-[#f4f1ea] mt-0.5">
                          {booking.buyerName}
                        </h3>
                        <p className="text-xs text-[#b5b0a4]">{booking.buyerEmail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteBooking(booking.id)}
                        aria-label={`Remove booking for ${booking.buyerName}`}
                        className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#e63946] text-xs text-[#b5b0a4] hover:text-[#e63946] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Location & 3 Preferences */}
                      <div className="lg:col-span-5 space-y-2.5">
                        <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-3">
                          <p className="font-mono text-[11px] uppercase text-[#b5b0a4] flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#e63946]" />
                            <span>Desired Spot ({booking.settingType})</span>
                          </p>
                          <p className="text-sm text-[#f4f1ea] mt-1">{booking.locationDetails}</p>
                          {booking.notes && (
                            <p className="text-xs text-[#b5b0a4] mt-1.5 pt-1.5 border-t border-[#2e2e2e]">
                              Notes: {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-3">
                          <p className="font-mono text-[11px] uppercase text-[#b5b0a4] mb-1.5">
                            Buyer’s 3 Preferred Time Blocks
                          </p>
                          <ul className="space-y-1 text-xs font-mono text-[#f4f1ea]">
                            {booking.preferredTimeBlocks.map((blk, idx) => (
                              <li key={blk} className="flex items-center justify-between gap-2">
                                <span>
                                  0{idx + 1}. {blk}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateBooking(booking.id, { confirmedTimeBlock: blk })}
                                  className="text-[11px] text-[#e63946] hover:underline whitespace-nowrap shrink-0"
                                >
                                  Lock In
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Scheduling & Transit Controls */}
                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                        <div className="sm:col-span-2">
                          <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                            Final Confirmed Set Time
                          </label>
                          <select
                            value={booking.confirmedTimeBlock}
                            onChange={(e) =>
                              onUpdateBooking(booking.id, { confirmedTimeBlock: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
                          >
                            <option value="">-- Select Confirmed Slot --</option>
                            {booking.preferredTimeBlocks.map((blk) => (
                              <option key={blk} value={blk}>
                                Preferred: {blk}
                              </option>
                            ))}
                            {TIME_BLOCK_CHOICES.filter(
                              (opt) => !booking.preferredTimeBlocks.includes(opt),
                            ).map((opt) => (
                              <option key={opt} value={opt}>
                                Other: {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                            Daily Route Stop # (1–10)
                          </label>
                          <select
                            value={booking.stopOrder ?? ''}
                            onChange={(e) =>
                              onUpdateBooking(booking.id, {
                                stopOrder: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="w-full px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none font-mono"
                          >
                            <option value="">Unassigned</option>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                Stop #{n}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-mono text-[11px] text-[#b5b0a4] mb-1">
                            Local Transit Mode &amp; Mins
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={booking.transitMode}
                              onChange={(e) =>
                                onUpdateBooking(booking.id, {
                                  transitMode: e.target.value as TransitMode,
                                })
                              }
                              className="flex-1 px-2.5 py-2 text-xs bg-[#111111] border border-[#2e2e2e] rounded-lg text-[#f4f1ea] focus:outline-none"
                            >
                              {TRANSIT_MODES.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={0}
                              max={180}
                              value={booking.transitMinutes}
                              onChange={(e) =>
                                onUpdateBooking(booking.id, {
                                  transitMinutes: Math.max(0, Number(e.target.value)),
                                })
                              }
                              aria-label="Transit minutes"
                              className="w-16 px-2 py-2 text-xs bg-[#111111] border border-[#2e2e2e] rounded-lg text-[#f4f1ea] font-mono tabular-nums text-center focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBooking(booking.id, {
                                collectorPackReady: !booking.collectorPackReady,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                              booking.collectorPackReady
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-[#111111] border-[#2e2e2e] text-[#b5b0a4]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>8 Collector Items Packed</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBooking(booking.id, {
                                masterDelivered: !booking.masterDelivered,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                              booking.masterDelivered
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-[#111111] border-[#2e2e2e] text-[#b5b0a4]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>1-of-1 Master Delivered</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AMTRAK RAIL PASS & ON-THE-GROUND ITINERARY */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* City Picker */}
            <div className="lg:col-span-4 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl overflow-hidden h-fit">
              <div className="px-4 py-3 border-b border-[#2e2e2e]">
                <p className="font-mono text-xs uppercase tracking-wider text-[#b5b0a4]">
                  Amtrak USA Rail Pass Segments (1–10)
                </p>
              </div>
              <div className="divide-y divide-[#2e2e2e]">
                {cities.map((c) => {
                  const active = c.id === itineraryCity.id;
                  const count = bookings.filter((b) => b.cityId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setItineraryCityId(c.id)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors ${
                        active ? 'bg-[#e63946]/15 text-[#f4f1ea]' : 'hover:bg-[#111111] text-[#b5b0a4]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] text-[#e63946]">
                          Leg {c.segmentNumber} · {c.stationCode} · {c.railPassBooked ? 'Pass Locked' : 'Unbooked'}
                        </p>
                        <p className="text-sm font-semibold text-[#f4f1ea] truncate">
                          {c.name}, {c.state}
                        </p>
                      </div>
                      <span className="font-mono text-xs tabular-nums shrink-0">{count}/10</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sequenced Day Sheet */}
            <div className="lg:col-span-8 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
                <div>
                  <p className="font-mono text-xs uppercase text-[#e63946]">
                    Rail Pass Segment #{itineraryCity.segmentNumber} · {itineraryCity.status === 'confirmed' ? itineraryCity.dateText : 'TBA / Pending'}
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#f4f1ea] mt-0.5">
                    {itineraryCity.name}, {itineraryCity.state} — Day Sheet
                  </h2>
                  <p className="text-xs text-[#b5b0a4] mt-1">
                    {itineraryCity.amtrakStation} ({itineraryCity.stationCode}) · {itineraryCity.trainNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCity(itineraryCity.id, {
                      railPassBooked: !itineraryCity.railPassBooked,
                    })
                  }
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                    itineraryCity.railPassBooked
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#111111] border-[#2e2e2e] text-[#f4f1ea] hover:border-[#e63946]'
                  }`}
                >
                  {itineraryCity.railPassBooked ? 'Segment Booked on Rail Pass' : 'Mark Rail Pass Segment Booked'}
                </button>
              </div>

              {/* Station Arrival Banner */}
              <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Train className="w-5 h-5 text-[#e63946] shrink-0" />
                  <div>
                    <p className="font-mono text-xs uppercase text-[#e63946]">Amtrak Arrival</p>
                    <p className="text-sm font-semibold text-[#f4f1ea]">
                      {itineraryCity.amtrakStation} ({itineraryCity.stationCode})
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-[#f4f1ea] tabular-nums">
                  {itineraryCity.arrivalTime}
                </span>
              </div>

              {/* Ground Transit Note */}
              <p className="text-xs text-[#b5b0a4] leading-relaxed">
                <strong className="text-[#f4f1ea]">City Routing Note:</strong> {itineraryCity.transitNotes}
              </p>

              {/* Sequenced Stops */}
              {itineraryStops.length === 0 ? (
                <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-6 text-center text-sm text-[#b5b0a4]">
                  No sets booked in {itineraryCity.name} yet. Once patrons book, their stops will sequence here between Amtrak arrival and departure.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {itineraryStops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="font-mono text-xs text-[#e63946]">
                          Stop #{stop.stopOrder ?? idx + 1} · {stop.confirmedTimeBlock || `Pref 1: ${stop.preferredTimeBlocks[0]}`}
                        </p>
                        <p className="text-sm font-semibold text-[#f4f1ea]">
                          {stop.buyerName} — {stop.settingType}
                        </p>
                        <p className="text-xs text-[#b5b0a4]">{stop.locationDetails}</p>
                      </div>
                      <div className="text-left sm:text-right font-mono text-xs text-[#b5b0a4] shrink-0">
                        <p className="text-[#f4f1ea]">{stop.transitMode}</p>
                        <p className="tabular-nums">~{stop.transitMinutes} min hop</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Station Departure Banner */}
              <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Train className="w-5 h-5 text-[#b5b0a4] shrink-0" />
                  <div>
                    <p className="font-mono text-xs uppercase text-[#b5b0a4]">Amtrak Outbound Departure</p>
                    <p className="text-sm font-semibold text-[#f4f1ea]">
                      {itineraryCity.trainNumber} from {itineraryCity.stationCode}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-[#f4f1ea] tabular-nums">
                  {itineraryCity.departureTime}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
