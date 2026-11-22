import React, { useState } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { TOUR_POSTERS } from '../data/tourData';
import type { TourCity } from '../types';

interface ShareSectionProps {
  cities: TourCity[];
}

export function ShareSection({ cities }: ShareSectionProps) {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [nativeFeedback, setNativeFeedback] = useState<string | null>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://kaiserskorner.com';
  const cityLabel =
    selectedCity === 'all'
      ? '10 US cities'
      : cities.find((c) => c.id === selectedCity)?.name ?? 'your city';

  const hypeText = `Kaiser Solzie is riding the rails across ${cityLabel} for the 10x10 Tour: 10 cities, 10 private 30-minute acoustic sets per city, $10 flat—including 1-of-1 master recording rights and 8 custom collector items. Zero middlemen. Claim your spot:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setNativeFeedback('Copy the URL from your browser bar to share!');
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(`${hypeText} ${shareUrl}`);
      setCopiedCaption(true);
      window.setTimeout(() => setCopiedCaption(false), 2200);
    } catch {
      setNativeFeedback('Highlight the caption above to copy.');
    }
  };

  const handleNativeShare = async () => {
    setNativeFeedback(null);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Kaiser Solzie — 10x10 Tour | 10 Cities. 10 People. $10.',
          text: hypeText,
          url: shareUrl,
        });
        return;
      } catch {
        // User dismissed native sheet
        return;
      }
    }
    await handleCopyCaption();
    setNativeFeedback('Share sheet unavailable on desktop — hype post + link copied to clipboard!');
    window.setTimeout(() => setNativeFeedback(null), 3000);
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(hypeText)}&url=${encodeURIComponent(shareUrl)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(hypeText)}`;

  const flyers = [
    TOUR_POSTERS.comicAcoustic,
    TOUR_POSTERS.routeMap,
    TOUR_POSTERS.railTourPoster,
    TOUR_POSTERS.howToClaim,
  ];

  return (
    <section id="share" className="py-16 md:py-24 border-t border-[#2e2e2e]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Spread the Word Copy & One-Click Share Buttons */}
          <div className="lg:col-span-7 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e63946]">
                DIY Street Team · Spread the Word
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f1ea] mt-1">
                Put the 10x10 Tour on Your Feed
              </h2>
              <p className="text-sm text-[#b5b0a4] mt-2 leading-relaxed">
                No corporate promoters, no ad agencies—this coast-to-coast Amtrak run spreads word-of-mouth. Pick your city, grab the caption or flyer, and help fill all 100 private sets.
              </p>
            </div>

            <div>
              <label htmlFor="share-city" className="block font-mono text-xs uppercase text-[#b5b0a4] mb-1.5">
                Customize Shout-Out for a City
              </label>
              <select
                id="share-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 text-xs bg-[#111111] border border-[#2e2e2e] focus:border-[#e63946] rounded-lg text-[#f4f1ea] focus:outline-none"
              >
                <option value="all">All 10 Tour Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#111111] border border-[#2e2e2e] rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#b5b0a4]">
                  Ready-to-Post Hype Copy
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyCaption()}
                  className="text-xs font-mono text-[#e63946] hover:underline whitespace-nowrap shrink-0"
                >
                  {copiedCaption ? 'Copied Caption!' : 'Copy Text'}
                </button>
              </div>
              <p className="text-sm text-[#f4f1ea] leading-relaxed">{hypeText}</p>
            </div>

            {/* One-Click Share Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="px-4 py-2.5 rounded-lg bg-[#e63946] hover:bg-[#cf2f3c] text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tour Link Copied' : 'Copy Tour Link'}</span>
              </button>

              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#f4f1ea]/60 text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
              >
                Share to X
              </a>

              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#f4f1ea]/60 text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
              >
                Share to Facebook
              </a>

              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="px-4 py-2.5 rounded-lg bg-[#111111] border border-[#2e2e2e] hover:border-[#f4f1ea]/60 text-[#f4f1ea] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Mobile Share</span>
              </button>
            </div>

            {nativeFeedback && (
              <p className="text-xs font-mono text-[#e63946]">{nativeFeedback}</p>
            )}
          </div>

          {/* Right: Official Downloadable Tour Flyers */}
          <div className="lg:col-span-5 bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-6">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#b5b0a4]">
              Official Tour Flyers
            </p>
            <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-[#f4f1ea] mt-1">
              Save &amp; Post the Artwork
            </h3>
            <p className="text-xs text-[#b5b0a4] mt-1.5 mb-4">
              Download any official 10x10 poster below for Instagram Stories, TikTok, or Facebook posts.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {flyers.map((flyer) => (
                <div
                  key={flyer.src}
                  className="bg-[#111111] border border-[#2e2e2e] rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-black">
                    <img
                      src={flyer.src}
                      alt={flyer.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-200"
                    />
                  </div>
                  <a
                    href={flyer.src}
                    download
                    className="px-2.5 py-2 text-[11px] font-mono text-[#f4f1ea] hover:text-[#e63946] flex items-center justify-between gap-1 border-t border-[#2e2e2e] transition-colors"
                  >
                    <span className="truncate">Download Flyer</span>
                    <Download className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
