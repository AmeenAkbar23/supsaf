'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HiddenPlace {
  id: number;
  title: string;
  imageUrl: string;
  desc: string;
  lat: number;
  lng: number;
  district: string;
}

type FilterMode = 'all' | 'nearby' | 'district';
type GpsStatus = 'searching' | 'ready' | 'failed';

interface FilterState {
  mode: FilterMode;
  district: string;
}

interface Coords {
  lat: number;
  lng: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_COORDS: Coords = { lat: 9.9312, lng: 76.2673 }; // Kochi fallback
const NEARBY_RADIUS_KM = 100;

const KERALA_DISTRICTS = [
  "All Districts",
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
];

// ─── Data (moved out of component — evaluated once at module load) ─────────────
const KERALA_SPOTS: HiddenPlace[] = [
  // KASARAGOD
  {
    id: 1, district: "Kasaragod",
    title: "Ranipuram Misty Grasslands",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqSYrtNI6tySJyy-frZG-8Sx2_4QJXRQfYjg&s",
    desc: "Often called the 'Ooty of Kerala.' Hike through thick shola forests to reach massive, windswept green mountaintop meadows covered in rolling white fog.",
    lat: 12.4278, lng: 75.3524,
  },
  {
    id: 2, district: "Kasaragod",
    title: "Valiyaparamba Hidden Backwaters",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/4f/81/e6/valiayaparmba-backwaters.jpg?w=1100&h=1100&s=1",
    desc: "A completely peaceful, non-commercial alternative to Alleppey. Surrounded by endless coconut groves and fed by four pristine coastal rivers.",
    lat: 12.1341, lng: 75.1482,
  },
  {
    id: 3, district: "Kasaragod",
    title: "Thaikadappuram Secluded Beach",
    imageUrl: "https://www.keralatourism.org/_next/image/?url=http%3A%2F%2F127.0.0.1%2Fktadmin%2Fimg%2Fpages%2Fmobile%2Fthaikadappuram-beach-1720437580_5797fdf6cc63d064ec4a.webp&w=3840&q=75",
    desc: "A lonely, wide stretch of sand famous for its complete solitude and the rare Olive Ridley sea turtles that visit the quiet shores during late autumn.",
    lat: 12.2384, lng: 75.1121,
  },
  // KANNUR
  {
    id: 4, district: "Kannur",
    title: "Kavvayi Island Mangrove Path",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/d6/de/2b/you-can-either-opt-for.jpg?w=1200&h=-1&s=1",
    desc: "A stunning untouched backwater island stretch. Rent a small local wooden rowboat to navigate incredibly narrow mangrove walls during a quiet sunset.",
    lat: 12.1124, lng: 75.2023,
  },
  {
    id: 5, district: "Kannur",
    title: "Paithalmala Cloud Peak Trail",
    imageUrl: "https://www.dtpckannur.com/uploads/picture_gallery/gallery_images/paithalmala-trekking-1920x1080-20230414135222825468.jpg",
    desc: "The highest geographic peak in Kannur. A serene trek past the clouds to an observation tower looking over the dense Kodagu forest borders.",
    lat: 12.1182, lng: 75.6124,
  },
  {
    id: 6, district: "Kannur",
    title: "Aralam Deep Sanctuary Track",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/a4/f5/24/aralam-wildlife-sanctuary.jpg?w=1200&h=1200&s=1",
    desc: "The northernmost wildlife reserve in Kerala. Skip the crowded safari spots; hike alongside forest guards through true, unpolished rainforest pathways.",
    lat: 11.9542, lng: 75.8412,
  },
  // WAYANAD
  {
    id: 7, district: "Wayanad",
    title: "Aranamala Peak Ridge",
    imageUrl: "https://cdn.tripuntold.com/media/photos/location/2020/09/24/eeaa2778-6b93-4110-bb7f-c1914cb0317f.jpg",
    desc: "A breathtaking, off-beat mountain ridge offering secluded views of the Western Ghats. Extremely misty and isolated, reached via a rugged jeep track.",
    lat: 11.5265, lng: 76.1184,
  },
  {
    id: 8, district: "Wayanad",
    title: "Kudukkathu Para Rock Hills",
    imageUrl: "https://keralapages.in/wp-content/uploads/Kudukkathu-Para-Rock-Formations.webp",
    desc: "Massive, under-visited rock formations surrounded by high grasslands. Exceptional for evening stargazing due to absolute zero light pollution.",
    lat: 11.6421, lng: 75.9512,
  },
  {
    id: 9, district: "Wayanad",
    title: "Pakshipathalam Ancient Rock Caves",
    imageUrl: "https://www.mywayanad.com/wp-content/uploads/2022/08/Pakshipathalam-4-Wayanad.jpg",
    desc: "Deep inside the Brahmagiri hills lies a maze of giant, primitive granite boulders hiding secret subterranean caves where wild mountain birds nest.",
    lat: 11.9124, lng: 75.9841,
  },
  // KOZHIKODE
  {
    id: 10, district: "Kozhikode",
    title: "Thusharagiri Secret Cascade",
    imageUrl: "https://www.keralatourism.org/images/enchanting_kerala/large/thusharagiri_a_trekker_s_delight20161019051950_613_1.jpg",
    desc: "Deep inside the forest, past the main tourist areas, lies a secluded third-tier cascade pool surrounded by smooth granite boulders.",
    lat: 11.4744, lng: 76.0514,
  },
  {
    id: 11, district: "Kozhikode",
    title: "Vellarimala High Range Trail",
    imageUrl: "https://www.dtpckozhikode.com/uploads/picture_gallery/gallery_images/vellarimala-20230509172234418149.webp",
    desc: "A challenging mountain landscape characterized by raw rocky river beds, deep mountain drops, and intense mist cover along the Camel's Hump ridge.",
    lat: 11.4312, lng: 76.1412,
  },
  {
    id: 12, district: "Kozhikode",
    title: "Kadalundi Estuary Mangrove Loop",
    imageUrl: "https://www.keralatourism.org/_next/image/?url=http%3A%2F%2F127.0.0.1%2Fktadmin%2Fimg%2Fpages%2Fvertical%2Faerial-view-of-kadalundi-bird-sanctuary-kozhikode-1738772731_ef0b9f2c02a6889b4a25.webp&w=3840&q=75",
    desc: "Where the Kadalundi River meets the Arabian Sea. Rent a tiny local canoe to slip through thousands of silent, wild mangrove island nodes.",
    lat: 11.1284, lng: 75.8241,
  },
  // MALAPPURAM
  {
    id: 13, district: "Malappuram",
    title: "Mini Ooty Arimbra Hills",
    imageUrl: "https://www.keralatourism.org/_next/image/?url=http%3A%2F%2F127.0.0.1%2Fktadmin%2Fimg%2Fpages%2Fmobile%2Fmini-ooty-glass-bridge-a-thrilling-experience-amidst-arimbra-hills-1727507072_350b28418dfcca0b15ca.webp&w=3840&q=75",
    desc: "A towering high-altitude ridge famous for its heavy rolling mist and deep stepped valley views. Follow the lower trails for true isolation.",
    lat: 11.1394, lng: 75.9878,
  },
  {
    id: 14, district: "Malappuram",
    title: "Nedumkayam Old Teak Reserve",
    imageUrl: "https://www.keralatourism.org/images/enchanting_kerala/large/nedumkayam_rainforest_unshackle_yourself_here20210910070921_1115_1.jpg",
    desc: "A peaceful forest area near Nilambur. Walk across a vintage hanging bridge over crystal clear woodland pools where wild deer often gather.",
    lat: 11.3124, lng: 76.3214,
  },
  {
    id: 15, district: "Malappuram",
    title: "Kodikuthimala Green Peak",
    imageUrl: "https://www.keralatourism.org/images/enchanting_kerala/large/kodikuthimala_malappuram20220207100430_1160_1.jpg",
    desc: "Often called the Ooty of Malappuram. A gentle mountain clearing with watchtowers and continuous cool winds sweeping over natural terraced rocks.",
    lat: 10.9841, lng: 76.3124,
  },
  // PALAKKAD
  {
    id: 16, district: "Palakkad",
    title: "Kodiheri Riverside Meadow",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/b7/55/15/near-water-falling-location.jpg?w=1200&h=-1&s=1",
    desc: "A pristine, wide green grass clearing right beside a sweeping river curve. Completely untouched and calm, perfect for peaceful evening contemplation.",
    lat: 10.8912, lng: 76.3124,
  },
  {
    id: 17, district: "Palakkad",
    title: "Silent Valley Rainforest Border",
    imageUrl: "https://www.keralatourism.org/ktadmin/img/pages/tablet/silent-valley-national-park-1721217742_f70793578057884756aa.webp",
    desc: "One of the last remaining undisturbed tropical rainforests in India. Pure, ancient wilderness paths filled with giant trees and rare wildlife.",
    lat: 11.1241, lng: 76.4321,
  },
  {
    id: 18, district: "Palakkad",
    title: "Nelliyampathy Orange Hill Country",
    imageUrl: "https://kfdcecotourism.com/storage/destination/6786481925754.jpg",
    desc: "A stunning mountain town flanked by old cloud-kissed tea estates, terraced orange orchards, and deep, breathtaking cliff drops.",
    lat: 10.5341, lng: 76.6912,
  },
  // THRISSUR
  {
    id: 19, district: "Thrissur",
    title: "Chettuva Mangrove Island Loop",
    imageUrl: "https://media1.thrillophilia.com/filestore/8seyjrekk180tjafgmhcxkej4e08_1550744990_mangroves-in-chettuva.jpg.jpg",
    desc: "An incredible network of silent backwater canals weaving underneath wild mangroves. Discover hidden, serene, green water lanes.",
    lat: 10.5312, lng: 76.0421,
  },
  {
    id: 20, district: "Thrissur",
    title: "Marottichal Forest Pools",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/ec/1e/3a/marottichal-waterfalls.jpg?w=700&h=400&s=1",
    desc: "An offbeat forest trek leading away from commercial lanes straight to open natural rock pools and seasonal jungle cascades.",
    lat: 10.4578, lng: 76.3681,
  },
  {
    id: 21, district: "Thrissur",
    title: "Chavakkar Beach Backwater Strip",
    imageUrl: "https://www.keralatourism.org/_next/image/?url=http%3A%2F%2F127.0.0.1%2Fktadmin%2Fimg%2Fpages%2Ftablet%2Fmunakkal-beach-1727446307_75ac2226a3b239d9902f.webp&w=1920&q=75",
    desc: "A unique coastal anomaly where a completely silent backwater stream flows parallel to a completely deserted sandy ocean beach strip.",
    lat: 10.5912, lng: 76.0141,
  },
  // ERNAKULAM
  {
    id: 22, district: "Ernakulam",
    title: "Bhoothathankettu Old Forest Trail",
    imageUrl: "https://www.keralatourism.org/images/eco-tourism/trekking_thumb/trekking-trails/_T2A5543_11072018171106.jpg",
    desc: "Skip the main dam gardens; cross the old structure to find a secret rugged walking trail twisting deep into a protected wilderness area.",
    lat: 10.1342, lng: 76.6624,
  },
  {
    id: 23, district: "Ernakulam",
    title: "Areekkal Hidden Cascades",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/8d/3f/97/areekal-waterfalls-piramadam.jpg?w=1200&h=1200&s=1",
    desc: "A beautifully secluded, terraced waterfall hidden deep inside rubber plantations. The water falls smoothly over multiple rock steps.",
    lat: 9.9682, lng: 76.5124,
  },
  {
    id: 24, district: "Ernakulam",
    title: "Kadamakkudy Mangrove Channels",
    imageUrl: "https://www.dreamholidayskerala.com/blog/wp-content/uploads/2025/10/Kadamakudy-1024x683.jpg",
    desc: "A peaceful cluster of tiny islands on the outer edge of Cochin. Features endless views of traditional polders and narrow country boat lanes.",
    lat: 10.0514, lng: 76.2641,
  },
  // IDUKKI
  {
    id: 25, district: "Idukki",
    title: "Kolukkumalai Eastern Sunrise Ridge",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/20/9e/8c/caption.jpg?w=1200&h=1200&s=1",
    desc: "The highest organic tea estate in the world. Walk down the unpaved cliff trail at dawn to watch the cloud-bed valleys split open.",
    lat: 10.0284, lng: 77.2241,
  },
  {
    id: 26, district: "Idukki",
    title: "Anakkulam Wild Elephant Stream",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/b0/c0/ab/caption.jpg?w=1200&h=-1&s=1",
    desc: "A unique natural river clearing where herds of wild elephants regularly emerge from the dense reserve forest borders to drink mineral waters.",
    lat: 10.1615, lng: 76.9129,
  },
  {
    id: 27, district: "Idukki",
    title: "Urumbikkara Off-Road Cliff Peak",
    imageUrl: "https://keralabee.com/wp-content/uploads/2023/09/IMG_20230905_233331-jpg.webp",
    desc: "An incredible high-altitude plateau reachable only via unpaved rocky trails. Features abandoned estate buildings and endless green ridges.",
    lat: 9.5841, lng: 76.9112,
  },
  // KOTTAYAM
  {
    id: 28, district: "Kottayam",
    title: "Illikkal Kallu Apex Monolith",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/05/0d/74/scenic-paradise.jpg?w=1200&h=1200&s=1",
    desc: "A monumental 4000-foot split rock formation offering sweeping panoramic views across the Western Ghats peaks.",
    lat: 9.7531, lng: 76.8210,
  },
  {
    id: 29, district: "Kottayam",
    title: "Ilaveezha Poonchira Valley",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/45/ae/a6/elaveezhapoonchira.jpg?w=900&h=-1&s=1",
    desc: "Meaning 'the valley where leaves don't fall.' A pristine, bowl-shaped green plateau sitting thousands of feet high with zero trees and endless horizons.",
    lat: 9.8124, lng: 76.7912,
  },
  {
    id: 30, district: "Kottayam",
    title: "Teekoy Spice Plantation Woods",
    imageUrl: "https://img.avianexperiences.com/attractions/5e54bc26-667e-4831-814d-686392e8ce3e",
    desc: "A quiet, low-altitude mountain valley town filled with dense clove, rubber, and vanilla plantations flanked by hidden stream networks.",
    lat: 9.7124, lng: 76.7141,
  },
  // ALAPPUZHA
  {
    id: 31, district: "Alappuzha",
    title: "Kakkathuruthu Island of Crows",
    imageUrl: "https://www.keralatourism.org/images/newsbytes/large/kakkathuruthu_in_nat_geo_s_must_visit_list20161101050212_1868_1.jpg",
    desc: "A tiny, thin strip of land inside Vembanad Lake. Famous for quiet sunset vistas where traditional fishermen cast nets against golden skies.",
    lat: 9.8712, lng: 76.3421,
  },
  {
    id: 32, district: "Alappuzha",
    title: "Pathiramanal Secret Island Loop",
    imageUrl: "https://www.dtpcalappuzha.com/uploads/picture_gallery/gallery_images/pathiramanal-island-20230524133601418589.webp",
    desc: "A floating wilderness sanctuary in the middle of backwaters. Reachable only via country canoe, it acts as a quiet haven for migratory birds.",
    lat: 9.6124, lng: 76.3841,
  },
  {
    id: 33, district: "Alappuzha",
    title: "Thottappally Isolated Coast",
    imageUrl: "https://www.dtpcalappuzha.com/uploads/picture_gallery/gallery_images/thottapally-20230524151753106429.webp",
    desc: "Where the spillway system meets the open ocean. A dark-sand, dramatic beach boundary lined with coastal trees and completely free of vendors.",
    lat: 9.3142, lng: 76.3912,
  },
  // PATHANAMTHITTA
  {
    id: 34, district: "Pathanamthitta",
    title: "Gavi Deep Evergreen Forest Route",
    imageUrl: "https://www.keralatourism.org/images/microsites/periyar/thekkady-1024x768.jpg",
    desc: "A strictly protected wilderness area inside reserve boundaries. Thick mossy roads, deep water reservoirs, and sightings of rare wildlife.",
    lat: 9.4384, lng: 77.1662,
  },
  {
    id: 35, district: "Pathanamthitta",
    title: "Chittar Lake Quiet Catchment",
    imageUrl: "https://gaviya.com/wp-content/uploads/2024/08/chittar-dam.jpg",
    desc: "A completely calm water reservoir hidden away behind thick rubber hills. Features crystal-clear shores and absolute quietude.",
    lat: 9.3124, lng: 76.8412,
  },
  {
    id: 36, district: "Pathanamthitta",
    title: "Charalkunnu Secluded Hill Station",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-CRToAt3j2a3vWZ2zhsuoDaC38-tOgOCWUQ&s",
    desc: "A tiny, low-profile hill clearing providing exceptional, peaceful panoramic views of the entire winding Pamba River valley below.",
    lat: 9.3841, lng: 76.7124,
  },
  // KOLLAM
  {
    id: 37, district: "Kollam",
    title: "Munroe Island Mangrove Canoe Route",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/03/a4/6c/2a/munroe-island-canoe-tours.jpg?w=1200&h=-1&s=1",
    desc: "A labyrinth of miniature canal networks weaving underneath wild mangroves. Hire a tiny hand-paddled canoe at dawn along quiet banks.",
    lat: 8.9878, lng: 76.6224,
  },
  {
    id: 38, district: "Kollam",
    title: "Rosemala Hidden Valley Overlook",
    imageUrl: "https://indiano.travel/wp-content/uploads/2024/11/Rosemala-View-Point-f.jpg",
    desc: "Deep inside the wildlife sanctuary, this viewpoint offers a magnificent bird's-eye view of water loops that look exactly like giant green rose petals.",
    lat: 8.9512, lng: 77.1214,
  },
  {
    id: 39, district: "Kollam",
    title: "Thenmala Ancient Shola Trails",
    imageUrl: "https://www.keralatourism.org/images/eco-tourism/destinations/sentharuni-wild-life-sanctuary.jpg",
    desc: "India's first planned eco-tourism zone. Deep forest walking paths, structural suspension bridges, and silent, moss-covered wilderness tracks.",
    lat: 8.9012, lng: 77.1041,
  },
  // THIRUVANANTHAPURAM
  {
    id: 40, district: "Thiruvananthapuram",
    title: "Amboori Ashram Mountain Crest",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/88/aa/7f/kurisumala-ashram.jpg?w=900&h=-1&s=1",
    desc: "A peaceful settlement bordered by deep water reservoirs and a monolithic rock pinnacle. Hidden away from standard city routes.",
    lat: 8.4812, lng: 77.1841,
  },
  {
    id: 41, district: "Thiruvananthapuram",
    title: "Ponmudi Misty Hairpin Ridge",
    imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/75/e3/cd/ponmudi.jpg?w=900&h=500&s=1",
    desc: "Ascend past 22 dramatic mountain hairpin curves to find a stunning hill peak permanently blanketed by rolling fog and cold mountain air.",
    lat: 8.7612, lng: 77.1141,
  },
  {
    id: 42, district: "Thiruvananthapuram",
    title: "Kappil Beach Estuary Overlook",
    imageUrl: "https://www.keralatourism.org/_next/image/?url=http%3A%2F%2F127.0.0.1%2Fktadmin%2Fimg%2Fpages%2Ftablet%2Fkappil-beach-1727452074_793df661390d99a3fac2.webp&w=1920&q=75",
    desc: "A breathtaking coastal stretch where a high cliff ridge separates the crashing waves of the Arabian Sea from the completely silent Edava Lake.",
    lat: 8.7841, lng: 76.6812,
  },
];

// ─── Pure utility — Haversine distance ───────────────────────────────────────
function haversineKm(from: Coords, to: Coords): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pill badge showing GPS radar status */
function RadarBadge({ status }: { status: GpsStatus }) {
  const isReady = status === 'ready';
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] sm:text-[11px] text-zinc-400 font-medium select-none">
      <span
        className={`h-1.5 w-1.5 rounded-full animate-pulse ${
          isReady ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
        }`}
      />
      {status === 'searching' ? 'Locating…' : isReady ? 'Radar Active' : 'Radar Off-Grid'}
    </div>
  );
}

