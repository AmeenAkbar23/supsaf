'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KERALA_SPOTS, HiddenPlace } from './data';

type GpsStatus = 'searching' | 'ready' | 'failed';

interface Coords {
  lat: number;
  lng: number;
}

const DEFAULT_COORDS: Coords = { lat: 9.9312, lng: 76.2673 };
const KERALA_DISTRICTS = [
  "All Destinations",
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
];

// ─── Distance Calculation ───────────────────────────────────────────────────
function haversineKm(from: Coords, to: Coords): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const straightLineKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(straightLineKm * 1.3);
}

// ─── Components ──────────────────────────────────────────────────────────────
function RadarBadge({ status }: { status: GpsStatus }) {
  const isReady = status === 'ready';
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] sm:text-[11px] text-zinc-400 font-medium select-none">
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isReady ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'}`} />
      {status === 'searching' ? 'Locating…' : isReady ? 'Radar Active' : 'Radar Off-Grid'}
    </div>
  );
}

interface PlaceCardProps { place: HiddenPlace; distKm: number; onClick: () => void; }

function PlaceCard({ place, distKm, onClick }: PlaceCardProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  }, [onClick]);

  return (
    <article role="button" tabIndex={0} aria-label={`View details for ${place.title}`} onClick={onClick} onKeyDown={handleKeyDown} className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 transition-all duration-300 group cursor-pointer">
      <div className="w-full h-44 sm:h-52 bg-zinc-800 relative overflow-hidden flex-shrink-0">
        <img src={place.imageUrl} alt={place.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          onError={(e) => { const t = e.currentTarget; t.style.display = 'none'; const f = t.nextElementSibling as HTMLElement | null; if (f) f.style.display = 'flex'; }} />
        <div className="absolute inset-0 bg-zinc-800 items-center justify-center hidden" aria-hidden="true">
          <span className="text-zinc-600 text-4xl">🏔️</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-800/40">📍 {place.district}</span>
        </div>
      </div>
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-extrabold text-zinc-100 group-hover:text-red-500 transition-colors duration-300 line-clamp-1">{place.title}</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">{place.desc}</p>
        </div>
        <div className="mt-auto pt-3.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono text-[11px] font-black text-red-400">🧭 {distKm} km away</span>
          <span className="font-bold text-zinc-500 group-hover:text-red-400 transition-colors">View →</span>
        </div>
      </div>
    </article>
  );
}

interface PlaceModalProps { place: HiddenPlace; distKm: number; onClose: () => void; }

