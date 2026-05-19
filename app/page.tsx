'use client';
import React, { useState, useEffect, FormEvent } from 'react';

// 1. Core Data Shape
interface HiddenPlace {
  id: number;
  title: string;       
  imageUrl: string;    
  desc: string;        
  lat: number;         
  lng: number;         
  safetyStatus: 'Clear' | 'Caution' | 'Danger'; 
}

// Pre-loaded baseline spots across Kerala
const PRE_LOADED_KERALA_SPOTS: HiddenPlace[] = [
  {
    id: 1,
    title: "Kavvayi Island Mangrove Path",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/d6/de/2b/you-can-either-opt-for.jpg?w=1200&h=-1&s=1",
    desc: "A stunning untouched backwater island stretch in North Kerala. Skip the commercial houseboats; rent a small local rowboat to navigate the incredibly narrow, secret mangrove walls during sunset.",
    lat: 12.1124,
    lng: 75.2023,
    safetyStatus: "Clear"
  },
  {
    id: 2,
    title: "Kolukkumalai Eastern Sunrise Ridge",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/20/9e/8c/caption.jpg?w=1200&h=1200&s=1",
    desc: "The highest organic tea estate in the world. Avoid the crowded base camps; hike 500 meters down the unpaved cliff trail facing east at exactly 5:15 AM to watch the cloud-bed valley split open between the mountain peaks.",
    lat: 10.0284,
    lng: 77.2241,
    safetyStatus: "Caution"
  },
  {
    id: 3,
    title: "Marottichal Whispering Falls",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/ec/1e/3a/marottichal-waterfalls.jpg?w=700&h=400&s=1",
    desc: "An incredible deep forest jungle trek leading to completely secluded cascades. Unlike heavily commercial waterfalls, there are absolutely zero metal barricades here—you can sit right at the edge of the rushing stream bed.",
    lat: 10.4578,
    lng: 76.3681,
    safetyStatus: "Danger" 
  },
  {
    id: 4,
    title: "Munroe Island Mangrove Canoe Route",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/03/a4/6c/2a/munroe-island-canoe-tours.jpg?w=1200&h=-1&s=1",
    desc: "A maze of miniature canal networks weaving underneath a thick canopy of wild mangroves. Avoid the motorized speedboats; hire a tiny hand-paddled wooden canoe at dawn to watch village life wake up right beside the water level.",
    lat: 8.9878,
    lng: 76.6224,
    safetyStatus: "Clear"
  },
  {
    id: 5,
    title: "Anakkulam Wild Elephant Stream",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/b0/c0/ab/caption.jpg?w=1200&h=-1&s=1",
    desc: "A unique natural river border where herds of wild elephants regularly emerge from the dense reserve forest to drink and gather. The water features a distinct natural mineral bubbling that draws the wildlife safely right to the edge.",
    lat: 10.1615,
    lng: 76.9129,
    safetyStatus: "Caution"
  },
  {
    id: 6,
    title: "Vagamon High-Range Pine Valley",
    imageUrl: "https://www.trawell.in/admin/images/upload/963467967Vagamon_Pine_Forest.jpg",
    desc: "An atmospheric, towering pine plantation climbing down steep mountain slopes. Frequently blanketed by a heavy rolling mist, it provides complete isolation away from commercial hill stations if you follow the lower valley pathways.",
    lat: 9.6551,
    lng: 76.9304,
    safetyStatus: "Clear"
  },
  {
    id: 7,
    title: "Illikkal Kallu Apex Monolith",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/05/0d/74/scenic-paradise.jpg?w=1200&h=1200&s=1",
    desc: "A monumental 4000-foot split rock formation offering panoramic views across the Western Ghats. The narrow trail paths can become extremely hazardous and slippery during immediate cloud bursts or heavy shifting rains.",
    lat: 9.7531,
    lng: 76.8210,
    safetyStatus: "Danger"
  }
];

const DEFAULT_LAT = 9.9312;
const DEFAULT_LNG = 76.2673;

