import React, { useEffect, useState } from 'react';
import { Anchor, Check, Copy, MapPin, Train, X } from 'lucide-react';
import { getCityAnchorState, SETTING_OPTIONS, TIME_BLOCK_CHOICES } from '../data/tourData';
import type { SetBooking, TourCity } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: TourCity[];
  bookings: SetBooking[];
  initialCityId: string;
  onConfirmBooking: (booking: SetBooking) => void;
}

const RAIL_ADDONS = [
  { amount: 0, label: '$0 — Set Only ($10 total)' },
  { amount: 5, label: '+$5 — Local Transit Boost ($15 total)' },
  { amount: 10, label: '+$10 — Amtrak Rail Pass Sponsor ($20 total)' },
  { amount: 25, label: '+$25 — Full City-Leg Patron ($35 total)' },
] as const;

export function BookingModal({
  isOpen,
  onClose,
  cities,
  bookings,
  initialCityId,
  onConfirmBooking,
}: BookingModalProps) {
  const [cityId, setCityId] = useState(initialCityId || cities[0]?.id || 'nyc');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [settingType, setSettingType] = useState<string>(SETTING_OPTIONS[0]);
  const [locationDetails, setLocationDetails] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([
    TIME_BLOCK_CHOICES[0],
    TIME_BLOCK_CHOICES[1],
    TIME_BLOCK_CHOICES[3],
  ]);
  const [railPassAddonUsd, setRailPassAddonUsd] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<SetBooking | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCityId) {
      setCityId(initialCityId);
    }
  }, [initialCityId]);

  if (!isOpen) return null;

  const selectedCity = cities.find((c) => c.id === cityId) ?? cities[0];
  const bookedForCity = bookings.filter((b) => b.cityId === selectedCity.id).length;
  const spotsLeft = Math.max(0, selectedCity.maxSpots - bookedForCity);
  const nextSlotNumber = bookedForCity + 1;
  const isAnchorSlot = nextSlotNumber <= 3 && spotsLeft > 0;
  const anchorState = getCityAnchorState(selectedCity, bookedForCity);
  const totalUsd = 10 + railPassAddonUsd;

  const toggleTimeBlock = (block: string) => {
    setErrorMsg(null);
    setSelectedBlocks((prev) => {
      if (prev.includes(block)) {
        return prev.filter((item) => item !== block);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), block];
      }
      return [...prev, block];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = buyerName.trim();
    const cleanEmail = buyerEmail.trim();
    const cleanLoc = locationDetails.trim();

    if (spotsLeft <= 0) {
      setErrorMsg(`${selectedCity.name} is sold out (10/10 spots claimed). Try another city!`);
      return;
    }
    if (cleanName.length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (cleanLoc.length < 4) {
      setErrorMsg('Please enter your desired address, neighborhood, or spot details.');
      return;
    }
    if (selectedBlocks.length !== 3) {
      setErrorMsg('Please select exactly 3 preferred time blocks so Kaiser can route the day.');
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newBooking: SetBooking = {
      id: `bk-${Date.now()}-${randomCode}`,
      receiptCode: `KS10-${selectedCity.stationCode}-${randomCode}`,
      cityId: selectedCity.id,
      cityName: `${selectedCity.name}, ${selectedCity.state}`,
      buyerName: cleanName,
      buyerEmail: cleanEmail,
      settingType,
      locationDetails: cleanLoc,
      preferredTimeBlocks: [selectedBlocks[0], selectedBlocks[1], selectedBlocks[2]],
      confirmedTimeBlock: '',
      stopOrder: bookedForCity + 1 <= 10 ? bookedForCity + 1 : null,
      transitMode: 'Rideshare',
      transitMinutes: 20,
      railPassAddonUsd,
      totalUsd,
      collectorPackReady: false,
      masterDelivered: false,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(newBooking);
    setConfirmedReceipt(newBooking);
  };

  const handleClose = () => {
    setConfirmedReceipt(null);
    setErrorMsg(null);
    setBuyerName('');
    setBuyerEmail('');
    setLocationDetails('');
    setNotes('');
    setRailPassAddonUsd(0);
    onClose();
  };

  const copyReceipt = async () => {
    if (!confirmedReceipt) return;
    try {
      await navigator.clipboard.writeText(
        `Kaiser Solzie 10x10 Tour Receipt ${confirmedReceipt.receiptCode} — ${confirmedReceipt.cityName} (${confirmedReceipt.settingType}) — $${confirmedReceipt.totalUsd}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-dialog-heading"
    >
      <div className="w-full max-w-xl bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl overflow-hidden my-6 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 bg-[#111111] border-b border-[#2e2e2e] flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#e63946]">
              Kaiser Solzie 10x10 Tour · $10 Private Set
            </p>
            <h2
              id="booking-dialog-heading"
              className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#f4f1ea]"
            >
              {confirmedReceipt ? 'Spot Claimed — Receipt Ready' : 'Claim Your $10 Set'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-lg bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#f4f1ea]/50 text-[#f4f1ea] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedReceipt ? (
          <div className="p-6 space-y-5">
            <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#2e2e2e]">
                <div>
                  <p className="font-mono text-xs text-[#b5b0a4]">Confirmation Code</p>
                  <p className="font-mono text-2xl font-bold text-[#e63946] tabular-nums mt-0.5">
                    {confirmedReceipt.receiptCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyReceipt()}
                  className="px-3.5 py-2 rounded-lg bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#f4f1ea]/50 text-xs font-semibold text-[#f4f1ea] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Receipt'}</span>
                </button>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-[#b5b0a4]">Patron</dt>
                  <dd className="font-semibold text-[#f4f1ea]">{confirmedReceipt.buyerName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#b5b0a4]">City Stop</dt>
                  <dd className="font-semibold text-[#f4f1ea]">{confirmedReceipt.cityName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#b5b0a4]">Chosen Spot</dt>
                  <dd className="font-semibold text-[#f4f1ea]">
                    {confirmedReceipt.settingType} — {confirmedReceipt.locationDetails}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#b5b0a4]">Total Paid</dt>
                  <dd className="font-mono font-bold text-[#f4f1ea] tabular-nums">
                    ${confirmedReceipt.totalUsd}
                    {confirmedReceipt.railPassAddonUsd > 0 && ` ($10 set + $${confirmedReceipt.railPassAddonUsd} Rail Pass)`}
                  </dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-[#2e2e2e]">
                <p className="font-mono text-xs text-[#b5b0a4] mb-1.5">Your 3 Preferred Time Blocks</p>
                <ul className="space-y-1 text-xs font-mono text-[#f4f1ea]">
                  {confirmedReceipt.preferredTimeBlocks.map((blk, i) => (
                    <li key={blk}>
                      0{i + 1}. {blk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-xs text-[#b5b0a4] leading-relaxed">
              Your set is locked into Kaiser’s <span className="text-[#f4f1ea] font-medium">Admin / Logistics</span> coordinator. Once 3 anchor hits are logged for {confirmedReceipt.cityName}, Kaiser locks the city date and neighborhood transit zone.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Back to Tour Page
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#e63946]/15 border border-[#e63946]/40 text-xs text-[#f4f1ea]">
                {errorMsg}
              </div>
            )}

            {/* City Selector */}
            <div>
              <label htmlFor="bk-city" className="block text-xs font-mono uppercase tracking-wider text-[#b5b0a4] mb-1.5">
                Tour City
              </label>
              <select
                id="bk-city"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
              >
                {cities.map((c) => {
                  const used = bookings.filter((b) => b.cityId === c.id).length;
                  const left = Math.max(0, c.maxSpots - used);
                  const state = getCityAnchorState(c, used);
                  return (
                    <option key={c.id} value={c.id} disabled={left === 0}>
                      {c.name}, {c.state} · {state.label} · {left} / {c.maxSpots} Spots Left
                    </option>
                  );
                })}
              </select>
              <p className="mt-1.5 font-mono text-[11px] text-[#b5b0a4]">
                Amtrak Hub: {selectedCity.amtrakStation} ({selectedCity.stationCode}) · {spotsLeft} / {selectedCity.maxSpots} Spots Left
              </p>
            </div>

            {/* 3-Hit Anchor Slot OR Locked Transit Zone Notice */}
            {spotsLeft > 0 && isAnchorSlot ? (
              <div className="bg-[#e63946]/12 border border-[#e63946]/50 rounded-lg p-3.5 flex items-start gap-3">
                <Anchor className="w-4 h-4 text-[#e63946] shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#e63946]">
                    ANCHOR SLOT #{nextSlotNumber} OF 3
                  </p>
                  <p className="text-xs text-[#f4f1ea] mt-0.5 leading-relaxed">
                    Your location &amp; availability help set the city&apos;s date and route.
                  </p>
                </div>
              </div>
            ) : spotsLeft > 0 ? (
              <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-3.5 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {anchorState.stage === 'confirmed'
                      ? `CONFIRMED DATE: ${selectedCity.dateText}`
                      : '3 ANCHOR HITS REACHED — ROUTING IN PROGRESS'}
                  </p>
                  {selectedCity.transitZone ? (
                    <p className="text-xs text-[#f4f1ea] leading-relaxed">
                      Locked Transit Zone: <span className="font-semibold text-emerald-300">{selectedCity.transitZone}</span>. Please pick a set spot within or near this area so Kaiser can move cleanly between stops.
                    </p>
                  ) : (
                    <p className="text-xs text-[#b5b0a4] leading-relaxed">
                      All 3 anchor slots are claimed! Kaiser is locking the exact date and active neighborhood transit zone—submit your spot and 3 time blocks to join slots #4–#10.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="bk-name" className="block text-xs font-mono uppercase tracking-wider text-[#b5b0a4] mb-1.5">
                  Full Name *
                </label>
                <input
                  id="bk-name"
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3 py-2.5 text-sm bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/45 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="bk-email" className="block text-xs font-mono uppercase tracking-wider text-[#b5b0a4] mb-1.5">
                  Email *
                </label>
                <input
                  id="bk-email"
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2.5 text-sm bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/45 focus:outline-none"
                />
              </div>
            </div>

            {/* Desired Set Location */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-5">
                <label htmlFor="bk-setting" className="block text-xs font-mono uppercase tracking-wider text-[#b5b0a4] mb-1.5">
                  Spot Type *
                </label>
                <select
                  id="bk-setting"
                  value={settingType}
                  onChange={(e) => setSettingType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
                >
                  {SETTING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-7">
                <label htmlFor="bk-location" className="block text-xs font-mono uppercase tracking-wider text-[#b5b0a4] mb-1.5">
                  Address / Neighborhood &amp; Notes *
                </label>
                <input
                  id="bk-location"
                  type="text"
                  required
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g., Front porch in East Austin, 5 min from train"
                  className="w-full px-3 py-2.5 text-sm bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/45 focus:outline-none"
                />
              </div>
            </div>

            {/* 3 Preferred Time Blocks */}
            <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#f4f1ea]">
                  Select 3 Preferred Time Blocks *
                </span>
                <span className="font-mono text-xs text-[#e63946] tabular-nums">
                  {selectedBlocks.length} / 3 Selected
                </span>
              </div>
              <p className="text-xs text-[#b5b0a4] mb-3">
                Pick 3 windows that work for you so Kaiser can coordinate Amtrak arrival and local transit across all 10 stops.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIME_BLOCK_CHOICES.map((block) => {
                  const active = selectedBlocks.includes(block);
                  return (
                    <button
                      key={block}
                      type="button"
                      onClick={() => toggleTimeBlock(block)}
                      className={`text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-[#e63946]/15 border-[#e63946] text-[#f4f1ea]'
                          : 'bg-[#1b1b1b] border-[#2e2e2e] text-[#b5b0a4] hover:border-[#b5b0a4]/50'
                      }`}
                    >
                      <span>{block}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[#e63946] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Amtrak Rail Pass Add-On */}
            <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-4">
              <label htmlFor="bk-rail-addon" className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#f4f1ea] mb-2">
                <Train className="w-3.5 h-3.5 text-[#e63946]" />
                <span>Optional Amtrak Rail Pass Coordination Boost</span>
              </label>
              <select
                id="bk-rail-addon"
                value={railPassAddonUsd}
                onChange={(e) => setRailPassAddonUsd(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#1b1b1b] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
              >
                {RAIL_ADDONS.map((tier) => (
                  <option key={tier.amount} value={tier.amount}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Song / Collector Notes */}
            <div>
              <label htmlFor="bk-notes" className="block text-xs font-mono uppercase tracking-wider text-[#b5b0a4] mb-1.5">
                T-Shirt Size / Song Request / Special Notes (Optional)
              </label>
              <input
                id="bk-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Shirt size L, would love to hear Pirate Song!"
                className="w-full px-3 py-2 text-sm bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] placeholder-[#b5b0a4]/45 focus:outline-none"
              />
            </div>

            {/* Checkout Action */}
            <div className="pt-3 border-t border-[#2e2e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#b5b0a4]">Includes 30-min set + 1-of-1 master rights + 8 custom items</p>
              </div>
              <button
                type="submit"
                disabled={spotsLeft <= 0}
                className="px-5 py-3 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] disabled:opacity-45 text-[#f4f1ea] text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap shrink-0"
              >
                ${totalUsd} — Confirm &amp; Claim Set
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
