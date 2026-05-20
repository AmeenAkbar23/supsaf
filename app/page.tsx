'use client';
import React, { useState, useEffect } from 'react';

interface HiddenPlace {
  id: number;
  title: string;       
  imageUrl: string;    
  desc: string;        
  lat: number;         
  lng: number;         
  district: string;    
}

const PRE_LOADED_KERALA_SPOTS: HiddenPlace[] = [
  // --- NORTHERN KERALA ---
  {
    id: 1,
    title: "Kavvayi Island Mangrove Path",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/d6/de/2b/you-can-either-opt-for.jpg?w=1200&h=-1&s=1",
    desc: "A stunning untouched backwater island stretch. Rent a small local wooden rowboat to navigate the incredibly narrow, secret mangrove walls during sunset away from commercial houseboat trails.",
    lat: 12.1124,
    lng: 75.2023,
    district: "Kannur"
  },
  {
    id: 2,
    title: "Aranamala Peak Ridge",
    imageUrl: "https://cdn.tripuntold.com/media/photos/location/2020/09/24/eeaa2778-6b93-4110-bb7f-c1914cb0317f.jpg",
    desc: "A breathtaking, off-beat mountain ridge offering completely secluded panoramic views of the Western Ghats canopy. Extremely misty and isolated, accessible via a rugged unpaved off-road jeep track.",
    lat: 11.5265,
    lng: 76.1184,
    district: "Wayanad"
  },
  {
    id: 3,
    title: "Thusharagiri Secret Cascade",
    imageUrl: "https://www.keralatourism.org/images/enchanting_kerala/large/thusharagiri_a_trekker_s_delight20161019051950_613_1.jpg",
    desc: "Deep inside the forest, past the main tourist waterfalls, lies a secluded third-tier cascade pool. Surrounded by towering rock formations and thick woods, it offers total peace.",
    lat: 11.4744,
    lng: 76.0514,
    district: "Kozhikode"
  },
  {
    id: 4,
    title: "Chettuva Mangrove Island Loop",
    imageUrl: "https://media1.thrillophilia.com/filestore/8seyjrekk180tjafgmhcxkej4e08_1550744990_mangroves-in-chettuva.jpg.jpg",
    desc: "An incredible network of silent backwater canals weaving underneath a thick canopy of wild mangroves. Rent a tiny local hand-paddled country boat to discover hidden serene water lanes.",
    lat: 10.5312,
    lng: 76.0421,
    district: "Thrissur"
  },
  {
    id: 5,
    title: "Kodiheri Riverside Meadow",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/b7/55/15/near-water-falling-location.jpg?w=1200&h=-1&s=1",
    desc: "A pristine, wide green grass clearing right beside a sweeping river curve. Completely untouched by commercial vendors, it's perfect for peaceful evening contemplation under the trees.",
    lat: 10.8912,
    lng: 76.3124,
    district: "Palakkad"
  },
  {
    id: 6,
    title: "Mini Ooty Arimbra Hills",
    imageUrl: "https://www.keralatourism.org/_next/image/?url=http%3A%2F%2F127.0.0.1%2Fktadmin%2Fimg%2Fpages%2Fmobile%2Fmini-ooty-glass-bridge-a-thrilling-experience-amidst-arimbra-hills-1727507072_350b28418dfcca0b15ca.webp&w=3840&q=75",
    desc: "A towering high-altitude glass clearing famous for its heavy rolling mist and deep stepped valley views. Follow the lower walking trails down into the plantation boundaries for true isolation.",
    lat: 11.1394,
    lng: 75.9878,
    district: "Malappuram"
  },

  // --- CENTRAL KERALA (ERNAKULAM / IDUKKI / KOTTAYAM) ---
  {
    id: 7,
    title: "Bhoothathankettu Old Forest Trail",
    imageUrl: "https://www.keralatourism.org/images/eco-tourism/trekking_thumb/trekking-trails/_T2A5543_11072018171106.jpg",
    desc: "Skip the main dam gardens; cross the old structure to find a secret rugged walking trail twisting deep into a protected wilderness area. Leads straight to quiet, smooth river boulder structures.",
    lat: 10.1342,
    lng: 76.6624,
    district: "Ernakulam"
  },
  {
    id: 8,
    title: "Kolukkumalai Eastern Sunrise Ridge",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/20/9e/8c/caption.jpg?w=1200&h=1200&s=1",
    desc: "The highest organic tea estate in the world. Walk down the unpaved cliff trail facing east at dawn to watch the massive cloud-bed valleys split open between the mountain peaks.",
    lat: 10.0284,
    lng: 77.2241,
    district: "Idukki"
  },
  {
    id: 9,
    title: "Anakkulam Wild Elephant Stream",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/b0/c0/ab/caption.jpg?w=1200&h=-1&s=1",
    desc: "A unique natural river clearing where herds of wild elephants regularly emerge from the dense reserve forest borders to drink and gather due to special mineral bubbling streams.",
    lat: 10.1615,
    lng: 76.9129,
    district: "Idukki"
  },
  {
    id: 10,
    title: "Vagamon High-Range Pine Valley",
    imageUrl: "https://www.trawell.in/admin/images/upload/963467967Vagamon_Pine_Forest.jpg",
    desc: "An atmospheric, towering pine plantation climbing down steep mountain slopes. Frequently blanketed by a heavy rolling mist, offering complete silence if you follow the lower valley pathways.",
    lat: 9.6551,
    lng: 76.9304,
    district: "Idukki"
  },
  {
    id: 11,
    title: "Illikkal Kallu Apex Monolith",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/05/0d/74/scenic-paradise.jpg?w=1200&h=1200&s=1",
    desc: "A monumental 4000-foot split rock formation offering sweeping panoramic views across the Western Ghats peaks. The trail provides an incredible high-altitude overlook.",
    lat: 9.7531,
    lng: 76.8210,
    district: "Kottayam"
  },
  {
    id: 12,
    title: "Areekkal Completely Hidden Cascades",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/8d/3f/97/areekal-waterfalls-piramadam.jpg?w=1200&h=1200&s=1",
    desc: "A beautifully secluded, terraced waterfall hidden deep inside rubber plantations. The water falls smoothly over multiple sheer rock steps into a clear, shallow natural wading pool.",
    lat: 9.9682,
    lng: 76.5124,
    district: "Ernakulam"
  },
  {
    id: 13,
    title: "Urumbikkara Off-Road Cliff Peak",
    imageUrl: "https://keralabee.com/wp-content/uploads/2023/09/IMG_20230905_233331-jpg.webp",
    desc: "An incredible high-altitude plateau reachable only via a challenging, unpaved rocky terrain path. Features old abandoned estate houses, wild stream paths, and endless rolling green ridges.",
    lat: 9.5841,
    lng: 76.9112,
    district: "Idukki"
  },
  {
    id: 14,
    title: "Kadamakkudy Mangrove Channels",
    imageUrl: "https://www.dreamholidayskerala.com/blog/wp-content/uploads/2025/10/Kadamakudy-1024x683.jpg",
    desc: "A peaceful cluster of tiny islands on the outer edge of Cochin. Features endless sweeping views of fish farms, traditional polders, and narrow country boat lanes lined with wild grass.",
    lat: 10.0514,
    lng: 76.2641,
    district: "Ernakulam"
  },

  // --- SOUTHERN KERALA ---
  {
    id: 15,
    title: "Munroe Island Mangrove Canoe Route",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/03/a4/6c/2a/munroe-island-canoe-tours.jpg?w=1200&h=-1&s=1",
    desc: "A labyrinth of miniature canal networks weaving underneath wild mangroves. Hire a tiny hand-paddled wooden canoe at dawn to watch village life wake up right along the quiet banks.",
    lat: 8.9878,
    lng: 76.6224,
    district: "Kollam"
  },
  {
    id: 16,
    title: "Gavi Deep Evergreen Forest Route",
    imageUrl: "https://www.keralatourism.org/images/microsites/periyar/thekkady-1024x768.jpg",
    desc: "A strictly protected wilderness area inside Periyar Tiger Reserve boundaries. Thick mossy roads, deep natural water reservoirs, and highly regular sightings of rare native wildlife species.",
    lat: 9.4384,
    lng: 77.1662,
    district: "Pathanamthitta"
  },
  {
    id: 17,
    title: "Rosemala Hidden Valley Overlook",
    imageUrl: "https://indiano.travel/wp-content/uploads/2024/11/Rosemala-View-Point-f.jpg",
    desc: "Deep inside the Shendurney Wildlife Sanctuary, this viewpoint offers a magnificent view of the reservoir water loops that look exactly like giant green rose petals from above.",
    lat: 8.9512,
    lng: 77.1214,
    district: "Kollam"
  },
  {
    id: 18,
    title: "Amboori Ashram Mountain Crest",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/88/aa/7f/kurisumala-ashram.jpg?w=900&h=-1&s=1",
    desc: "A peaceful high-altitude settlement bordered by deep water reservoirs and a giant monolithic rock pinnacle. Completely hidden away from standard city routes, providing immense serenity.",
    lat: 8.4812,
    lng: 77.1841,
    district: "Thiruvananthapuram"
  },
  {
    id: 19,
    title: "Kakkathuruthu Island of Crows",
    imageUrl: "https://www.keralatourism.org/images/newsbytes/large/kakkathuruthu_in_nat_geo_s_must_visit_list20161101050212_1868_1.jpg",
    desc: "A tiny, thin strip of land inside Vembanad Lake. Famous for its quiet sunset vistas where you can watch traditional fishermen casting nets against a beautiful, golden sky.",
    lat: 9.8712,
    lng: 76.3421,
    district: "Alappuzha"
  },
  {
    id: 20,
    title: "Chittar Lake Quiet Catchment",
    imageUrl: "https://gaviya.com/wp-content/uploads/2024/08/chittar-dam.jpg",
    desc: "A completely calm water reservoir cache hidden away behind thick rubber hills and mountain curves. Features clear shores and zero commercial crowds, ideal for absolute quietude.",
    lat: 9.3124,
    lng: 76.8412,
    district: "Pathanamthitta"
  }
];