function PlaceModal({ place, distKm, onClose }: PlaceModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const mapsUrl = `http://googleusercontent.com/maps.google.com/maps?q=${place.lat},${place.lng}`;

  return (
    <div role="dialog" aria-modal="true" aria-label={place.title} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[6000] flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92dvh] overflow-y-auto shadow-2xl relative" style={{ scrollbarWidth: 'none' }} onClick={(e) => e.stopPropagation()}>
        <div className="w-full h-48 sm:h-64 bg-zinc-800 relative flex-shrink-0">
          <img src={place.imageUrl} alt={place.title} className="w-full h-full object-cover"
            onError={(e) => { const t = e.currentTarget; t.style.display = 'none'; const f = t.nextElementSibling as HTMLElement | null; if (f) f.style.display = 'flex'; }} />
          <div className="absolute inset-0 bg-zinc-800 items-center justify-center hidden" aria-hidden="true">
            <span className="text-zinc-600 text-5xl">🏔️</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/10 to-transparent pointer-events-none" />
          <button onClick={onClose} aria-label="Close modal" className="absolute top-3 right-3 bg-zinc-950/80 text-zinc-400 hover:text-zinc-100 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">✕</button>
        </div>
        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">{place.title}</h2>
            <p className="text-[10px] sm:text-[11px] font-mono font-bold text-red-400 mt-1">🧭 {distKm} km from you · {place.district} District</p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl">
            <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">About this place</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{place.desc}</p>
          </div>
          <a href={mapsUrl} target="_blank" rel="noreferrer noopener" className="block w-full py-4 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-center rounded-xl font-bold text-white tracking-wide shadow-lg shadow-red-950/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
            Open Navigation Route 🗺️
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<HiddenPlace | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('searching');
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Destinations');

  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('failed'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setUserCoords({ lat: coords.latitude, lng: coords.longitude }); setGpsStatus('ready'); },
      () => setGpsStatus('failed'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  const origin: Coords = userCoords ?? DEFAULT_COORDS;

  const spotsWithDist = useMemo(
    () => KERALA_SPOTS.map((p) => ({ ...p, distKm: haversineKm(origin, { lat: p.lat, lng: p.lng }) })),
    [origin.lat, origin.lng],
  );

  const displaySpots = useMemo(() => {
    return spotsWithDist
      .filter((p) => {
        if (selectedDistrict === 'All Destinations') {
          return p.distKm <= 50; 
        }
        return p.district === selectedDistrict;
      })
      .sort((a, b) => a.distKm - b.distKm);
  }, [spotsWithDist, selectedDistrict]);

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDistrict(e.target.value), [],
  );

  const statusLabel =
    selectedDistrict !== 'All Destinations'
      ? `Destinations in ${selectedDistrict}`
      : gpsStatus === 'ready'
      ? 'All Nearby Destinations (within 50 km)'
      : 'All Destinations';

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col overflow-x-hidden relative select-none font-sans">
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-6xl w-full mx-auto">

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
          <div className="flex items-center gap-3.5 flex-wrap">
            <img src="/logo.png" alt="Supsaf" className="h-9 sm:h-11 w-auto object-contain rounded-xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; document.getElementById('text-logo')?.removeAttribute('style'); }} />
            <h1 id="text-logo" style={{ display: 'none' }} className="text-2xl sm:text-3xl font-black text-red-500 tracking-tighter">supsaf</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <RadarBadge status={gpsStatus} />
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 tracking-wider bg-red-950/40 text-red-400 border border-red-900/40 rounded-md">Beta</span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
            <div className="relative">
              <select value={selectedDistrict} onChange={handleDistrictChange} aria-label="Filter by district" className="bg-zinc-900 text-zinc-200 border border-zinc-800 pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-zinc-600 cursor-pointer appearance-none active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-red-500">
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-zinc-950 text-zinc-300">
                    {d}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">▾</span>
            </div>
          </div>
        </header>

        {gpsStatus === 'failed' && (
          <div role="alert" className="mb-6 flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400">
            <span className="text-amber-400 text-base" aria-hidden="true">⚠️</span>
            <span>Location unavailable — Enable browser location access for accurate results.</span>
          </div>
        )}

        <div className="mb-8 bg-zinc-900/20 border border-zinc-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-base" aria-hidden="true">📍</span>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">{statusLabel}</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 font-bold flex-shrink-0">
            {displaySpots.length} {displaySpots.length === 1 ? 'spot' : 'spots'} found
          </span>
        </div>

        <section aria-label="Hidden places grid">
          {displaySpots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displaySpots.map((place) => (
                <PlaceCard key={place.id} place={place} distKm={spotsWithDist.find((p) => p.id === place.id)?.distKm ?? 0} onClick={() => setSelectedPlace(place)} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl max-w-md mx-auto p-4">
              <p className="text-zinc-400 text-sm mb-4">No spots found for this district yet.</p>
              <button onClick={() => setSelectedDistrict('All Destinations')} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:border-zinc-700 transition-all">
                Clear filter
              </button>
            </div>
          )}
        </section>
      </main>

      {selectedPlace && (
        <PlaceModal place={selectedPlace} distKm={spotsWithDist.find((p) => p.id === selectedPlace.id)?.distKm ?? 0} onClose={() => setSelectedPlace(null)} />
      )}

      <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-6 px-4 sm:px-10 mt-12">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
          <p>© {new Date().getFullYear()} <span className="text-zinc-400 font-bold">supsaf</span>. All rights reserved.</p>
          <nav aria-label="Social links" className="flex items-center gap-6">
            <a href="https://instagram.com/supsaf/" target="_blank" rel="noreferrer noopener" className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline">
              <span aria-hidden="true">📸</span> Instagram
            </a>
            <a href="https://unsplash.com/@supsaf" target="_blank" rel="noreferrer noopener" className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline">
              <span aria-hidden="true">🖼️</span> Unsplash
            </a>
          </nav>
        </div>
      </footer>

      <style jsx global>{`
        .nextjs-static-indicator,
        #nextjs-wrd,
        [data-nextjs-toast],
        nextjs-portal {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          max-height: 0px !important;
          max-width: 0px !important;
        }
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