/** Single place card */
interface PlaceCardProps {
  place: HiddenPlace;
  distKm: number;
  onClick: () => void;
}

function PlaceCard({ place, distKm, onClick }: PlaceCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View details for ${place.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 transition-all duration-300 group cursor-pointer"
    >
      {/* Image */}
      <div className="w-full h-44 sm:h-52 bg-zinc-800 relative overflow-hidden flex-shrink-0">
        <img
          src={place.imageUrl}
          alt={place.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Image fallback */}
        <div
          className="absolute inset-0 bg-zinc-800 items-center justify-center hidden"
          aria-hidden="true"
        >
          <span className="text-zinc-600 text-4xl">🏔️</span>
        </div>
        {/* District tag */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-800/40">
            📍 {place.district}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-extrabold text-zinc-100 group-hover:text-red-500 transition-colors duration-300 line-clamp-1">
            {place.title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {place.desc}
          </p>
        </div>
        <div className="mt-auto pt-3.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono text-[11px] font-black text-red-400">
            🧭 {distKm} km away
          </span>
          <span className="font-bold text-zinc-500 group-hover:text-red-400 transition-colors">
            View →
          </span>
        </div>
      </div>
    </article>
  );
}

/** Modal / drawer for a selected place */
interface PlaceModalProps {
  place: HiddenPlace;
  distKm: number;
  onClose: () => void;
}

function PlaceModal({ place, distKm, onClose }: PlaceModalProps) {
  // Lock body scroll on mount; restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={place.title}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[6000] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92dvh] overflow-y-auto shadow-2xl relative [-webkit-overflow-scrolling:touch]"
        style={{ scrollbarWidth: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="w-full h-48 sm:h-64 bg-zinc-800 relative flex-shrink-0">
          <img
            src={place.imageUrl}
            alt={place.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            className="absolute inset-0 bg-zinc-800 items-center justify-center hidden"
            aria-hidden="true"
          >
            <span className="text-zinc-600 text-5xl">🏔️</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/10 to-transparent pointer-events-none" />
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 bg-zinc-950/80 text-zinc-400 hover:text-zinc-100 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              {place.title}
            </h2>
            <p className="text-[10px] sm:text-[11px] font-mono font-bold text-red-400 mt-1">
              🧭 {distKm} km from you · {place.district} District
            </p>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl">
            <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">
              About this place
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {place.desc}
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="block w-full py-4 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-center rounded-xl font-bold text-white tracking-wide shadow-lg shadow-red-950/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Open Navigation Route 🗺️
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<HiddenPlace | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('searching');
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    mode: 'all',
    district: 'All Districts',
  });

  // ── Geolocation (runs once) ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
        setGpsStatus('ready');
      },
      () => setGpsStatus('failed'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  // ── Resolved origin for distance calc ───────────────────────────────────
  const origin: Coords = userCoords ?? DEFAULT_COORDS;

  // ── Pre-compute distances once per coords change — O(n) not O(n * renders) ──
  const spotsWithDist = useMemo(
    () =>
      KERALA_SPOTS.map((p) => ({
        ...p,
        distKm: haversineKm(origin, { lat: p.lat, lng: p.lng }),
      })),
    [origin.lat, origin.lng],
  );

  // ── Filter + sort (also memoised) ───────────────────────────────────────
  const displaySpots = useMemo(() => {
    return spotsWithDist
      .filter((p) => {
        if (filters.mode === 'nearby') return p.distKm <= NEARBY_RADIUS_KM;
        if (filters.mode === 'district') return p.district === filters.district;
        return true;
      })
      .sort((a, b) => a.distKm - b.distKm);
  }, [spotsWithDist, filters]);

  // ── Filter handlers ──────────────────────────────────────────────────────
  const toggleNearby = useCallback(() => {
    setFilters((prev) =>
      prev.mode === 'nearby'
        ? { mode: 'all', district: 'All Districts' }
        : { mode: 'nearby', district: 'All Districts' },
    );
  }, []);

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setFilters(
        val === 'All Districts'
          ? { mode: 'all', district: 'All Districts' }
          : { mode: 'district', district: val },
      );
    },
    [],
  );

  // ── Heading text ─────────────────────────────────────────────────────────
  const viewingLabel =
    filters.mode === 'nearby'
      ? `Nearby destinations within ${NEARBY_RADIUS_KM} km`
      : filters.mode === 'district'
      ? `Destinations in ${filters.district}`
      : gpsStatus === 'ready'
      ? 'All nearby destinations'
      : 'All destinations';

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-x-hidden select-none font-sans">

      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-6xl w-full mx-auto">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Logo with text fallback */}
            <img
              src="/logo.png"
              alt="Supsaf"
              className="h-9 sm:h-11 w-auto object-contain rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                document.getElementById('text-logo')?.removeAttribute('style');
              }}
            />
            <h1
              id="text-logo"
              style={{ display: 'none' }}
              className="text-2xl sm:text-3xl font-black text-red-500 tracking-tighter"
            >
              supsaf
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              <RadarBadge status={gpsStatus} />
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 tracking-wider bg-red-950/40 text-red-400 border border-red-900/40 rounded-md">
                Beta
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
            <button
              onClick={toggleNearby}
              aria-pressed={filters.mode === 'nearby'}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                filters.mode === 'nearby'
                  ? 'bg-red-950/40 text-red-400 border-red-900/60 shadow-lg shadow-red-900/10'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              📍 {filters.mode === 'nearby' ? `Nearby (<${NEARBY_RADIUS_KM} km)` : 'Filter Nearby'}
            </button>

            {/* District select — native arrow, cross-browser safe */}
            <div className="relative">
              <select
                value={filters.district}
                onChange={handleDistrictChange}
                aria-label="Filter by district"
                className="bg-zinc-900 text-zinc-200 border border-zinc-800 pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-zinc-600 cursor-pointer appearance-none active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-zinc-950 text-zinc-300">
                    {d === 'All Districts' ? ' All Places' : ` ${d}`}
                  </option>
                ))}
              </select>
              {/* Cross-browser dropdown arrow */}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
                ▾
              </span>
            </div>
          </div>
        </header>

        {/* ── GPS fallback notice ───────────────────────────────────────── */}
        {gpsStatus === 'failed' && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400"
          >
            <span className="text-amber-400 text-base" aria-hidden="true">⚠️</span>
            <span>
              Location unavailable{' '}
              <strong className="text-zinc-300"></strong>Enable location
              access for accurate results.
            </span>
          </div>
        )}

        {/* ── Status bar ───────────────────────────────────────────────── */}
        <div className="mb-8 bg-zinc-900/20 border border-zinc-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-base" aria-hidden="true">📍</span>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide uppercase">
              {viewingLabel}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 font-bold flex-shrink-0">
            {displaySpots.length} {displaySpots.length === 1 ? 'spot' : 'spots'} found
          </span>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        <section aria-label="Hidden places grid">
          {displaySpots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displaySpots.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  distKm={place.distKm}
                  onClick={() => setSelectedPlace(place)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl max-w-md mx-auto p-4">
              <p className="text-zinc-400 text-sm">
                No hidden spots found for this filter. Try a different district or clear the filter.
              </p>
              <button
                onClick={() => setFilters({ mode: 'all', district: 'All Districts' })}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:border-zinc-700 transition-all"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {selectedPlace && (
        <PlaceModal
          place={selectedPlace}
          distKm={
            spotsWithDist.find((p) => p.id === selectedPlace.id)?.distKm ?? 0
          }
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-6 px-4 sm:px-10 mt-12">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
          <p>
            © {new Date().getFullYear()}{' '}
            <span className="text-zinc-400 font-bold">supsaf</span>. All rights reserved.
          </p>
          <nav aria-label="Social links" className="flex items-center gap-6">
            <a
              href="https://instagram.com/supsaf/"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
            >
              <span aria-hidden="true">📸</span> Instagram
            </a>
            <a
              href="https://unsplash.com/@supsaf"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-red-500 transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
            >
              <span aria-hidden="true">🖼️</span> Unsplash
            </a>
          </nav>
        </div>
      </footer>

      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style jsx global>{`
        /* Hide Next.js dev overlays */
        .nextjs-static-indicator,
        #nextjs-wrd,
        [data-nextjs-toast],
        nextjs-portal {
          display: none !important;
        }
        /* Hide scrollbars in modal */
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