const DEFAULT_LAT = 9.9312;
const DEFAULT_LNG = 76.2673;

const KERALA_DISTRICTS = [
  "All Districts", "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

export default function Home() {
  const [places] = useState<HiddenPlace[]>(PRE_LOADED_KERALA_SPOTS);
  const [selectedPlace, setSelectedPlace] = useState<HiddenPlace | null>(null);
  
  // Filter states
  const [showNearbyOnly, setShowNearbyOnly] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  
  // Geolocation states
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'ready' | 'failed'>('searching');

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

  // Dual matrix filtering pipeline matching district parameters and distance ranges
  const displayPlaces = [...places]
    .filter(p => {
      const matchesNearby = !showNearbyOnly || getDistanceFromUserKm(p.lat, p.lng) <= 100;
      const matchesDistrict = selectedDistrict === "All Districts" || p.district === selectedDistrict;
      return matchesNearby && matchesDistrict;
    })
    .sort((a, b) => {
      return getDistanceFromUserKm(a.lat, a.lng) - getDistanceFromUserKm(b.lat, b.lng);
    });

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between overflow-x-hidden relative select-none font-sans">
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-6xl w-full mx-auto">
        
        {/* RESPONSIVE HEADER NAV BLOCK */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
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
            
            {/* 🏷️ INCORPORATED SUBTLE BETA STATUS MATRIX BADGE AND GPS ENGINE METRICS */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                <span className={`h-1.5 w-1.5 rounded-full ${gpsStatus === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                {gpsStatus === 'ready' ? 'Radar Tracking Active' : 'Radar Core Off-Grid'}
              </div>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 tracking-wider bg-red-950/40 text-red-400 border border-red-900/40 rounded-md">
                Beta
              </span>
            </div>
          </div>

          {/* CONTROLS POSITIONED TO THE RIGHT */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
            
            {/* Nearby Mode Toggle Switch */}
            <button 
              onClick={() => {
                setShowNearbyOnly(!showNearbyOnly);
                if(!showNearbyOnly) setSelectedDistrict("All Districts"); 
              }} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 ${
                showNearbyOnly 
                  ? 'bg-red-950/40 text-red-400 border-red-900/60 shadow-lg shadow-red-900/10' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              📍 {showNearbyOnly ? 'Nearby Mode On (<100km)' : 'Filter Nearby'}
            </button>

            {/* Core District Selector Dropdown Box */}
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                if (e.target.value !== "All Districts") setShowNearbyOnly(false); 
              }}
              className="bg-zinc-900 text-zinc-200 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-zinc-600 cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_16px_center] bg-no-repeat active:scale-95 transition-all"
            >
              {KERALA_DISTRICTS.map((district) => (
                <option key={district} value={district} className="bg-zinc-950 text-zinc-300">
                  {district === "All Districts" ? "🌐 All Places" : `🏔️ ${district}`}
                </option>
              ))}
            </select>

          </div>
        </header>

        {/* DYNAMIC STREAM ENGAGED CONTEXT BAR */}
        <div className="mb-8 bg-zinc-900/20 border border-zinc-900 px-5 py-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base">📍</span>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">
              Viewing: {showNearbyOnly ? "Spots Closer Than 100km" : selectedDistrict === "All Districts" ? "Hyper-Local Stream Engaged" : `Hidden Spots in ${selectedDistrict}`}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 font-bold">
            {displayPlaces.length} {displayPlaces.length === 1 ? "Spot Found" : "Spots Found"}
          </span>
        </div>

        {/* DISCOVERY GRID MATRIX */}
        <section>
          {displayPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayPlaces.map((place) => (
                <article 
                  key={place.id} 
                  onClick={() => setSelectedPlace(place)} 
                  className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 group cursor-pointer relative"
                >
                  <div className="w-full h-44 sm:h-52 bg-zinc-800 relative overflow-hidden">
                    <img src={place.imageUrl} alt={place.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    
                    {/* DISTRICT OVERLAY LABEL */}
                    <span className="absolute bottom-3 left-3 bg-black/60 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-800/40">
                      📍 {place.district}
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
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl max-w-md mx-auto p-4">
              <p className="text-zinc-400 text-sm">No hidden spots indexed for this region configuration yet.</p>
            </div>
          )}
        </section>

        {/* INSPECTION VIEW MODAL DRAWER */}
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
                    <h2 className="text-xl font-black text-zinc-100">{selectedPlace.title}</h2>
                    <p className="text-[10px] sm:text-[11px] font-mono font-bold text-red-400 mt-0.5">
                      🧭 Located {getDistanceFromUserKm(selectedPlace.lat, selectedPlace.lng)} km from you ({selectedPlace.district} District)
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Explorer Guidelines</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedPlace.desc}</p>
                </div>

                <div className="pt-1 flex items-center justify-between gap-3">
                  <a 
                    href={`http://googleusercontent.com/maps.google.com/maps?q=${selectedPlace.lat},${selectedPlace.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-3 bg-red-600 hover:bg-red-500 text-center rounded-xl font-bold text-white transition-colors"
                  >
                    Open Navigation Route 🗺️
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BRAND FOOTER BLOCK WITH INTERACTIVE SOCIAL MATRIX */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-6 px-4 sm:px-10 mt-12">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
          
          <div>
            &copy; {new Date().getFullYear()} <span className="text-zinc-400 font-bold">supsaf</span>. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/supsaf/" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1.5"
            >
              <span>📸</span> Instagram
            </a>
            <a 
              href="https://unsplash.com/@supsaf" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1.5"
            >
              <span>🖼️</span> Unsplash
            </a>
          </div>

        </div>
      </footer>

      {/* 🛑 NEXT.JS WATERMARK REMOVAL */}
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
    </div>
  );
}