export default function Home() {
  const [places, setPlaces] = useState<HiddenPlace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<HiddenPlace | null>(null);
  
  // Form Input States
  const [placeName, setPlaceName] = useState<string>('');
  const [guidelines, setGuidelines] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [safetySelection, setSafetySelection] = useState<'Clear' | 'Caution' | 'Danger'>('Clear'); 
  
  // Geolocation states
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'ready' | 'failed'>('searching');

  // Load cache on browser mount
  useEffect(() => {
    const savedPlaces = localStorage.getItem('supsaf_places_radar');
    if (savedPlaces) {
      try {
        setPlaces(JSON.parse(savedPlaces));
      } catch (e) {
        setPlaces(PRE_LOADED_KERALA_SPOTS);
      }
    } else {
      setPlaces(PRE_LOADED_KERALA_SPOTS);
    }
  }, []);

  const saveToLocalStorage = (updatedPlaces: HiddenPlace[]) => {
    localStorage.setItem('supsaf_places_radar', JSON.stringify(updatedPlaces));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsStatus('ready');
      },
      () => setGpsStatus('failed'),
      { enableHighAccuracy: true }
    );
  }, []);

  // Haversine System formula computing precise metrics in kilometers
  const getDistanceFromUserKm = (targetLat: number, targetLng: number) => {
    const baseLat = currentCoords ? currentCoords.lat : DEFAULT_LAT;
    const baseLng = currentCoords ? currentCoords.lng : DEFAULT_LNG;

    const R = 6371; 
    const dLat = (targetLat - baseLat) * Math.PI / 180;
    const dLng = (targetLng - baseLng) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(baseLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!placeName || !photoPreview || !guidelines) {
      alert("Please fill out all required fields!");
      return;
    }

    const finalLat = currentCoords ? currentCoords.lat : DEFAULT_LAT;
    const finalLng = currentCoords ? currentCoords.lng : DEFAULT_LNG;

    const newPlace: HiddenPlace = {
      id: Date.now(),
      title: placeName,
      imageUrl: photoPreview,
      desc: guidelines,
      lat: finalLat,
      lng: finalLng,
      safetyStatus: safetySelection 
    };

    const updatedPlaces = [newPlace, ...places];
    setPlaces(updatedPlaces);
    saveToLocalStorage(updatedPlaces);
    
    setPlaceName('');
    setGuidelines('');
    setPhotoPreview('');
    setSafetySelection('Clear');
    setIsModalOpen(false);
  };

  const handleClearAllLocalStorage = () => {
    if (confirm("Reset layout data indexes?")) {
      localStorage.removeItem('supsaf_places_radar');
      setPlaces(PRE_LOADED_KERALA_SPOTS);
    }
  };

  // Pure Hyper-Local Pipeline: Automatically matches and sorts absolute closest elements first
  const nearbySortedPlaces = [...places].sort((a, b) => {
    return getDistanceFromUserKm(a.lat, a.lng) - getDistanceFromUserKm(b.lat, b.lng);
  });

  return (
    <main className="min-h-screen w-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 md:p-10 font-sans overflow-x-hidden relative select-none">
      
      {/* RESPONSIVE HEADER NAV BLOCK */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
        <div className="flex items-center gap-3.5">
          <img 
            src="/logo.png" 
            alt="Supsaf Logo" 
            className="h-9 sm:h-11 w-auto object-contain rounded-xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('text-logo');
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <h1 id="text-logo" className="text-2xl sm:text-3xl font-black text-red-500 tracking-tighter" style={{ display: 'none' }}>supsaf</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] sm:text-[11px] text-zinc-400 font-medium">
            <span className={`h-1.5 w-1.5 rounded-full ${gpsStatus === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
            {gpsStatus === 'ready' ? 'Radar Tracking Active' : 'Radar Core Off-Grid'}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {places.length > PRE_LOADED_KERALA_SPOTS.length && (
            <button onClick={handleClearAllLocalStorage} className="text-[11px] text-zinc-500 hover:text-zinc-300 font-medium px-2.5 py-2 border border-zinc-800 rounded-xl hover:bg-zinc-900/50 transition-all">
              Reset Cache
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 sm:px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xl shadow-red-600/10 active:scale-[0.98] whitespace-nowrap"
          >
            + Share a Secret Spot
          </button>
        </div>
      </header>

      {/* UPDATED: STREAMLINED STREAM INDICATOR BANNER */}
      <div className="max-w-6xl mx-auto mb-8 bg-zinc-900/20 border border-zinc-900 px-5 py-4 rounded-2xl flex items-center gap-3">
        <span className="text-base">📍</span>
        <h2 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">
          Hyper-Local Stream Engaged
        </h2>
      </div>

      {/* DEVICE BREAKPOINT RESPONSIVE GRID MATRIX */}
      <section className="max-w-6xl mx-auto">
        {nearbySortedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {nearbySortedPlaces.map((place) => (
              <article 
                key={place.id} 
                onClick={() => setSelectedPlace(place)} 
                className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 group cursor-pointer relative"
              >
                <div className="w-full h-44 sm:h-52 bg-zinc-800 relative overflow-hidden">
                  <img src={place.imageUrl} alt={place.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  
                  {/* TRAIL SAFETY CONDITION BADGE */}
                  <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border backdrop-blur-md shadow-sm z-10 ${
                    place.safetyStatus === 'Danger' ? 'bg-red-600 text-white animate-pulse border-red-500' :
                    place.safetyStatus === 'Caution' ? 'bg-amber-600 text-white border-amber-500' :
                    'bg-emerald-600 text-white border-emerald-500'
                  }`}>
                    {place.safetyStatus === 'Danger' ? '🚨 Hazard Alert' : place.safetyStatus === 'Caution' ? '⚠️ Caution' : '🟢 Clear Trail'}
                  </span>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-zinc-100 group-hover:text-red-500 transition-colors duration-300 line-clamp-1">{place.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">{place.desc}</p>
                  </div>
                  <div className="pt-3.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono text-[11px] font-black text-red-400">
                      🧭 {getDistanceFromUserKm(place.lat, place.lng)} km away
                    </span>
                    <span className="font-bold text-zinc-500 group-hover:text-red-400 transition-colors">Inspect →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl max-w-md mx-auto p-4"><p className="text-zinc-400 text-sm">Scanning coordinates radar...</p></div>
        )}
      </section>

      {/* INSPECTION VIEW OVERLAY DETAIL MODAL DRAWER */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[6000] flex items-center justify-center p-3 sm:p-4" onClick={() => setSelectedPlace(null)}>
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl relative scrollbar-none" 
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full h-48 sm:h-64 bg-zinc-800 relative">
              <img src={selectedPlace.imageUrl} alt={selectedPlace.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/10 to-transparent" />
              <button onClick={() => setSelectedPlace(null)} className="absolute top-3 right-3 bg-zinc-950/80 text-zinc-400 hover:text-zinc-100 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">✕</button>
            </div>
            
            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-zinc-100">{selectedPlace.title}</h2>
                  <p className="text-[10px] sm:text-[11px] font-mono font-bold text-red-400 mt-0.5">🧭 Located {getDistanceFromUserKm(selectedPlace.lat, selectedPlace.lng)} km from you</p>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded border uppercase w-fit ${
                  selectedPlace.safetyStatus === 'Danger' ? 'bg-red-950/40 text-red-400 border-red-500/30' :
                  selectedPlace.safetyStatus === 'Caution' ? 'bg-amber-950/40 text-amber-400 border-amber-500/30' :
                  'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                }`}>
                  Status: {selectedPlace.safetyStatus}
                </span>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Explorer Guidelines</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedPlace.desc}</p>
              </div>

              {selectedPlace.safetyStatus === 'Danger' && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-[11px] sm:text-xs rounded-xl font-medium">
                  ⚠️ <strong>Risk Alert:</strong> Path flagged due to heavy conditions. Avoid travel here until stable.
                </div>
              )}

              <div className="pt-1 flex items-center justify-between gap-3">
                <a 
                  href={`http://googleusercontent.com/maps.google.com/maps?q=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex-1 py-3 font-bold text-center rounded-xl text-xs transition-all text-white ${
                    selectedPlace.safetyStatus === 'Danger' ? 'bg-zinc-800 border border-zinc-700 cursor-not-allowed text-zinc-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {selectedPlace.safetyStatus === 'Danger' ? "Route Suspended 🛑" : "Open Navigation Route 🗺️"}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION FORM MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">Log a New Discovery</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-200 font-bold text-lg p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Discovery Name *</label>
                <input type="text" required placeholder="e.g. Secret Mangrove Bay" value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-red-500/50" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Current Trail Status *</label>
                <select value={safetySelection} onChange={(e) => setSafetySelection(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50 cursor-pointer">
                  <option value="Clear">🟢 Clear Trail (Safe to access)</option>
                  <option value="Caution">🟡 Caution Advised (Slippery / heavy mist)</option>
                  <option value="Danger">🚨 High Risk / Danger Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Upload Photo *</label>
                <input type="file" required accept="image/*" onChange={handleImageChange} className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer" />
              </div>

              {photoPreview && (
                <div className="w-full h-16 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center gap-3 p-2">
                  <img src={photoPreview} alt="Preview" className="h-full w-12 object-cover rounded-lg" />
                  <div className="text-[10px] text-zinc-500"><span className="text-emerald-400 font-bold block">✓ Photo Attached</span>GPS Position Locked</div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Explorer Guidelines *</label>
                <textarea rows={3} required placeholder="Provide hidden landmarks or routing steps commercial maps miss out on..." value={guidelines} onChange={(e) => setGuidelines(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-red-500/50 resize-none leading-relaxed" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl text-xs shadow-lg mt-2">
                Broadcast Discovery
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🛑 NEXT.JS CORNER WATERMARK REMOVAL HOOK */}
      <style jsx global>{`
        .nextjs-static-indicator, 
        #nextjs-wrd,
        [data-nextjs-toast],
        nextjs-portal { 
          display: none !important; 
          opacity: 0 !important; 
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}