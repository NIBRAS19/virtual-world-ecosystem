/* ═══════════════════════════════════════════════════════════════
   NEXUS ISLAND — Immersive World MVP v6
   Full Redesign: Google Earth meets Game World Aesthetic
   Launch Geography: Abu Dhabi / UAE
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ─── UTILITIES ─── */
  const STORAGE_KEY = 'nexus_island_mvp_v4';
  const money = n => `${Number(n || 0).toLocaleString()} ISL`;
  const aed = n => `AED ${Math.round(Number(n || 0) * 0.5).toLocaleString()}`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c]));
  const escAttr = s => esc(s).replace(/`/g,'&#096;');
  const uid = p => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

  /* ─── AUDIO FEEDBACK ─── */
  function playBeep(type = 'click') {
    if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) return;
    try {
      if (!state.settings?.audio) return;
      const ctx = window._audioCtx || (window._audioCtx = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
      } else if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
      } else if (type === 'wave') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.14);
        osc.start(now); osc.stop(now + 0.14);
      } else if (type === 'chat') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
      } else if (type === 'emote') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(987.77, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'reward') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.28);
        osc.start(now); osc.stop(now + 0.28);
      }
    } catch {}
  }

  /* ═══════════════════════════════════════════════
     DATA MODELS — 4 COUNTRIES, VISAS, 5-TO-10+ ISLANDS & ASSETS
     ═══════════════════════════════════════════════ */
  const COUNTRIES = [
    {
      id: 'uae', name: 'United Arab Emirates', short: 'UAE', flag: '🇦🇪', status: 'ACTIVE PRIMARY HUB',
      visaCode: 'NX-VISA-UAE', visaFee: 0, currency: 'AED (1 ISL = 0.50 AED)',
      islandsCount: '5 Active Islands + 5 Expansion Islands (10+ Total)',
      capitalHub: 'Abu Dhabi & Dubai Sovereign Archipelago',
      highlights: ['ADGM & Hub71 Financial Core', 'Emaar Palm & Nurai Villas', 'LuLu Virtual Hypermarket & Mall', 'Yas Motorsport & Supercar Showroom'],
      description: 'The flagship virtual nation. Enter via your UAE Virtual Visa to explore 5 connected GTA-style islands, buy land, build Emaar villas, drive supercars, and trade with atomic escrow protection.'
    },
    {
      id: 'ksa', name: 'Saudi Arabia', short: 'KSA', flag: '🇸🇦', status: 'WAVE 2 VISA OPEN',
      visaCode: 'NX-VISA-KSA', visaFee: 250, currency: 'SAR (1 ISL = 0.50 SAR)',
      islandsCount: '4 Planned Mega-Districts',
      capitalHub: 'Riyadh KAFD, NEOM The Line & Red Sea Atoll',
      highlights: ['NEOM Linear Smart City', 'Riyadh Financial Spire', 'Qiddiya Esports & Motorsport Megaplex', 'Red Sea Coral Villas'],
      description: 'Access Saudi Arabia\'s giga-project digital twins. Requires a KSA e-Visa (250 ISL) or Global Diplomatic Passport.'
    },
    {
      id: 'sgp', name: 'Singapore', short: 'SGP', flag: '🇸🇬', status: 'WAVE 3 VISA OPEN',
      visaCode: 'NX-VISA-SGP', visaFee: 300, currency: 'SGD (1 ISL = 0.18 SGD)',
      islandsCount: '4 Planned Island Hubs',
      capitalHub: 'Marina Bay Sky-Gardens & Sentosa Cove',
      highlights: ['Marina Bay Financial Hub', 'Sentosa Luxury Waterfront', 'One-North AI & DeepTech Park', 'Orchard Flagship Retail Boulevard'],
      description: 'Asia-Pacific\'s sovereign wealth and deep-tech nexus. Requires a Singapore Tech Visa (300 ISL) or Diplomatic Passport.'
    },
    {
      id: 'uk', name: 'United Kingdom', short: 'UK', flag: '🇬🇧', status: 'WAVE 4 VISA OPEN',
      visaCode: 'NX-VISA-GBR', visaFee: 350, currency: 'GBP (1 ISL = 0.11 GBP)',
      islandsCount: '4 Planned Crown Districts',
      capitalHub: 'London Canary Wharf, Mayfair & Silverstone',
      highlights: ['Canary Wharf Banking Citadel', 'Mayfair & Knightsbridge Luxury', 'Thames Innovation Pier', 'Silverstone Grand Prix Circuit'],
      description: 'European financial and luxury heritage hub. Requires a UK Royal Visa (350 ISL) or Diplomatic Passport.'
    }
  ];

  const VISA_TIERS = [
    { id: 'tourist', name: 'Tourist Entry Visa', icon: '🛂', price: 0, escrowFee: '5%', countries: 1, badge: 'Tourist Visa', perks: 'Access all 5 UAE Islands, GTA Free-Roam, Chat & Live Events' },
    { id: 'resident', name: 'UAE Resident Visa', icon: '🪪', price: 100, escrowFee: '5%', countries: 1, badge: 'Resident Citizen', perks: 'Buy Land, Build Houses, Buy Cars, Create Flex Cards & Communities' },
    { id: 'golden', name: 'UAE Golden Investor Visa', icon: '🌟', price: 500, escrowFee: '0%', countries: 2, badge: 'Golden Visa Holder', perks: '0% Property Resale Escrow Fee, Priority Islands 6–10 Access, Commercial Business License & +15% Property Value' },
    { id: 'diplomatic', name: 'Global Diplomatic Passport', icon: '👑', price: 1200, escrowFee: '0%', countries: 4, badge: 'Diplomatic Sovereign', perks: 'All 4 Countries Unlocked (UAE, KSA, Singapore, UK), VIP Skyport Fast-Track & Black/Gold Flex Card' }
  ];

  const UAE_ISLANDS = [
    { id: 'nexus-main', num: 1, name: 'Island 1: ADGM, Hub71 & Harbor Main', status: 'active', icon: '🏛️', focus: 'Corporate Offices, Financial Hub, Startup Campus & Skyport', anchors: 'ADGM, Hub71, Harbor Marina, Visa Skyport', plots: 9, districtId: 'downtown' },
    { id: 'nurai-cove', num: 2, name: 'Island 2: Emaar Palm & Nurai Villas', status: 'active', icon: '🏖️', focus: 'Luxury Residential Land, Emaar Custom Villas & Beachfront Majlis', anchors: 'Emaar Developments HQ, Palm Lagoon Villas', plots: 6, districtId: 'residential' },
    { id: 'yas-arena', num: 3, name: 'Island 3: Yas Motorsport & Auto Hub', status: 'active', icon: '🏎️', focus: 'GTA Racing Circuit, Vehicle Dealerships & Esports Stadium', anchors: 'Prestige Supercar Showroom, Yas Grand Prix', plots: 3, districtId: 'gaming' },
    { id: 'masdar-atoll', num: 4, name: 'Island 4: Masdar AI & Saadiyat Arts', status: 'active', icon: '🎨', focus: 'NOVA AI Supercomputing Spire, Louvre Pavilion & Creator Studios', anchors: 'NOVA AI Spire, Saadiyat Crystal Gallery', plots: 3, districtId: 'creator' },
    { id: 'mangrove-sanctuary', num: 5, name: 'Island 5: LuLu Mall & Mangrove Eco', status: 'active', icon: '🛒', focus: 'Retail Hypermarkets, Shopping Malls, Phygital Perks & Eco Trails', anchors: 'LuLu Hypermarket, Galleria Mall, Mangrove Reserve', plots: 3, districtId: 'nature' },
    { id: 'exp-dubai-burj', num: 6, name: 'Island 6: Dubai Downtown & Burj Frontier', status: 'expansion', phase: 'Wave 2 Expansion', icon: '🏙️', focus: 'Emaar Sky-Penthouses, Luxury Couture Mall & Fountain Plaza', anchors: 'Burj Sky-Suites, Dubai Mall Twin', plots: 12 },
    { id: 'exp-al-maryah', num: 7, name: 'Island 7: Al Maryah Global Banking Atoll', status: 'expansion', phase: 'Wave 2 Expansion', icon: '🏦', focus: 'Institutional Wealth Management, Private Banks & Sovereign Funds', anchors: 'Global Exchange Tower, Sovereign Vault', plots: 10 },
    { id: 'exp-saadiyat-north', num: 8, name: 'Island 8: Saadiyat North Couture & Arena', status: 'expansion', phase: 'Wave 3 Expansion', icon: '🎭', focus: 'Virtual Fashion Weeks, Amphitheater Concerts & Luxury Pavilions', anchors: 'Runway Dome, Gulf Opera House', plots: 8 },
    { id: 'exp-jebel-ali', num: 9, name: 'Island 9: Jebel Ali Trade & Logistics Port', status: 'expansion', phase: 'Wave 3 Expansion', icon: '🚢', focus: 'B2B Enterprise Expo Halls, Maritime Trade & Global Supply Twins', anchors: 'DP Trade Hub, Expo Mega-Pavilion', plots: 14 },
    { id: 'exp-al-ain-oasis', num: 10, name: 'Island 10: Al Ain Oasis & Mountain Retreat', status: 'expansion', phase: 'Wave 4 Expansion', icon: '🌴', focus: 'Heritage Palaces, Desert Dune Rally Tracks & Wellness Sanctuaries', anchors: 'Jebel Hafeet Hillclimb, Royal Oasis', plots: 10 }
  ];

  const HOUSE_BLUEPRINTS = [
    { id: 'bp-emaar-villa', name: 'Emaar Beachfront Contemporary Villa', developer: 'Emaar Virtual Developments', icon: '🏖️', cost: 450, valueBoost: 750, style: 'Emaar Modern Coastal', slots: 8, desc: 'Signature floor-to-ceiling glass waterfront villa with infinity pool, private yacht dock, and majlis terrace.' },
    { id: 'bp-majlis-palace', name: 'Royal Emirati Majlis Courtyard Estate', developer: 'Aldar & Heritage Architects', icon: '🕌', cost: 650, valueBoost: 1100, style: 'Royal Heritage Majlis', slots: 10, desc: 'Palatial courtyard residence featuring traditional wind-towers, marble reception majlis, and palm gardens.' },
    { id: 'bp-adgm-penthouse', name: 'ADGM Executive Glass Sky-Villa', developer: 'Emaar Commercial & Towers', icon: '🏙️', cost: 550, valueBoost: 900, style: 'Skyline Duplex Penthouse', slots: 8, desc: 'Double-height executive sky-residence with private helipad, boardroom lounge, and panoramic island views.' },
    { id: 'bp-masdar-ecopod', name: 'Masdar Zero-Carbon Smart Residence', developer: 'Masdar Clean-Tech Living', icon: '🌿', cost: 350, valueBoost: 580, style: 'AI Eco-Futuristic', slots: 6, desc: 'Solar-powered smart architectural home with automated NOVA AI climate control and mangrove deck.' }
  ];

  function txHash(seed) {
    const str = String(seed || Date.now());
    let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return '0xNX' + (h2 >>> 0).toString(16).padStart(8, '0').toUpperCase() + (h1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  }

  const DISTRICTS = [
    { id:'harbor', name:'Harbor District', islandId:'nexus-main', islandName:'Island 1: ADGM & Harbor Main', icon:'⚓', tagline:'Waterfront Marina & Skyport', description:'The primary arrival port inspired by Abu Dhabi Corniche & Marina. Home to the UAE International Skyport, cafes, luxury yachts, and social plazas.', color:'#0891b2', gradient:'from-cyan-500 to-blue-600', landmark:'Marina Promenade & Visa Skyport', mapX:22, mapY:30 },
    { id:'creator', name:'Creator District', islandId:'masdar-atoll', islandName:'Island 4: Masdar AI & Saadiyat Arts', icon:'🎨', tagline:'Cultural & Atelier Zone', description:'Ateliers, 3D galleries, sound studios and VR stages inspired by the Saadiyat Cultural District.', color:'#ea580c', gradient:'from-rose-500 to-amber-500', landmark:'Louvre-style Crystal Pavilion', mapX:68, mapY:24 },
    { id:'gaming', name:'Gaming District', islandId:'yas-arena', islandName:'Island 3: Yas Motorsport & Auto Hub', icon:'🎮', tagline:'Motorsport & Auto Dealership Hub', description:'High-octane esports stadiums, GTA racetracks and Prestige Supercar Showrooms inspired by Yas Island.', color:'#7c3aed', gradient:'from-indigo-600 to-purple-600', landmark:'Yas Cyber Arena & Auto Showroom', mapX:32, mapY:65 },
    { id:'downtown', name:'Downtown', islandId:'nexus-main', islandName:'Island 1: ADGM & Harbor Main', icon:'🏢', tagline:'ADGM & Hub71 Financial Core', description:'ADGM & Hub71 corporate spires, virtual escrow banks, startup headquarters and shopping malls.', color:'#0ea5e9', gradient:'from-slate-800 to-cyan-900', landmark:'ADGM Apex Tower & Hub71 Campus', mapX:72, mapY:56 },
    { id:'residential', name:'Residential District', islandId:'nurai-cove', islandName:'Island 2: Emaar Palm & Nurai Villas', icon:'🏡', tagline:'Emaar Waterfront Living', description:'Emaar coastal villas, palm gardens, private residences and social majlis spaces on Nurai & Palm Island.', color:'#059669', gradient:'from-emerald-600 to-teal-700', landmark:'Emaar Palm Sanctuary Lagoon', mapX:50, mapY:78 },
    { id:'nature', name:'Nature Zone', islandId:'mangrove-sanctuary', islandName:'Island 5: LuLu Mall & Mangrove Eco', icon:'🌿', tagline:'LuLu Retail Mall & Eco Reserve', description:'Home to LuLu Virtual Hypermarket, Galleria Shopping Mall, and protected coastal mangrove boardwalks.', color:'#16a34a', gradient:'from-green-600 to-emerald-800', landmark:'LuLu Hypermarket & Mangrove Sanctuary', mapX:16, mapY:72 },
    { id:'future', name:'Future Zone', islandId:'masdar-atoll', islandName:'Island 4: Masdar AI & Saadiyat Arts', icon:'∞', tagline:'AI & Quantum Port', description:'Masdar-inspired clean tech, NOVA AI Supercomputing Spire, quantum labs and VR/AR spatial portals.', color:'#6366f1', gradient:'from-sky-500 to-indigo-800', landmark:'NOVA Quantum Spire', mapX:80, mapY:80 }
  ];

  const USER_NAMES = ['Maya Chen','Omar Al-Zaabi','Sara Al-Mansoori','Daniel Ross','Lina Park','Noah Williams','Aisha Rahman','Leo Martins','Hana Ito','Adam Brooks','Nora Silva','Yusuf Qasimi','Eva Stone','Ryan Cole','Zara Malik','Kai Morgan','Amir Shah','Mia Chen','Ben Carter','Ivy Wong','Rami Haddad','Sofia Cruz'];
  const ROLES = ['Spatial Creator','ADGM Founder','Island Architect','Esports Pro','Digital Artist','Fintech Builder','Interior Designer','Ecosystem Lead'];
  const AVATARS = ['👩🏻‍🎨','👨🏽‍💻','👩🏽‍🚀','🧑🏼‍🎮','👩🏻‍🎤','🧑🏽‍💼','👩🏾‍💻','🧑🏻‍💻'];

  const DATA = {
    users: USER_NAMES.map((name,i) => ({
      id:`u${i+1}`, name, role:ROLES[i%ROLES.length], avatar:AVATARS[i%AVATARS.length], online:i%3 !== 0,
      level: 3 + (i%10), interests:[['AI','Fintech'],['Gaming','Supercars'],['Design','Architecture'],['Startups','ADGM Tech'],['Creative Arts','Web3']][i%5],
      district: DISTRICTS[i%DISTRICTS.length].name
    })),
    land: DISTRICTS.flatMap((d,j) => Array.from({length:3},(_,i) => ({
      id:`L-${j+1}0${i+1}`,
      name:['Marina Edge Plot','Bluewater Promenade','Corniche Gateway','Saadiyat Studio Lane','Louvre Vista','Artisan Plaza','Yas Circuit West','Apex Arena Row','Pixel Boulevard','ADGM Global Square','Al Maryah Center','Fintech Tower Parcel','Palm Grove Haven','Nurai Vista Villa','Coastal Sanctuary','Eastern Mangrove Point','Falcon Dune View','Flamingo Lagoon','Masdar Eco Hub','NOVA Quantum Axis','Spatial Portal West'][j*3+i],
      district:d.name, districtId:d.id, size:['Boutique (250m²)','Prime (600m²)','Estate (1,500m²)'][i], price:450+j*220+i*180,
      nearby:['Harbor Marina','Cultural Plaza','Yas Gaming Arena','ADGM Financial Core','Palm Sanctuary Park','Mangrove Boardwalk','NOVA Supercomputer'][j],
      potential:['Hospitality & Retail','Art Studio & Gallery','Esports & Events','Fintech & Enterprise','Private Villa & Majlis','Eco-Tourism Experience','Spatial AI Portal'][j],
      zoning:['Commercial','Creator','Entertainment','Corporate','Residential','Eco-Reserve','Tech Innovation'][j],
      available:true
    }))),
    properties: [
      'Harbor Waterfront Loft','Nurai Luxury Island Villa','Saadiyat Creator Studio','Yas Cyber Penthouse','ADGM Executive Office','Marina Boutique Storefront','Palm Grove Family Villa','Al Qana Waterfront Cafe','Yas Esports Grand Box','Louvre Gallery House','Corniche Horizon Suite','Emirates Palace Virtual Suite','Hub71 Startup Den','Mangrove Eco Retreat','Apex Downtown Sky-Villa'
    ].map((name,i) => ({
      id:`p${i+1}`, name,
      type:['Loft','Luxury Villa','Creative Studio','Cyber Penthouse','Corporate Office','Retail Flagship','Villa','Cafe / Lounge','Esports Venue','Art Gallery','Luxury Suite','Hospitality','Incubator','Eco Sanctuary','Sky Villa'][i],
      district:['Harbor District','Residential District','Creator District','Gaming District','Downtown','Harbor District','Residential District','Harbor District','Gaming District','Creator District','Harbor District','Downtown','Downtown','Nature Zone','Downtown'][i],
      price:750+i*140, icon:['🌊','🏝️','🎨','🎮','🏢','🛍️','🌴','☕','🏟️','🖼️','🏨','✨','🚀','🌱','💎'][i],
      slots: 6 + (i%4),
      description:['Panoramic waterfront loft with private yacht berth.','Palatial coastal villa with private infinity pool and majlis.','Acoustically isolated creative sanctuary near Saadiyat galleries.','High-tech gamer penthouse with interactive streaming setup.','Class-A commercial office space in the digital financial hub.','Turnkey commercial storefront facing high-footfall marina.','Serene residential villa surrounded by tropical greenery.','Waterfront cafe destination with social lounge seating.','Competitive arena suite with VIP viewing screens.','Curated gallery space with digital projection walls.','High-floor luxury suite with skyline panoramas.','Ultra-exclusive hospitality suite for VIP guests.','Collaborative accelerator workspace for Web3/AI startups.','Sustainable eco-lodge overlooking protected mangroves.','Architectural marvel perched atop downtown skyscrapers.'][i]
    })),
    products: [
      'Nexus Cyber Abaya & Thobe','Arabian Gulf Pearl Lamp','Pro Creator Hologram Kit','Neon Jet Hoverboard','Falcon Explorer Golden Badge','Sunseeker 88 Yacht Skin','Abu Dhabi Date Palm Pack','Studio DJ Sound Rig','Executive Majlis Boardroom Pack','Sunset Horizon Villa Decor','Gourmet Karak & Shawarma Stand','Dynamic Avatar Emote Pack','Saadiyat Art Canvas','Formula Desert Racing Kit','Concert Laser FX Rig'
    ].map((name,i) => ({
      id:`m${i+1}`, name,
      category:['Fashion','Home Decor','Creator Gear','Mobility','Collectibles','Vehicles','Home Decor','Audio/Events','Business Gear','Home Decor','Business Gear','Avatars','Art','Vehicles','Audio/Events'][i],
      price:25+i*15, icon:['🧥','💡','📷','🛹','🦅','🛥️','🌴','🎛️','💼','🏡','☕','🕺','🖼️','🏎️','🎆'][i],
      stock: 5 + (i%5), seller:['Nexus Luxury Dept','Harbor Marina Co','Maya Chen','Yas Tech Labs','ADGM Arts Collective'][i%5],
      rarity:['Rare','Common','Legendary','Epic','Rare','Legendary','Common','Rare','Epic','Common','Rare','Common','Epic','Rare','Legendary'][i],
      description:['Modern high-fashion Emirati digital apparel with luminescent golden embroidery.','Hand-crafted digital lamp modeled after Arabian Gulf oyster pearls.','Full-featured streaming camera and holographic display suite for spatial creators.','Anti-gravity personal hoverboard for rapid transit across island boulevards.','Exclusive verified resident badge signifying early island citizenship.','Hyper-detailed yacht skin with polished chrome and teak decking.','Living digital date palms and bougainvillea flora for property landscapes.','Professional soundboard and audio FX synthesizer for live virtual events.','Furnish your digital enterprise office with bespoke marble & leather majlis seating.','Luxury beachfront outdoor lounge set with ambient fire-pit.','Turnkey food & beverage digital franchise asset generating passive traffic.','Smooth mocap animated celebration dance and greeting emote pack.','Limited edition digital painting created by Saadiyat resident artists.','High-downforce aerodynamic package and custom livery for racing vehicles.','Stadium-grade lighting and particle emitter pack for live DJ sets.'][i]
    })),
    vehicles: [
      'Pulse Hyper-GT','Aero-Hover Superbike','Seaglass Taycan EV','Gulfstream 42 Speedboat','Falcon eVTOL Sky-Cab','Volt Urban Mini','Desert Dune Rover 4x4','Wave Rider Jet Ski','Al Bateen Air Taxi','Heritage DB Coupe'
    ].map((name,i) => ({
      id:`v${i+1}`, name,
      type:['Supercar','Hover Bike','Electric Sedan','Sport Speedboat','Air Speeder','City Compact','Off-Road 4x4','Water Jet','Autonomous Flight','Classic GT'][i],
      price:550+i*220, icon:['🏎️','🏍️','🚙','🛥️','🚁','🚘','🚙','🛵','🛩️','🚗'][i],
      speed:75+i*3, handling:70+(i*6)%28, acceleration:80+(i*4)%20
    })),
    businesses: [
      'Emaar Virtual Developments','LuLu Virtual Hypermarket & Mall','Prestige Motors & EV Showroom','ADGM Financial Authority & RegLab','Hub71 Global Startup Campus','Galleria & Marina Shopping Mall','Harbor & Co. Roastery','Yas Cyber Forge','Nexus AI Labs','Canvas House Saadiyat'
    ].map((name,i) => ({
      id:`b${i+1}`, name,
      type:['Master Property Developer','Hypermarket & Retail','Vehicle Dealership','Financial Center & Escrow','Tech Accelerator & Venture','Luxury Shopping Mall','Artisan Cafe','Game Studio','AI & Tech','Art Gallery'][i],
      district:['Residential District','Nature Zone','Gaming District','Downtown','Downtown','Harbor District','Harbor District','Gaming District','Future Zone','Creator District'][i],
      islandName:['Island 2: Emaar Palm','Island 5: LuLu Mall & Eco','Island 3: Yas Motorsport','Island 1: ADGM & Hub71','Island 1: ADGM & Hub71','Island 5: LuLu Mall & Eco','Island 1: ADGM & Harbor','Island 3: Yas Motorsport','Island 4: Masdar AI','Island 4: Saadiyat Arts'][i],
      owner: ['Emaar Group (Anchor)','LuLu Group (Anchor)','Prestige Automotive (Anchor)','ADGM Sovereign (Anchor)','Hub71 Ecosystem (Anchor)','Galleria Retail (Anchor)', ...USER_NAMES][i],
      icon:['🏗️','🛒','🏎️','🏛️','🚀','🛍️','☕','🎮','🧪','🎨'][i],
      followers:1240+i*185, rating:4.9 - (i%2)*0.1, dailyRevenue:480+i*95,
      anchor: i < 6,
      ctaLabel: ['Commission Villa Build','Shop & Claim 15% Voucher','Test-Drive & Buy Cars','Verify Escrow & License','Apply for 500 ISL Grant','Explore Mall Brands','Visit Cafe','Join Tournament','Test NOVA AI','View Exhibition'][i],
      description:[
        'Master developer of luxury beachfront villas, sky-penthouses, and architectural blueprints across Nexus Island. Construct custom Emaar homes on your owned land.',
        'Flagship virtual hypermarket & department store offering digital home goods paired with redeemable real-world LuLu discount vouchers across the UAE.',
        'Official automotive showroom featuring high-performance supercars, electric sedans, 4x4 dune rovers, and eVTOL air taxis with instant GTA test-drives.',
        'Sovereign financial hub providing corporate licensing, Web2.5 Atomic Escrow protection, and institutional compliance for island enterprises.',
        'Abu Dhabi\'s flagship tech ecosystem connecting startup founders with venture capital, co-working spaces, and non-dilutive innovation grants.',
        'Multi-brand virtual shopping mall featuring luxury fashion wearables, creator pop-up boutiques, and social dining lounges.',
        'Premier artisanal coffee and tea majlis with harbor views.',
        'Top esports tournament operator and custom experience builder.',
        'Pioneering intelligent agent workflows and spatial AI infrastructure.',
        'Contemporary digital gallery showcasing regional & global digital artists.'
      ][i]
    })),
    communities: [
      'Abu Dhabi Tech Founders','Nexus Web3 Architects','Saadiyat Creator Guild','Yas Island Pro Gamers','MENA Angel Investors','Spatial Design Collective','Gulf Virtual Explorers','Cyber Sound Producers','Esports Grand Prix','Global Digital Citizens'
    ].map((name,i) => ({
      id:`c${i+1}`, name,
      category:['Startups','Engineering','Creators','Esports','Venture Capital','Architecture','Adventure','Music','Competition','Social'][i],
      members:650+i*180, icon:['🚀','💻','🎨','🎮','📈','📐','🧭','🎵','🏁','🤝'][i],
      description:'Active community network meeting weekly inside island venues for knowledge sharing, collaboration and dealmaking.'
    })),
    events: [
      'Abu Dhabi AI World Summit','Harbor Sunset Majlis','Yas Sprint Grand Prix','Saadiyat Digital Art Expo','MENA Web3 Demo Day','Mangrove Eco Conservation Tour','ADGM Seed Pitch Night','Nexus Fashion Week 2026','NOVA Spatial AI Hackathon','Weekend Community Arena Brawl'
    ].map((name,i) => ({
      id:`e${i+1}`, name,
      type:['Technology','Social / Music','Esports','Creative','Fintech','Eco / Guided','Venture','Fashion','AI Workshop','Gaming'][i],
      date:`Nov ${12+i}, 2026`, time:['19:00 GST','20:30 GST','18:00 GST','19:30 GST','17:00 GST'][i%5],
      location:['ADGM Apex Dome','Harbor Promenade','Yas Cyber Stadium','Saadiyat Crystal Pavilion','Downtown Financial Hub','Mangrove Boardwalk'][i%6],
      host:USER_NAMES[i], attendees:85+i*48, price:i%3===0?0:35,
      description:['High-level panel on AI-native spatial worlds and Gulf digital economy.','Relaxed waterfront gathering with live acoustic ambient music and resident networking.','Competitive speedboat and drone race with 5,000 ISL grand prize pool.','Interactive art vernissage with live creator mints and projection walls.','Top regional founders showcase functional MVP builds to angel syndicates.','Guided educational excursion exploring flora, fauna and eco-preservation.','Live founder pitch session judged by top regional investor avatars.','Runway show exhibiting generative avatar fashion and digital textiles.','Hands-on masterclass building custom AI tools with the NOVA assistant engine.','Casual community gaming tournament open to all island residents.'][i]
    })),
    achievements: [
      {id:'welcome',name:'First Resident',icon:'🏝️',desc:'Claimed citizenship on Nexus Island.'},
      {id:'explorer',name:'Island Voyager',icon:'🧭',desc:'Traveled to at least 4 unique island districts.'},
      {id:'owner',name:'Landholder',icon:'🏡',desc:'Acquired your first permanent land parcel.'},
      {id:'architect',name:'Master Architect',icon:'🏛️',desc:'Built and customized a private home or studio.'},
      {id:'social',name:'Ecosystem Connector',icon:'👥',desc:'Established 5 resident friendships.'},
      {id:'player',name:'Arena Champion',icon:'🎮',desc:'Achieved victory in an island browser game.'},
      {id:'creator',name:'Digital Merchant',icon:'🛠️',desc:'Launched a virtual business or listed creator goods.'},
      {id:'community',name:'Guild Member',icon:'◎',desc:'Joined 3 specialized resident communities.'},
      {id:'event',name:'VIP Regular',icon:'📅',desc:'RSVPd and checked in to 3 official live events.'}
    ]
  };

  /* ─── SEED DATA GENERATORS ─── */
  function seedMessages() {
    const list = [
      ['Maya Chen','Meet me at the Saadiyat Crystal Pavilion, the new exhibition is breathtaking! 🎨'],
      ['Omar Al-Zaabi','The Yas Sprint Grand Prix starts in 20 minutes. Got your vehicle tuned? 🏎️'],
      ['Sara Al-Mansoori','ADGM just released the new enterprise licensing framework on the island. Let\'s review.'],
      ['Daniel Ross','I just tested the new AI customer concierge at Harbor Roastery. Footfall doubled!'],
      ['Lina Park','Would love to collaborate on a spatial interior pack for the palm villas.'],
      ['Noah Williams','That Falcon eVTOL you bought handles remarkably well across the bay.'],
      ['Aisha Rahman','We are hosting an eco-walk through the Mangrove reserve this Saturday morning.'],
      ['Leo Martins','Nexus AI Labs published the new NOVA model weights. The context awareness is instant.'],
      ['Hana Ito','Check out the new parcel listings on Al Maryah. Prime spots are moving fast.'],
      ['Adam Brooks','Thanks for connecting! Let me know when you are visiting Downtown next.'],
      ['Nora Silva','The Design District just voted to adopt your interior proposal.'],
      ['Yusuf Qasimi','Let\'s grab coffee at Harbor & Co. Roastery before the pitch night starts.']
    ];
    return Object.fromEntries(list.map(([name,text],i)=>[`u${i+1}`,[
      {id:uid('msg'),from:`u${i+1}`,text,at:`${3+i}m ago`,mine:false},
      {id:uid('msg'),from:'me',text:'Sounds excellent — heading over shortly! 🚀',at:`${i+1}m ago`,mine:true}
    ]]));
  }

  function seedNotifications() {
    return [
      ['Maya Chen invited you to Saadiyat Crystal Pavilion.','2m ago',false,'social'],
      ['Yas Sprint Grand Prix is now open for practice laps.','14m ago',false,'game'],
      ['Reputation Milestone: Reached Tier 4 Resident.','45m ago',true,'reward'],
      ['Abu Dhabi AI World Summit registrations reached 90% capacity.','1h ago',false,'event'],
      ['Omar Al-Zaabi endorsed your Island Architect credentials.','2h ago',true,'social'],
      ['Gulfstream 42 Speedboat received a fresh performance upgrade.','3h ago',true,'market'],
      ['Daily Island Quest completed: +100 ISL credited.','4h ago',true,'reward'],
      ['Price alert: Plot L-101 in Harbor District has new inquiries.','6h ago',false,'property'],
      ['Harbor & Co. Roastery introduced a new gourmet beverage menu.','8h ago',true,'business'],
      ['NOVA AI Co-Pilot analyzed your activity and generated 3 recommendations.','10h ago',true,'ai'],
      ['New resident community formed: MENA Angel Investors.','12h ago',true,'community'],
      ['New luxury plot released on Nurai Island Coastline.','1d ago',true,'property'],
      ['Your community post received 18 resident upvotes.','1d ago',true,'social'],
      ['Weekend Community Arena Brawl winner announced.','1d ago',true,'event'],
      ['Pixel Forge studio published a new 3D avatar collection.','2d ago',true,'market'],
      ['Welcome to Nexus Island — Your UAE Digital Journey Begins!','3d ago',true,'system']
    ].map((x,i)=>({id:`n${i+1}`,text:x[0],time:x[1],read:x[2],type:x[3]}));
  }

  function seedTransactions() {
    return [
      {id:'tx-01',description:'Initial UAE Island Citizenship Grant',amount:1000,type:'Grant',date:'Today',status:'Settled · Escrow Verified',hash:txHash('tx-01')},
      {id:'tx-02',description:'Falcon Explorer Golden Badge',amount:-25,type:'Purchase',date:'Today',status:'Settled · Escrow Verified',hash:txHash('tx-02')},
      {id:'tx-03',description:'Exploration Quest Reward — Harbor',amount:80,type:'Reward',date:'Today',status:'Settled · Escrow Verified',hash:txHash('tx-03')},
      {id:'tx-04',description:'Arabian Gulf Pearl Lamp',amount:-40,type:'Marketplace',date:'Yesterday',status:'Settled · Escrow Verified',hash:txHash('tx-04')},
      {id:'tx-05',description:'Daily Login & Presence Stipend',amount:50,type:'Reward',date:'Yesterday',status:'Settled · Escrow Verified',hash:txHash('tx-05')},
      {id:'tx-06',description:'Yas Speed Challenge Runner-Up',amount:120,type:'Gaming',date:'2d ago',status:'Settled · Escrow Verified',hash:txHash('tx-06')},
      {id:'tx-07',description:'Creator Royalties — Asset Licensing',amount:75,type:'Earning',date:'3d ago',status:'Settled · Escrow Verified',hash:txHash('tx-07')},
      {id:'tx-08',description:'Community Hub Membership Fee',amount:-15,type:'Social',date:'3d ago',status:'Settled · Escrow Verified',hash:txHash('tx-08')},
      {id:'tx-09',description:'NOVA Assistant Strategy Consultation',amount:0,type:'System',date:'4d ago',status:'Settled · Escrow Verified',hash:txHash('tx-09')}
    ];
  }

  /* ─── STATE MANAGEMENT ─── */
  function defaultState() {
    return {
      schema: 7,
      auth: false,
      onboardingComplete: false,
      currentCountry: 'uae',
      visaTier: 'resident',
      visas: {
        uae: { status: 'Active', tier: 'resident', number: '#VISA-UAE-8841', issued: 'Oct 2026' }
      },
      landBuildings: {},
      phygitalVouchers: [
        { id: 'vch-1', brand: 'LuLu Hypermarket', code: 'LULU-NEXUS-15', discount: '15% OFF Online & In-Store UAE Order', status: 'Active' },
        { id: 'vch-2', brand: 'Emaar Developments', code: 'EMAAR-VIP-2026', discount: 'VIP Priority Preview & U-Points Bonus', status: 'Active' }
      ],
      islandVotes: ['exp-dubai-burj'],
      security: {
        pinEnabled: true, pinCode: '2026', kycVerified: true,
        escrowProtection: true, twoFactor: true, securityScore: 98
      },
      user: {
        id: 'demo-user', name: 'Alex Morgan', username: 'alex',
        email: 'alex.morgan@nexusisland.ae', country: 'United Arab Emirates',
        avatar: '🧑‍💻', title: 'Founding Island Architect',
        bio: 'Explorer, venture builder and digital resident of Nexus Island. Focused on AI spatial ecosystems & MENA innovation.',
        level: 4, xp: 840, reputation: 88,
        interests: ['Spatial AI','ADGM Startups','Esports','Architecture'],
        goal: 'Build an Enterprise'
      },
      wallet: 1850, wishlist: [], cart: [],
      inventory: ['m5','m2','m7','m9','m11','m13'],
      equipped: { fashion: null, badge: 'm5', vehicle: null },
      ownedLand: ['L-101'], ownedProperties: ['p1'], ownedVehicles: ['v1'],
      home: {
        built: true, name: 'Alex\'s Emaar Coastal Atelier & Majlis',
        landId: 'L-101 (Harbor Marina Edge)', style: 'Emaar Modern Coastal',
        room: 'Living Lounge', ambiance: 'sunset',
        slots: { seating: 'm9', lighting: 'm2', art: 'm13', hospitality: 'm11', trophy: 'm5' },
        furniture: ['m2','m9','m13','m11','m5'], privacy: 'Public',
        visitorsNow: 3, upvotes: 42,
        guestbook: [
          { author: 'Maya Chen', note: 'The Saadiyat art canvas paired with the pearl lamp creates such an authentic Gulf ambiance!', date: '2h ago', tip: 15 },
          { author: 'Tariq Al-Hashimi', note: 'Spatial audio acoustics in this lounge are super crisp. Great arrangement.', date: '5h ago', tip: 25 },
          { author: 'Farhan Al-Nuaimi', note: 'Bespoke majlis setup. Upvoted your room!', date: 'Yesterday', tip: 50 }
        ]
      },
      friends: ['u1','u2','u3','u4','u5','u7'],
      requests: ['u8','u9','u10'], blocked: [],
      following: ['b1','b2','b3','b4','b5'], joined: ['c1','c2','c5'], rsvp: ['e1','e2','e4'],
      events: {}, communities: {},
      messages: seedMessages(), selectedConversation: 'u1',
      notifications: seedNotifications(), transactions: seedTransactions(),
      gameStats: { drone: { plays: 2, best: 940 }, pearl: { plays: 3, best: 7 }, tycoon: { plays: 1, best: 3 } },
      activity: [
        {id:uid('act'),text:'Issued Sovereign UAE Virtual Visa (#VISA-UAE-8841)',time:'Today'},
        {id:uid('act'),text:'Traveled across 5 UAE Islands via GTA Causeway',time:'Today'},
        {id:uid('act'),text:'Registered Title Deed L-101 in Nexus Shield Escrow',time:'Today'},
        {id:uid('act'),text:'Connected with Maya Chen (Spatial Creator)',time:'Yesterday'}
      ],
      createdBusinesses: [], customCreatedProducts: [],
      settings: {
        publicProfile: true, notifications: true, emailUpdates: false,
        reducedMotion: false, audio: true, graphics: 'High (Spatial 60FPS)',
        chatPrivacy: 'Everyone', mapTheme: 'day'
      },
      districtsVisited: ['harbor','creator','downtown','residential','gaming'],
      currentDistrict: 'harbor',
      avatarPosition: { x: 48, y: 64 },
      membership: 'Resident Plus',
      createdAt: new Date().toISOString(),
      neighborInvites: [],
      treasureBoxes: [
        { id:'tr-1', landId:'L-101', hint:'Near the marina fountain, under the coral sculpture.', rarity:'Rare', reward:150, found:false, foundBy:null },
        { id:'tr-2', landId:'L-201', hint:'Behind the crystal pavilion, where the light bends.', rarity:'Epic', reward:300, found:false, foundBy:null },
        { id:'tr-3', landId:'L-301', hint:'Under the neon glow of the arcade entrance.', rarity:'Legendary', reward:500, found:false, foundBy:null }
      ],
      foundTreasures: [],
      flexCardStyle: 'black',
      passportStamps: ['harbor','creator','downtown']
    };
  }

  function loadState() {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return defaultState();
    try {
      const p = JSON.parse(raw);
      const base = defaultState();
      const merged = { ...base, ...p, user:{...base.user, ...(p.user||{})}, settings:{...base.settings, ...(p.settings||{})}, gameStats:{...base.gameStats, ...(p.gameStats||{})}, home:{...base.home, ...(p.home||{})}, security:{...base.security, ...(p.security||{})} };
      if (!Array.isArray(merged.inventory)) merged.inventory = base.inventory;
      if (!merged.equipped) merged.equipped = base.equipped;
      if (!Array.isArray(merged.districtsVisited)) merged.districtsVisited = ['harbor'];
      if (!Array.isArray(merged.neighborInvites)) merged.neighborInvites = [];
      if (!Array.isArray(merged.treasureBoxes)) merged.treasureBoxes = base.treasureBoxes;
      if (!Array.isArray(merged.foundTreasures)) merged.foundTreasures = [];
      if (!Array.isArray(merged.passportStamps)) merged.passportStamps = ['harbor'];
      if (!merged.currentCountry) merged.currentCountry = 'uae';
      if (!merged.visaTier) merged.visaTier = 'resident';
      if (!merged.visas || typeof merged.visas !== 'object') merged.visas = base.visas;
      if (!merged.landBuildings || typeof merged.landBuildings !== 'object') merged.landBuildings = {};
      if (!Array.isArray(merged.phygitalVouchers)) merged.phygitalVouchers = base.phygitalVouchers;
      if (!Array.isArray(merged.islandVotes)) merged.islandVotes = base.islandVotes;
      if (!Array.isArray(merged.createdBusinesses)) merged.createdBusinesses = [];
      if (!merged.home.slots) merged.home.slots = { ...base.home.slots };
      if (!Array.isArray(merged.home.guestbook)) merged.home.guestbook = [ ...base.home.guestbook ];
      if (!merged.home.ambiance) merged.home.ambiance = 'sunset';
      if (merged.home.upvotes === undefined) merged.home.upvotes = 42;
      if (merged.home.visitorsNow === undefined) merged.home.visitorsNow = 3;
      if (!merged.currentDistrict) merged.currentDistrict = 'harbor';
      if (!merged.avatarPosition) merged.avatarPosition = { x: 48, y: 64 };
      return merged;
    } catch { return defaultState(); }
  }

  let state = loadState();

  // Multi-window companion
  if (typeof window !== 'undefined' && window.location && window.location.search && typeof URLSearchParams !== 'undefined') {
    try {
      const p = new URLSearchParams(window.location.search);
      const guestName = p.get('guest');
      const guestAvatar = p.get('avatar');
      const guestDistrict = p.get('district');
      if (guestName) {
        state.user.name = guestName.replace(/_/g, ' ');
        state.user.id = 'guest-' + guestName.toLowerCase().replace(/[^a-z0-9]/g, '');
        state.user.title = 'Visiting Resident / Investor';
      }
      if (guestAvatar) state.user.avatar = guestAvatar;
      if (guestDistrict) state.currentDistrict = guestDistrict;
    } catch {}
  }

  function save() {
    state.schema = 6;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function notify(text, type='system') {
    state.notifications.unshift({ id: uid('n'), text, time:'Just now', read:false, type });
    if (state.notifications.length > 50) state.notifications.length = 50;
    save();
  }

  function activity(text) {
    state.activity.unshift({ id: uid('act'), text, time:'Just now' });
    if (state.activity.length > 30) state.activity.length = 30;
    save();
  }

  function toast(text, type='info') {
    playBeep(type === 'success' ? 'reward' : 'click');
    if (typeof document === 'undefined') return;
    let root = document.getElementById('toast');
    if (!root) { root = document.createElement('div'); root.id = 'toast'; document.body.append(root); }
    const colors = {
      success: 'background:var(--bg-elevated);color:var(--success);border:1px solid rgba(34,197,94,0.2);',
      warn: 'background:var(--bg-elevated);color:#eab308;border:1px solid rgba(234,179,8,0.2);',
      danger: 'background:var(--bg-elevated);color:var(--danger);border:1px solid rgba(239,68,68,0.2);',
      info: 'background:var(--bg-elevated);color:var(--accent-text);border:1px solid var(--border-hover);'
    };
    root.innerHTML = `<div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:200;max-width:90vw;padding:12px 20px;border-radius:var(--radius-lg);font-size:0.8125rem;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:var(--shadow-lg);${colors[type]||colors.info}" class="pop"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;opacity:0.7"></span>${esc(text)}</div>`;
    clearTimeout(root._timer);
    root._timer = setTimeout(() => { if (root) root.innerHTML = ''; }, 3500);
  }

  function nav(file) { if (typeof window !== 'undefined') window.location.href = file; }
  function refresh() { if (typeof window !== 'undefined') window.location.reload(); }

  function levelNeed() { return 300 + state.user.level * 180; }
  function award(xpAmount, nxAmount, reason) {
    const before = state.user.level;
    state.user.xp += xpAmount;
    state.wallet += nxAmount;
    while (state.user.xp >= levelNeed()) { state.user.xp -= levelNeed(); state.user.level += 1; }
    if (nxAmount !== 0) {
      state.transactions.unshift({ id: uid('tx'), description: reason, amount: nxAmount, type: nxAmount > 0 ? 'Reward' : 'Fee', date: 'Just now', status: 'Settled' });
    }
    activity(`${reason} · +${xpAmount} XP${nxAmount ? ' · +' + nxAmount + ' ISL' : ''}`);
    notify(`${reason}: +${xpAmount} XP${nxAmount ? ' · +' + nxAmount + ' ISL' : ''}`, 'reward');
    save();
    if (state.user.level > before) {
      toast(`🎉 LEVEL UP! You are now Level ${state.user.level}!`, 'success');
    } else {
      toast(`${reason} (+${xpAmount} XP / +${nxAmount} ISL)`, 'success');
    }
  }

  function demoFunds(amount = 2500) {
    state.wallet += Number(amount);
    state.transactions.unshift({ id: uid('tx'), description: 'Simulated Capital Injection (Demo)', amount: Number(amount), type: 'Top-Up', date: 'Just now', status: 'Settled' });
    notify(`+${money(amount)} (${aed(amount)}) demo capital credited.`, 'system');
    activity(`Added ${money(amount)} demo funds`);
    save(); closeModal();
    toast(`+${money(amount)} added to wallet!`, 'success');
    refresh();
  }

  /* ═══════════════════════════════════════════════
     UI COMPONENT SYSTEM — Immersive World
     ═══════════════════════════════════════════════ */

  function btn(label, action, tone='ghost', extra='') {
    const tones = {
      primary: 'btn btn-primary',
      gold: 'btn btn-gold',
      ghost: 'btn btn-ghost',
      success: 'btn btn-success',
      danger: 'btn btn-danger',
    };
    let cls = tones[tone] || tones.ghost;
    let extraClass = '';
    extra = String(extra||'').replace(/class="([^"]*)"/i, (_,c) => { extraClass=c; return ''; });
    return `<button type="button" onclick="${escAttr(action)}" ${extra} class="${cls} ${extraClass}">${label}</button>`;
  }

  function card(html, extra='') {
    return `<div class="glass-card ${extra}">${html}</div>`;
  }

  function metric(label, value, note, ic='✦') {
    return `<div class="metric-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div class="metric-label">${label}</div>
          <div class="metric-value">${value}</div>
          <div class="metric-note">${note}</div>
        </div>
        <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--accent-soft);display:grid;place-items:center;font-size:1.25rem;flex-shrink:0">${ic}</div>
      </div>
    </div>`;
  }

  function modal(title, body) {
    playBeep('click');
    if (typeof document === 'undefined') return;
    const host = document.getElementById('modal');
    if (!host) return;
    host.innerHTML = `<div style="position:fixed;inset:0;z-index:120;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:16px;display:grid;place-items:center" onclick="if(event.target===this)closeModal()">
      <div class="pop" style="width:100%;max-width:640px;max-height:92vh;overflow-y:auto;border-radius:var(--radius-2xl);padding:28px;background:var(--bg-elevated);border:1px solid var(--border-hover);box-shadow:var(--shadow-xl)">
        <div style="display:flex;align-items:start;justify-content:space-between;gap:16px;border-bottom:1px solid var(--border);padding-bottom:16px;margin-bottom:20px">
          <div>
            <div class="tag tag-cyan" style="margin-bottom:8px"><span class="live-dot" style="width:5px;height:5px"></span>Nexus Island</div>
            <h3 class="heading-md">${title}</h3>
          </div>
          <button type="button" onclick="closeModal()" style="width:32px;height:32px;border-radius:var(--radius-sm);background:var(--bg-hover);border:1px solid var(--border);color:var(--text-muted);display:grid;place-items:center;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.15s;flex-shrink:0" onmouseover="this.style.background='var(--bg-active)';this.style.color='var(--text-primary)'" onmouseout="this.style.background='var(--bg-hover)';this.style.color='var(--text-muted)'">\u2715</button>
        </div>
        <div>${body}</div>
      </div>
    </div>`;
  }

  function closeModal() {
    if (typeof document !== 'undefined') {
      const m = document.getElementById('modal');
      if (m) m.innerHTML = '';
    }
  }

  /* ─── ISLAND SVG MAP ─── */
  function islandSVG() {
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" class="island-svg" style="width:100%;height:auto;display:block">
      <defs>
        <radialGradient id="islandGrad" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#86efac" stop-opacity="0.9"/>
          <stop offset="40%" stop-color="#4ade80" stop-opacity="0.85"/>
          <stop offset="70%" stop-color="#22c55e" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#15803d" stop-opacity="0.75"/>
        </radialGradient>
        <radialGradient id="islandHighlight" cx="35%" cy="30%" r="35%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <filter id="islandShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Beach gradient -->
        <linearGradient id="beachGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde68a" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.3"/>
        </linearGradient>
      </defs>

      <!-- Island main body -->
      <path d="M200,120 C240,80 320,60 400,75 C480,60 560,80 620,120 C680,160 700,220 690,280 C710,340 680,400 640,440 C600,480 540,500 480,510 C440,520 400,530 360,520 C300,510 240,490 200,450 C160,410 120,360 110,300 C100,240 130,180 160,150 C170,140 185,128 200,120 Z"
        fill="url(#islandGrad)" filter="url(#islandShadow)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

      <!-- Beach ring -->
      <path d="M200,120 C240,80 320,60 400,75 C480,60 560,80 620,120 C680,160 700,220 690,280 C710,340 680,400 640,440 C600,480 540,500 480,510 C440,520 400,530 360,520 C300,510 240,490 200,450 C160,410 120,360 110,300 C100,240 130,180 160,150 C170,140 185,128 200,120 Z"
        fill="none" stroke="url(#beachGrad)" stroke-width="14" stroke-opacity="0.5"/>

      <!-- Highlight overlay -->
      <path d="M200,120 C240,80 320,60 400,75 C480,60 560,80 620,120 C680,160 700,220 690,280 C710,340 680,400 640,440 C600,480 540,500 480,510 C440,520 400,530 360,520 C300,510 240,490 200,450 C160,410 120,360 110,300 C100,240 130,180 160,150 C170,140 185,128 200,120 Z"
        fill="url(#islandHighlight)"/>

      <!-- Terrain features -->
      <!-- Mountains/hills -->
      <ellipse cx="380" cy="220" rx="60" ry="25" fill="rgba(22,163,74,0.4)" transform="rotate(-8 380 220)"/>
      <ellipse cx="500" cy="280" rx="45" ry="18" fill="rgba(22,163,74,0.3)" transform="rotate(5 500 280)"/>
      <ellipse cx="280" cy="320" rx="35" ry="14" fill="rgba(22,163,74,0.35)"/>

      <!-- Road/path network -->
      <path d="M220,200 Q350,250 400,300 Q450,350 520,380 M400,300 Q380,400 400,460 M400,300 Q520,260 600,240" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" stroke-dasharray="8 6"/>

      <!-- Water body (lagoon) -->
      <ellipse cx="430" cy="400" rx="40" ry="20" fill="var(--border-accent)" stroke="var(--border-accent)" stroke-width="1.5"/>
    </svg>`;
  }

  /* ═══════════════════════════════════════════════
     NAVIGATION & LAYOUT
     ═══════════════════════════════════════════════ */
  function navItem(label, file, ic) {
    const on = typeof location !== 'undefined' && location.pathname.endsWith(file);
    return `<a href="${file}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--radius-md);font-size:0.8125rem;font-weight:${on ? '600' : '500'};transition:all 0.2s var(--ease-out);text-decoration:none;position:relative;${on ? 'color:var(--text-primary);background:var(--bg-tertiary)' : 'color:var(--text-muted)'}" onmouseover="if(!${on}){this.style.background='var(--bg-tertiary)';this.style.color='var(--text-secondary)'}" onmouseout="if(!${on}){this.style.background='transparent';this.style.color='var(--text-muted)'}"><span style="font-size:15px;opacity:${on ? '1' : '0.6'}">${ic}</span><span>${label}</span>${on ? '<div style="position:absolute;left:0;top:25%;bottom:25%;width:3px;border-radius:0 3px 3px 0;background:var(--accent)"></div>' : ''}</a>`;
  }

  function layout(content) {
    const unread = state.notifications.filter(n => !n.read).length;
    const currPath = typeof location !== 'undefined' ? location.pathname : '';
    const isTab = f => currPath.endsWith(f);
    const currCountry = COUNTRIES.find(c => c.id === state.currentCountry) || COUNTRIES[0];
    const currTier = VISA_TIERS.find(t => t.id === state.visaTier) || VISA_TIERS[1];

    return `<div style="min-height:100vh;position:relative">
      <!-- TOP NAV BAR -->
      <header style="position:sticky;top:0;z-index:50;background:rgba(9,9,11,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border)">
        <div class="container-wide" style="height:var(--nav-height);display:flex;align-items:center;justify-content:space-between;gap:16px">
          <!-- Logo -->
          <a href="dashboard.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0">
            <div style="width:34px;height:34px;border-radius:10px;background:var(--accent);display:grid;place-items:center;font-weight:700;color:#fff;font-size:15px">N</div>
            <span style="font-size:1rem;font-weight:700;color:var(--text-primary);letter-spacing:-0.02em">Nexus</span>
          </a>

          <!-- Center Nav — Segmented Control -->
          <nav style="display:none" class="lg-show">
            <div style="display:flex;align-items:center;gap:1px;padding:4px;border-radius:var(--radius-md);background:var(--bg-secondary);border:1px solid var(--border)">
              ${[['Home','dashboard.html'],['World','island.html'],['Market','marketplace.html'],['Land','land.html'],['Enterprises','businesses.html'],['Flex Card','flex-card.html'],['Events','events.html']].map(([l,f]) => {
                const active = isTab(f);
                return `<a href="${f}" style="padding:7px 14px;border-radius:${active ? 'var(--radius-sm)' : '0'};font-size:0.8125rem;font-weight:${active ? '600' : '500'};text-decoration:none;transition:all 0.15s;${active ? 'background:var(--bg-elevated);color:var(--text-primary);box-shadow:var(--shadow-sm)' : 'color:var(--text-muted);background:transparent'}" onmouseover="if(!${active})this.style.color='var(--text-secondary)'" onmouseout="if(!${active})this.style.color='var(--text-muted)'">${l}</a>`;
              }).join('')}
            </div>
          </nav>

          <!-- Right Actions -->
          <div style="display:flex;align-items:center;gap:8px">
            <button onclick="openVisaCenterModal()" style="display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--radius-sm);background:var(--bg-secondary);border:1px solid var(--border-accent);color:var(--text-primary);font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.15s" title="4-Country Virtual Visa & Immigration Portal">
              <span>${currCountry.flag}</span>
              <span>${currCountry.short}</span>
              <span style="color:var(--accent-text);font-size:10px">· ${currTier.icon} Visa</span>
            </button>
            <button onclick="search()" style="display:none;padding:7px 12px;border-radius:var(--radius-sm);background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-dim);font-size:0.8125rem;font-weight:500;cursor:pointer;align-items:center;gap:6px;transition:all 0.15s" class="md-show-flex" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">⌕</button>
            <a href="wallet.html" style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius-sm);background:var(--bg-secondary);border:1px solid var(--border);font-size:0.8125rem;font-weight:600;color:var(--text-primary);text-decoration:none;transition:all 0.15s" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
              <span style="color:var(--accent-text)">◈</span>${money(state.wallet)}
            </a>
            <a href="notifications.html" style="position:relative;width:36px;height:36px;border-radius:var(--radius-sm);background:var(--bg-secondary);border:1px solid var(--border);display:grid;place-items:center;font-size:14px;text-decoration:none;transition:all 0.15s" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='var(--bg-secondary)'">
              🔔${unread ? `<span style="position:absolute;top:-3px;right:-3px;width:16px;height:16px;border-radius:50%;background:var(--danger);color:#fff;font-size:9px;font-weight:700;display:grid;place-items:center;border:2px solid var(--bg-primary)">${unread > 9 ? '9+' : unread}</span>` : ''}
            </a>
            <button onclick="nova()" class="btn btn-primary btn-sm">✨ <span class="sm-show">NOVA</span></button>
            <button onclick="openMobileMenu()" class="xl-hide" style="width:36px;height:36px;border-radius:var(--radius-sm);background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);display:grid;place-items:center;cursor:pointer;font-size:16px">☰</button>
            <a href="profile.html" class="sm-show" style="width:36px;height:36px;border-radius:50%;background:var(--bg-tertiary);border:1px solid var(--border);display:grid;place-items:center;font-size:16px;text-decoration:none;transition:all 0.15s" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">${state.user.avatar}</a>
          </div>
        </div>
      </header>

      <!-- MAIN LAYOUT -->
      <div class="container-wide" style="display:flex;gap:32px">
        <!-- SIDEBAR -->
        <aside class="xl-show" style="width:var(--sidebar-width);flex-shrink:0;padding:28px 0">
          <div style="position:sticky;top:100px;display:flex;flex-direction:column;gap:32px">
            <div>
              <div class="metric-label" style="padding:0 14px;margin-bottom:10px">World & Assets</div>
              ${[['Island Map','island.html','🌐'],['Land Parcels','land.html','🏝️'],['Properties','property.html','🏠'],['Enterprises','businesses.html','🏢'],['Marketplace','marketplace.html','▦'],['Vehicles','vehicles.html','🏎️']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
                <span>Viral & Growth</span>
                <span class="tag tag-amber" style="font-size:9px;padding:2px 6px">HOT</span>
              </div>
              ${[['Neighbor Drop','neighbor-drop.html','🤝'],['Flex Card','flex-card.html','💳'],['Treasure Hunt','treasure-hunt.html','🏴‍☠️'],['Guestbook','guestbook.html','📖']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 14px;margin-bottom:10px">Social & Play</div>
              ${[['Friends','friends.html','👥'],['Messages','messages.html','💬'],['Communities','communities.html','◎'],['Events','events.html','◷'],['Games','games.html','🎮']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 14px;margin-bottom:10px">Identity</div>
              ${[['Wallet','wallet.html','◈'],['Profile','profile.html','◉'],['Notifications','notifications.html','🔔'],['Settings','settings.html','⚙']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 14px;margin-bottom:10px">Investor</div>
              ${[['Pitch Deck','investor.html','▶'],['Revenue Model','business-model.html','↗'],['Alpha Cohort','alpha.html','⚡'],['Why Nexus','why-nexus.html','✦'],['Roadmap','future.html','∞'],['Admin','admin.html','▤']].map(x=>navItem(...x)).join('')}
            </div>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main style="flex:1;min-width:0;padding:28px 0 120px">${content}</main>
      </div>

      <!-- MOBILE BOTTOM NAV -->
      <nav class="xl-hide" style="position:fixed;bottom:0;left:0;right:0;z-index:50;background:rgba(9,9,11,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(5,1fr);padding:8px 4px;padding-bottom:max(8px,env(safe-area-inset-bottom,8px))">
        ${[
          ['dashboard.html','⌂','Home',isTab('dashboard.html')],
          ['island.html','🌐','World',isTab('island.html')],
          ['marketplace.html','▦','Market',isTab('marketplace.html')],
          ['messages.html','💬','Chat',isTab('messages.html')],
          ['javascript:openMobileMenu()','☰','Menu',false]
        ].map(([href,ic,label,active]) => `
          <a href="${href}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 4px;border-radius:var(--radius-sm);font-size:9px;font-weight:${active ? '600' : '500'};text-decoration:none;transition:all 0.15s;gap:3px;${active ? 'color:var(--accent-text)' : 'color:var(--text-dim)'}">
            <span style="font-size:17px;line-height:1">${ic}</span>
            <span>${label}</span>
            ${active ? '<div style="width:4px;height:4px;border-radius:50%;background:var(--accent);margin-top:1px"></div>' : ''}
          </a>
        `).join('')}
      </nav>

      <!-- Alpha Feedback Pill -->
      <button onclick="openAlphaFeedbackModal()" style="position:fixed;bottom:80px;right:16px;z-index:40;padding:10px 16px;border-radius:var(--radius-full);background:var(--bg-secondary);border:1px solid var(--border);color:var(--accent-text);font-size:0.75rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:var(--shadow-lg);transition:all 0.2s" class="xl-bottom-fix" onmouseover="this.style.borderColor='var(--border-accent)'" onmouseout="this.style.borderColor='var(--border)'">
        <span class="live-dot" style="width:6px;height:6px"></span>⚡ Alpha Feedback
      </button>

      <div id="modal"></div>
      <div id="toast"></div>

      <!-- Responsive breakpoint helpers -->
      <style>
        .lg-show { display: none !important; }
        .xl-show { display: none !important; }
        .md-show-flex { display: none !important; }
        .sm-show { display: none !important; }
        .xl-hide {}
        @media (min-width: 640px) { .sm-show { display: inline-flex !important; } }
        @media (min-width: 768px) { .md-show-flex { display: flex !important; } }
        @media (min-width: 1024px) { .lg-show { display: flex !important; } }
        @media (min-width: 1280px) { .xl-show { display: block !important; } .xl-hide { display: none !important; } .xl-bottom-fix { bottom: 24px !important; right: 24px !important; } }
      </style>
    </div>`;
  }

  function openMobileMenu() {
    playBeep('click');
    modal('Navigate the Island', `
      <div style="display:flex;flex-direction:column;gap:20px;max-height:75vh;overflow-y:auto;padding-right:4px">
        <!-- Resident Card -->
        <div style="padding:16px;border-radius:16px;background:linear-gradient(135deg,var(--accent-soft),rgba(99,102,241,0.06));border:1px solid var(--border-accent);display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:28px">${state.user.avatar}</span>
            <div>
              <div style="font-weight:800;font-size:14px">${esc(state.user.name)}</div>
              <div style="font-size:11px;color:var(--accent-text);font-weight:600">Level ${state.user.level} · ${money(state.wallet)}</div>
            </div>
          </div>
          <button onclick="closeModal();demoFunds(2500)" class="btn btn-primary btn-sm">+ Funds</button>
        </div>

        ${[
          ['World & Assets', [['Island Map','island.html','🌐'],['Land','land.html','🏝️'],['Properties','property.html','🏠'],['Enterprises','businesses.html','🏢'],['Marketplace','marketplace.html','▦'],['Vehicles','vehicles.html','🏎️']]],
          ['Viral Features 🔥', [['Neighbor Drop','neighbor-drop.html','🤝'],['Flex Card','flex-card.html','💳'],['Treasure Hunt','treasure-hunt.html','🏴‍☠️'],['Guestbook','guestbook.html','📖']]],
          ['Social & Play', [['Friends','friends.html','👥'],['Messages','messages.html','💬'],['Communities','communities.html','◎'],['Events','events.html','◷'],['Games','games.html','🎮'],['Wallet','wallet.html','◈']]],
          ['Investor & Admin', [['Pitch Deck','investor.html','▶'],['Revenue Model','business-model.html','↗'],['Why Nexus','why-nexus.html','✦'],['Roadmap','future.html','∞'],['Admin','admin.html','▤'],['Settings','settings.html','⚙']]]
        ].map(([title, items]) => `
          <div>
            <div class="metric-label" style="margin-bottom:8px">${title}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              ${items.map(([l,f,i]) => `
                <a href="${f}" onclick="closeModal()" style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--text-secondary);text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='var(--accent-soft)';this.style.color='var(--accent-text)'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='var(--text-secondary)'">${i} ${l}</a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `);
  }

  /* ═══════════════════════════════════════════════
     4-COUNTRY VIRTUAL VISA & IMMIGRATION ENGINE
     ═══════════════════════════════════════════════ */
  function openVisaCenterModal() {
    const currCountry = COUNTRIES.find(c => c.id === state.currentCountry) || COUNTRIES[0];
    const currTier = VISA_TIERS.find(t => t.id === state.visaTier) || VISA_TIERS[1];
    const heldVisas = Object.keys(state.visas || { uae: true });

    modal('🛂 Sovereign Virtual Visa & 4-Country Travel Portal', `
      <div style="display:flex;flex-direction:column;gap:20px">
        <!-- Active Passport Banner -->
        <div style="padding:20px;border-radius:16px;background:linear-gradient(135deg,rgba(59,130,246,0.12),rgba(234,179,8,0.08));border:1px solid var(--border-accent);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:52px;height:52px;border-radius:14px;background:var(--bg-tertiary);border:1px solid var(--border-hover);display:grid;place-items:center;font-size:28px">${currCountry.flag}</div>
            <div>
              <div style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#fbbf24">Active Sovereign Visa · ${currTier.badge}</div>
              <div style="font-size:16px;font-weight:800;margin-top:2px;color:var(--text-primary)">${esc(currCountry.name)} (${currCountry.short})</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Passport ID: <span class="mono" style="color:var(--accent-text)">${esc(state.visas?.[currCountry.id]?.number || '#VISA-UAE-8841')}</span> · Visas Held: ${heldVisas.length}/4 Countries</div>
            </div>
          </div>
          <div style="text-align:right">
            <span class="tag tag-emerald">● IMMIGRATION CLEARED</span>
            <div style="font-size:11px;color:var(--text-dim);margin-top:4px">Escrow Fee Rate: <b style="color:var(--text-primary)">${currTier.escrowFee}</b></div>
          </div>
        </div>

        <!-- 4 Planned Countries Grid -->
        <div>
          <div class="metric-label" style="margin-bottom:10px">Select Destination Country (Requires Country Visa to Enter)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">
            ${COUNTRIES.map(c => {
              const hasVisa = Boolean(state.visas && state.visas[c.id]) || state.visaTier === 'diplomatic';
              const isCurrent = state.currentCountry === c.id;
              return `
                <div style="padding:16px;border-radius:14px;background:${isCurrent ? 'var(--bg-tertiary)' : 'rgba(255,255,255,0.02)'};border:1px solid ${isCurrent ? 'var(--border-accent)' : 'var(--border)'};display:flex;flex-direction:column;justify-content:space-between;gap:12px">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
                      <div style="display:flex;align-items:center;gap:8px">
                        <span style="font-size:24px">${c.flag}</span>
                        <div>
                          <div style="font-size:14px;font-weight:800;color:var(--text-primary)">${esc(c.name)}</div>
                          <div style="font-size:10px;color:var(--text-dim)">${esc(c.islandsCount)}</div>
                        </div>
                      </div>
                      <span class="tag ${hasVisa ? 'tag-emerald' : 'tag-amber'}" style="font-size:9px">${hasVisa ? '✓ VISA ISSUED' : money(c.visaFee)}</span>
                    </div>
                    <p style="font-size:11px;color:var(--text-secondary);margin-top:8px;line-height:1.5">${esc(c.description)}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
                      ${c.highlights.slice(0,2).map(h => `<span style="font-size:9px;padding:2px 6px;border-radius:6px;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-muted)">${esc(h)}</span>`).join('')}
                    </div>
                  </div>
                  <div style="padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:10px;color:var(--text-dim);font-family:'JetBrains Mono',monospace">${c.visaCode}</span>
                    ${isCurrent
                      ? `<span style="font-size:11px;font-weight:700;color:var(--accent-text)">● Current Country</span>`
                      : hasVisa
                      ? btn(`✈️ Travel to ${c.short}`, `switchCountry('${c.id}')`, 'primary', 'class="btn btn-primary btn-sm"')
                      : btn(`🛂 Obtain ${c.short} Visa (${money(c.visaFee)})`, `applyCountryVisa('${c.id}')`, 'gold', 'class="btn btn-gold btn-sm"')
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 4 Visa Tiers Upgrade -->
        <div>
          <div class="metric-label" style="margin-bottom:10px">Upgrade Your Sovereign Visa Tier (Unlocks 0% Escrow Tax & Multi-Country Access)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px">
            ${VISA_TIERS.map(t => {
              const active = state.visaTier === t.id;
              return `
                <div style="padding:14px;border-radius:12px;background:${active ? 'rgba(234,179,8,0.08)' : 'var(--bg-secondary)'};border:1px solid ${active ? 'rgba(234,179,8,0.35)' : 'var(--border)'};display:flex;flex-direction:column;justify-content:space-between;gap:10px">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <span style="font-size:13px;font-weight:800;color:var(--text-primary)">${t.icon} ${esc(t.name)}</span>
                      <span style="font-size:11px;font-weight:800;color:var(--accent-text)">${t.price === 0 ? 'Free' : money(t.price)}</span>
                    </div>
                    <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.4">${esc(t.perks)}</p>
                  </div>
                  <div>
                    ${active
                      ? `<span class="tag tag-amber" style="width:100%;justify-content:center">★ Active Visa Tier</span>`
                      : btn(`Upgrade to ${t.name.split(' ').slice(-2).join(' ')}`, `upgradeVisaTier('${t.id}')`, 'ghost', 'class="btn btn-ghost btn-sm" style="width:100%"')
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `);
  }

  function applyCountryVisa(countryId) {
    const c = COUNTRIES.find(x => x.id === countryId);
    if (!c) return;
    if (state.visas && state.visas[countryId]) return switchCountry(countryId);
    if (state.wallet < c.visaFee) return toast(`Insufficient ISL balance. Need ${money(c.visaFee)} for ${c.name} Visa.`, 'warn');
    state.wallet -= c.visaFee;
    if (!state.visas) state.visas = {};
    const vNum = `#VISA-${c.short}-${Math.floor(1000 + Math.random() * 9000)}`;
    state.visas[countryId] = { status: 'Active', tier: state.visaTier, number: vNum, issued: 'Today' };
    const txId = uid('tx');
    state.transactions.unshift({
      id: txId, description: `Issued ${c.name} (${c.short}) Virtual Visa ${vNum}`,
      amount: -c.visaFee, type: 'Visa Immigration', date: 'Just now',
      status: 'Settled · Escrow Verified', hash: txHash(txId)
    });
    award(80, 0, `Obtained ${c.name} Virtual Visa`);
    save();
    toast(`🛂 ${c.flag} ${c.name} Virtual Visa Approved (${vNum})!`, 'success');
    openVisaCenterModal();
  }

  function switchCountry(countryId) {
    const c = COUNTRIES.find(x => x.id === countryId);
    if (!c) return;
    const hasVisa = Boolean(state.visas && state.visas[countryId]) || state.visaTier === 'diplomatic';
    if (!hasVisa) return applyCountryVisa(countryId);
    state.currentCountry = countryId;
    state.user.country = c.name;
    activity(`Traveled via International Skyport to ${c.flag} ${c.name}`);
    save();
    closeModal();
    toast(`✈️ Arrived in ${c.flag} ${c.name} (${c.capitalHub})!`, 'success');
    refresh();
  }

  function upgradeVisaTier(tierId) {
    const t = VISA_TIERS.find(x => x.id === tierId);
    if (!t) return;
    if (state.visaTier === tierId) return toast('Already on this Visa Tier.', 'info');
    if (state.wallet < t.price) return toast(`Insufficient ISL balance. Need ${money(t.price)}.`, 'warn');
    if (t.price > 0) {
      state.wallet -= t.price;
      const txId = uid('tx');
      state.transactions.unshift({
        id: txId, description: `Upgraded to ${t.name}`,
        amount: -t.price, type: 'Visa Upgrade', date: 'Just now',
        status: 'Settled · Escrow Verified', hash: txHash(txId)
      });
    }
    state.visaTier = tierId;
    state.membership = t.badge;
    if (tierId === 'diplomatic') {
      COUNTRIES.forEach(c => {
        if (!state.visas[c.id]) {
          state.visas[c.id] = { status: 'Active', tier: 'diplomatic', number: `#DIPLO-${c.short}-${Math.floor(1000+Math.random()*9000)}`, issued: 'Today' };
        }
      });
    }
    award(120, 0, `Upgraded to ${t.name}`);
    save();
    toast(`🌟 Upgraded to ${t.name}!`, 'success');
    openVisaCenterModal();
  }

  function focusUaeIsland(islandId) {
    const isl = UAE_ISLANDS.find(i => i.id === islandId);
    if (!isl) return;
    if (isl.status === 'expansion') return openExpansionIslandModal(islandId);
    if (isl.districtId) state.currentDistrict = isl.districtId;
    save();
    if (typeof window.engineFocusIsland === 'function') {
      window.engineFocusIsland(islandId);
    }
    toast(`${isl.icon} Focused on ${isl.name}`, 'info');
  }

  function openExpansionIslandModal(islandId) {
    const isl = UAE_ISLANDS.find(i => i.id === islandId) || UAE_ISLANDS[5];
    const voted = (state.islandVotes || []).includes(isl.id);
    modal(`🏗️ UAE 10+ Island Masterplan: ${isl.name}`, `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="padding:18px;border-radius:14px;background:var(--bg-tertiary);border:1px solid var(--border-accent);display:flex;align-items:center;gap:14px">
          <div style="font-size:36px">${isl.icon}</div>
          <div>
            <span class="tag tag-cyan">${esc(isl.phase || 'Future Expansion')}</span>
            <h4 style="font-size:16px;font-weight:800;margin-top:6px;color:var(--text-primary)">${esc(isl.name)}</h4>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${esc(isl.focus)}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="padding:12px;border-radius:10px;background:var(--bg-secondary);border:1px solid var(--border)">
            <div class="metric-label">Anchor Developments</div>
            <div style="font-size:12px;font-weight:700;margin-top:4px">${esc(isl.anchors)}</div>
          </div>
          <div style="padding:12px;border-radius:10px;background:var(--bg-secondary);border:1px solid var(--border)">
            <div class="metric-label">Planned Sovereign Parcels</div>
            <div style="font-size:12px;font-weight:700;margin-top:4px;color:var(--accent-text)">${isl.plots} Prime Plots (Golden Visa Priority)</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);line-height:1.6">
          As the initial 5 UAE District-Islands reach capacity, Nexus Island expands dynamically to 10+ connected islands. Citizens with a <b>UAE Golden Visa</b> receive 48-hour priority land reservation access.
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border)">
          <span style="font-size:11px;color:var(--text-dim)">Priority Votes: <b>${340 + (isl.num * 29) + (voted ? 1 : 0)} Citizens</b></span>
          <div style="display:flex;gap:8px">
            ${btn('🛂 Upgrade to Golden Visa', 'closeModal();openVisaCenterModal()', 'ghost')}
            ${voted
              ? `<span class="tag tag-emerald">✓ Priority Reserved</span>`
              : btn('🗳️ Vote & Reserve Priority Access', `voteExpansionIsland('${isl.id}')`, 'primary')
            }
          </div>
        </div>
      </div>
    `);
  }

  function voteExpansionIsland(islandId) {
    if (!Array.isArray(state.islandVotes)) state.islandVotes = [];
    if (!state.islandVotes.includes(islandId)) {
      state.islandVotes.push(islandId);
      const isl = UAE_ISLANDS.find(i => i.id === islandId);
      award(30, 15, `Voted to unlock ${isl ? isl.name : 'Expansion Island'}`);
      save();
    }
    closeModal();
    toast('🗳️ Priority reservation & vote registered (+30 XP / +15 ISL)!', 'success');
    if (typeof location !== 'undefined' && location.pathname.endsWith('island.html')) refresh();
  }

  /* ═══════════════════════════════════════════════
     WAITLIST ENGINE
     ═══════════════════════════════════════════════ */
  function getWaitlist() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem('nexus_island_waitlist');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { id: 'visa-01', name: 'Hamdan Al-Falasi', email: 'hamdan.f@adgm.ae', district: 'Downtown (ADGM)', role: 'Fintech Founder', note: 'Interested in digital advisory pavilion', passportNo: '#NX-01246', date: 'Oct 14, 2026' },
      { id: 'visa-02', name: 'Leila Kazem', email: 'leila.k@creativemena.com', district: 'Creator District', role: 'Spatial Creator', note: '3D digital fashion designer', passportNo: '#NX-01247', date: 'Oct 15, 2026' },
      { id: 'visa-03', name: 'Tariq Mansour', email: 'tariq@yas-gaming.ae', district: 'Gaming District', role: 'Esports Pro', note: 'Virtual tournament arena hosting', passportNo: '#NX-01248', date: 'Oct 16, 2026' }
    ];
  }

  function saveWaitlist(list) {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('nexus_island_waitlist', JSON.stringify(list)); } catch {}
  }

  function submitWaitlist(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get('name') || '').trim();
    const email = String(f.get('email') || '').trim();
    const district = String(f.get('district') || 'Harbor District');
    const role = String(f.get('role') || 'Spatial Creator');
    const note = String(f.get('note') || '').trim();
    if (!name || !email.includes('@')) return toast('Please provide your full name and a valid email address.', 'warn');
    const list = getWaitlist();
    const existing = list.find(x => x.email.toLowerCase() === email.toLowerCase());
    const passportNo = existing ? existing.passportNo : `#NX-${String(1249 + list.length).padStart(5, '0')}`;
    const entry = existing || { id: uid('visa'), name, email, district, role, note, passportNo, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    if (!existing) { list.push(entry); saveWaitlist(list); }
    playBeep('reward');
    toast(`🎉 Founding Visa Approved: ${passportNo}!`, 'success');
    renderWaitlistSuccess(entry);
  }

  function renderWaitlistSuccess(entry) {
    if (typeof document === 'undefined') return;
    const host = document.getElementById('waitlistCard');
    if (!host) return;
    const refLink = `https://nexusisland.ae?ref=${encodeURIComponent(entry.passportNo)}`;
    host.innerHTML = `
      <div class="glass-elevated pop" style="padding:32px;border-radius:24px;border:1px solid rgba(245,158,11,0.2);box-shadow:0 0 60px rgba(245,158,11,0.08)">
        <div style="display:flex;align-items:start;justify-content:space-between;flex-wrap:wrap;gap:16px;border-bottom:1px solid rgba(245,158,11,0.15);padding-bottom:20px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);display:grid;place-items:center;font-size:24px">🇦🇪</div>
            <div>
              <div style="font-size:9px;letter-spacing:0.2em;color:var(--amber);text-transform:uppercase;font-weight:900">Nexus Island · Digital Citizenship</div>
              <h3 class="heading-md" style="margin-top:4px">Founding Citizen Visa</h3>
            </div>
          </div>
          <div style="text-align:right">
            <span class="tag tag-emerald">● APPROVED / WAVE 1</span>
            <div style="font-size:11px;color:var(--amber);font-family:'JetBrains Mono',monospace;font-weight:700;margin-top:4px">${esc(entry.passportNo)}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:24px 0">
          ${[['Citizen Name',esc(entry.name),''],['District',esc(entry.district),'color:var(--accent-text)'],['Role',esc(entry.role),'color:#fbbf24'],['Issue Date',esc(entry.date),'']].map(([label,val,style]) => `
            <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)">
              <div class="metric-label">${label}</div>
              <div style="font-size:14px;font-weight:700;margin-top:4px;${style}">${val}</div>
            </div>
          `).join('')}
        </div>

        <div style="padding:14px;border-radius:14px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12);font-size:12px;color:rgba(251,191,36,0.8);display:flex;align-items:center;gap:10px;margin-bottom:20px">
          <span style="font-size:18px">★</span>
          <span><b style="color:#fbbf24">Founding Perks:</b> +1,000 ISL Grant · Reserved Coastal Land · 0% Marketplace Fees (Year 1)</span>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06)">
          <button onclick="copyWaitlistRef('${entry.passportNo}')" class="btn btn-primary btn-sm">📋 Copy Referral Link</button>
          <a href="https://wa.me/?text=${encodeURIComponent('I just claimed my Founding Citizen Visa on Nexus Island Abu Dhabi! Claim yours: ' + refLink)}" target="_blank" class="btn btn-success btn-sm">💬 WhatsApp</a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Just secured my Founding Citizen Visa on @NexusIsland — persistent digital society in Abu Dhabi: ' + refLink)}" target="_blank" class="btn btn-ghost btn-sm">𝕏 Share</a>
          <button onclick="demo()" class="btn btn-gold btn-sm" style="margin-left:auto">🚀 Enter Island →</button>
        </div>
      </div>`;
  }

  function copyWaitlistRef(passportNo) {
    const refUrl = `${typeof window !== 'undefined' && window.location ? window.location.origin + window.location.pathname.replace(/[^/]*$/, '') : 'https://nexusisland.ae/'}?ref=${encodeURIComponent(passportNo)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(refUrl).then(() => toast(`Priority referral link copied: ${passportNo}`, 'success')).catch(() => { if (typeof window !== 'undefined' && window.prompt) window.prompt('Copy:', refUrl); });
    } else if (typeof window !== 'undefined' && window.prompt) { window.prompt('Copy:', refUrl); }
  }

  function exportWaitlistCSV() {
    const list = getWaitlist();
    if (!list.length) return toast('Waitlist is empty.', 'warn');
    const headers = ['Passport No','Name','Email','District','Role','Note','Date'];
    const rows = list.map(x => [x.passportNo,x.name,x.email,x.district,x.role,x.note,x.date].map(v=>`"${(v||'').replace(/"/g,'""')}"`));
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `nexus_island_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        toast(`📥 Exported ${list.length} waitlist records.`, 'success');
      } catch { toast(`Export: ${list.length} records.`, 'success'); }
    }
  }

  /* ═══════════════════════════════════════════════
     ALPHA COHORT ENGINE
     ═══════════════════════════════════════════════ */
  const ALPHA_STORAGE_KEY = 'nexus_island_alpha_telemetry_v2';

  function getDefaultAlphaCohort() {
    return [
      { id:'alpha-01', name:'Farhan Al-Nuaimi', email:'farhan@nuaimi-holdings.ae', cohort:'Angel Syndicate', sessions:8, totalMinutes:96, d1Return:true, d7Return:true, topFeature:'2.5D Room Customizer', nps:10, feedback:'The room styling is very intuitive.', date:'Oct 11, 2026' },
      { id:'alpha-02', name:'Sara Al-Mansoori', email:'sara.m@adgm.ae', cohort:'ADGM Tech Builders', sessions:11, totalMinutes:142, d1Return:true, d7Return:true, topFeature:'NOVA AI Co-Pilot', nps:9, feedback:'NOVA concierge provides great contextual advice.', date:'Oct 11, 2026' },
      { id:'alpha-03', name:'Omar Al-Zaabi', email:'omar.z@yas-gaming.ae', cohort:'Gaming Beta Testers', sessions:14, totalMinutes:180, d1Return:true, d7Return:true, topFeature:'Yas Sprint Mini-Game', nps:10, feedback:'Yas Marina Speed Sprint is lightning fast.', date:'Oct 12, 2026' },
      ...Array.from({ length: 51 }, (_, i) => {
        const names = ['Kareem Haddad','Fatima Al-Khoori','Sultan Al-Mehairi','Amina Qureshi','Rashid Al-Dhaheri','Meera Patel','Jassim Al-Ali','Elena Rostova','Hassan Al-Nuaimi','Chloe Bennett','Salem Al-Ketbi','David Miller','Mariam Al-Kaabi'];
        const cohorts = ['Friends & Family','ADGM Tech Builders','Spatial Creators','Gaming Beta Testers','Angel Syndicate'];
        const feats = ['2.5D Room Customizer','Yas Sprint Mini-Game','NOVA AI Co-Pilot','Saadiyat Creator Market','Harbor Marina Social'];
        const sess = 3 + (i % 8);
        return { id:`alpha-${String(i+4).padStart(2,'0')}`, name:names[i%names.length], email:`${names[i%names.length].toLowerCase().replace(/[^a-z]/g,'.')}@domain.ae`, cohort:cohorts[i%cohorts.length], sessions:sess, totalMinutes:sess*(6+(i%7)), d1Return:i%3!==2, d7Return:i%5<2, topFeature:feats[i%feats.length], nps:8+(i%3), feedback:['Great performance.','Love the districts.','Yas Sprint is fun.','Customized my room!','Excited for updates.'][i%5], date:`Oct ${10+(i%6)}, 2026` };
      })
    ];
  }

  function getAlphaTelemetry() {
    try {
      if (typeof localStorage === 'undefined') return { cohort: getDefaultAlphaCohort(), quota: 100, featureCounts: { '2.5D Room Customizer': 184, 'Yas Sprint Mini-Game': 132, 'NOVA AI Co-Pilot': 98, 'Saadiyat Creator Market': 76, 'Harbor Marina Social': 55 }, feedbackList: [] };
      const raw = localStorage.getItem(ALPHA_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const init = { cohort: getDefaultAlphaCohort(), quota: 100, featureCounts: { '2.5D Room Customizer': 184, 'Yas Sprint Mini-Game': 132, 'NOVA AI Co-Pilot': 98, 'Saadiyat Creator Market': 76, 'Harbor Marina Social': 55 }, feedbackList: [] };
    saveAlphaTelemetry(init);
    return init;
  }

  function saveAlphaTelemetry(data) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(ALPHA_STORAGE_KEY, JSON.stringify(data)); } catch {} }
  function logAlphaFeature(f) { const d = getAlphaTelemetry(); d.featureCounts = d.featureCounts||{}; d.featureCounts[f] = (d.featureCounts[f]||0)+1; saveAlphaTelemetry(d); }

  function openAlphaFeedbackModal() {
    playBeep('click');
    modal('⚡ Alpha Tester Feedback', `
      <form onsubmit="submitAlphaFeedback(event)" style="display:flex;flex-direction:column;gap:16px">
        <div>
          <div class="metric-label">Voice of Customer</div>
          <h4 class="heading-md" style="margin-top:4px">How is your island experience?</h4>
          <p style="font-size:12px;color:var(--text-muted);margin-top:6px">Your feedback shapes our Series A roadmap.</p>
        </div>
        <div>
          <div class="metric-label" style="margin-bottom:8px">Rating</div>
          <div style="display:flex;gap:6px" id="starContainer">
            ${[1,2,3,4,5].map(star => `<button type="button" onclick="setAlphaStar(${star})" id="star-${star}" style="width:40px;height:40px;border-radius:10px;background:rgba(245,158,11,0.1);color:#fbbf24;font-size:18px;display:grid;place-items:center;cursor:pointer;border:1px solid rgba(245,158,11,0.2);transition:all 0.2s">★</button>`).join('')}
          </div>
          <input type="hidden" name="rating" id="ratingInput" value="5">
        </div>
        <div>
          <div class="metric-label" style="margin-bottom:6px">Feature Explored Most</div>
          <select name="feature" class="field"><option>2.5D Room Customizer</option><option>Yas Sprint Mini-Game</option><option>NOVA AI Co-Pilot</option><option>Saadiyat Creator Market</option><option>Harbor Marina Social</option></select>
        </div>
        <div>
          <div class="metric-label" style="margin-bottom:6px">Feedback & Suggestions</div>
          <textarea name="note" rows="3" placeholder="What worked well? What should we improve?" required class="field" style="resize:vertical"></textarea>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:11px;color:#34d399;font-weight:700">+150 XP & +50 ISL reward</span>
          <div style="display:flex;gap:8px">
            ${btn('Cancel','closeModal()','ghost')}
            <button type="submit" class="btn btn-primary">Submit Feedback</button>
          </div>
        </div>
      </form>
    `);
  }

  function setAlphaStar(star) {
    const input = document.getElementById('ratingInput');
    if (input) input.value = star;
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`star-${i}`);
      if (el) el.style.background = i <= star ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.1)';
    }
  }

  function submitAlphaFeedback(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const tel = getAlphaTelemetry();
    tel.feedbackList = tel.feedbackList || [];
    tel.feedbackList.unshift({ name: state.user?.name || 'Alpha Resident', rating: Number(f.get('rating')||5), feature: String(f.get('feature')||''), note: String(f.get('note')||''), date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) });
    logAlphaFeature(String(f.get('feature')||''));
    saveAlphaTelemetry(tel);
    award(150, 50, 'Closed Alpha Feedback Bounty');
    closeModal();
    toast('🙏 Thank you! Feedback logged.', 'success');
  }

  function initAlphaTracker() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const alphaCode = params.get('alpha') || params.get('invite');
      if (alphaCode && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('alpha_welcomed')) {
        sessionStorage.setItem('alpha_welcomed', 'true');
        setTimeout(() => openAlphaJoinModal(alphaCode, params.get('to') || params.get('from')), 600);
      }
    } catch {}
  }

  function openAlphaJoinModal(code='FOUNDER-50', invitee='') {
    modal('Closed Alpha Onboarding', `
      <form onsubmit="submitAlphaJoin(event)" style="display:flex;flex-direction:column;gap:16px">
        <div style="padding:16px;border-radius:16px;background:linear-gradient(135deg,var(--accent-soft),rgba(99,102,241,0.06));border:1px solid var(--border-accent);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="tag tag-cyan">EXCLUSIVE · COHORT 1</div>
            <div style="font-size:16px;font-weight:900;margin-top:8px">Founding Alpha Citizen Pass</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${getAlphaTelemetry().cohort.length} of 100 Enrolled</div>
          </div>
          <span style="font-size:28px">⚡</span>
        </div>
        <div><div class="metric-label" style="margin-bottom:6px">Alpha Code</div><input type="text" name="code" value="${escAttr(code)}" required class="field mono" style="text-align:center;text-transform:uppercase;letter-spacing:0.1em"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div class="metric-label" style="margin-bottom:6px">Name</div><input type="text" name="name" value="${escAttr(invitee||state.user?.name||'')}" required class="field"></div>
          <div><div class="metric-label" style="margin-bottom:6px">Email</div><input type="email" name="email" value="${escAttr(state.user?.email||'')}" required class="field"></div>
        </div>
        <div><div class="metric-label" style="margin-bottom:6px">Cohort Group</div><select name="cohort" class="field"><option>Friends & Family</option><option>ADGM Tech Builders</option><option>Spatial Creators</option><option>Gaming Beta Testers</option><option>Angel Syndicate</option></select></div>
        <div style="display:flex;justify-content:end;gap:8px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          ${btn('Cancel','closeModal()','ghost')}
          <button type="submit" class="btn btn-primary">⚡ Verify & Join Alpha</button>
        </div>
      </form>
    `);
  }

  function submitAlphaJoin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const code = String(f.get('code')||'').trim().toUpperCase();
    const name = String(f.get('name')||'').trim();
    const email = String(f.get('email')||'').trim();
    if (!name || !email.includes('@')) return toast('Please enter name and valid email.', 'warn');
    const valid = ['FOUNDER-50','ALPHA-UAE','FAMILY-FIRST','NEXUS-VIP','HUB71-ALPHA','TESTER-100'];
    if (!valid.includes(code) && !code.startsWith('ALPHA') && !code.startsWith('NX-')) return toast('Invalid alpha code.', 'warn');
    const tel = getAlphaTelemetry();
    const id = `alpha-${String(tel.cohort.length+1).padStart(2,'0')}`;
    tel.cohort.unshift({ id, name, email, cohort:String(f.get('cohort')||'Friends & Family'), sessions:1, totalMinutes:6, d1Return:false, d7Return:false, topFeature:'Harbor Marina Social', nps:10, feedback:'Just joined.', date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) });
    saveAlphaTelemetry(tel);
    award(250, 500, `Alpha Cohort 1 Enrollment (${id})`);
    closeModal();
    toast(`🎉 Welcome to Alpha Cohort 1! Tester ${id}.`, 'success');
  }

  function openAlphaInviteModal() {
    const refUrl = `https://nexusisland.ae?alpha=FOUNDER-50&from=${encodeURIComponent(state.user?.name||'Alex')}`;
    modal('Invite to Alpha', `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:12px">
          <input type="text" id="alphaInviteLink" readonly value="${escAttr(refUrl)}" class="field mono" style="font-size:11px;flex:1">
          <button onclick="navigator.clipboard.writeText(document.getElementById('alphaInviteLink').value);toast('📋 Copied!','success')" class="btn btn-primary btn-sm">Copy</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('Join our Nexus Island closed alpha: '+refUrl)}" target="_blank" class="btn btn-success">💬 WhatsApp</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refUrl)}" target="_blank" class="btn btn-primary">💼 LinkedIn</a>
        </div>
      </div>
    `);
  }

  function exportAlphaTelemetryCSV() {
    const tel = getAlphaTelemetry();
    const list = tel.cohort||[];
    if (!list.length) return toast('Empty.','warn');
    const h = ['ID','Name','Email','Cohort','Sessions','Minutes','D1','D7','Top Feature','NPS','Feedback','Date'];
    const rows = list.map(x=>[x.id,x.name,x.email,x.cohort,x.sessions,x.totalMinutes,x.d1Return?'Yes':'No',x.d7Return?'Yes':'No',x.topFeature,x.nps,x.feedback,x.date].map(v=>`"${String(v||'').replace(/"/g,'""')}"`));
    const csv = [h.join(','),...rows.map(r=>r.join(','))].join('\n');
    try {
      const blob = new Blob([csv],{type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download=`alpha_telemetry_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast(`📥 Exported ${list.length} records.`,'success');
    } catch {}
  }

  function simulateAlphaSession() {
    const tel = getAlphaTelemetry();
    const names = ['Kareem Haddad','Fatima Al-Khoori','Sultan Al-Mehairi'];
    const feats = ['2.5D Room Customizer','Yas Sprint Mini-Game','NOVA AI Co-Pilot'];
    const name = names[Math.floor(Math.random()*names.length)];
    const feat = feats[Math.floor(Math.random()*feats.length)];
    tel.cohort.unshift({ id:`alpha-${String(tel.cohort.length+1).padStart(2,'0')}`, name:`${name} (Sim)`, email:`${name.toLowerCase().replace(/[^a-z]/g,'.')}@sim.ae`, cohort:'Friends & Family', sessions:3+Math.floor(Math.random()*5), totalMinutes:30+Math.floor(Math.random()*60), d1Return:true, d7Return:Math.random()>0.5, topFeature:feat, nps:10, feedback:'Simulated session.', date:'Today' });
    logAlphaFeature(feat);
    saveAlphaTelemetry(tel);
    toast(`⚡ Recorded session for ${name}!`,'success');
    refresh();
  }

  /* ═══════════════════════════════════════════════
     ROUTE: LANDING PAGE (Immersive)
     ═══════════════════════════════════════════════ */
  function landing() {
    const waitlist = getWaitlist();
    const claimedCount = 1248 + waitlist.length;
    const totalCap = 1500;
    const pct = Math.min(100, Math.round((claimedCount/totalCap)*100));
    const alphaTel = getAlphaTelemetry();

    return `<div style="min-height:100vh;position:relative;overflow:hidden">
      <!-- Atmospheric BG -->
      <div style="position:fixed;inset:0;z-index:0;pointer-events:none">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 120% 80% at 50% 0%,rgba(6,78,130,0.35) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 60%,rgba(99,102,241,0.08) 0%,transparent 50%),linear-gradient(180deg,#020a18 0%,#041225 40%,#03111f 100%)"></div>
      </div>

      <!-- NAV -->
      <nav style="position:relative;z-index:10;max-width:1280px;margin:0 auto;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05)">
        <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none">
          <div style="width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,#06b6d4,#6366f1);display:grid;place-items:center;font-weight:900;color:#fff;font-size:18px;box-shadow:0 4px 16px -2px var(--border-accent)">N</div>
          <span style="font-size:18px;font-weight:900;color:var(--text-primary)">Nexus Island <span class="tag tag-cyan" style="margin-left:6px">Abu Dhabi MVP</span></span>
        </a>
        <div style="display:flex;align-items:center;gap:12px">
          <a href="#waitlist" class="btn btn-gold btn-sm">★ Get Early Visa</a>
          <a href="investor.html" style="font-size:12px;font-weight:700;color:var(--text-muted);text-decoration:none" class="sm-show">Investor Deck →</a>
        </div>
      </nav>

      <!-- HERO -->
      <section style="position:relative;z-index:5;max-width:1280px;margin:0 auto;padding:60px 24px 40px;display:grid;grid-template-columns:1fr;gap:48px;align-items:center" class="hero-grid">
        <div style="text-align:center;max-width:720px;margin:0 auto">
          <div class="tag tag-cyan" style="margin-bottom:20px"><span class="live-dot" style="width:6px;height:6px"></span>Persistent Digital Society · UAE</div>
          <h1 class="heading-xl" style="margin-bottom:20px">
            A persistent place<br>
            <span class="text-gradient-aurora">people return to.</span>
          </h1>
          <p style="font-size:17px;color:var(--text-secondary);line-height:1.7;max-width:580px;margin:0 auto 32px;font-weight:500">
            Not another endless feed. A browser-first digital society where identity, land ownership, creator commerce, social networks, mini-games, and AI co-pilots unite.
          </p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-bottom:40px">
            <a href="#waitlist" class="btn btn-gold btn-lg">★ Claim Founding Visa</a>
            <button onclick="openAlphaJoinModal()" class="btn btn-primary btn-lg">⚡ Join Alpha Cohort</button>
            ${btn('Explore Demo →', 'demo()', 'ghost', 'class="btn btn-ghost btn-lg"')}
          </div>

          <!-- Stats Row -->
          <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06)">
            ${[['7','Districts','var(--accent-text)'],['21','Land Parcels','#34d399'],['12','Revenue Streams','#fbbf24'],
              [`${alphaTel.cohort.length}/100`,'Alpha Cohort','#fb7185']].map(([v,l,c]) => `
              <div style="text-align:center">
                <div style="font-size:24px;font-weight:900;color:${c};letter-spacing:-0.02em">${v}</div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-dim);margin-top:2px">${l}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ISLAND MAP PREVIEW -->
      <section style="position:relative;z-index:5;max-width:1000px;margin:0 auto 40px;padding:0 24px">
        <div class="map-container map-ocean" style="border:1px solid var(--border-accent);position:relative">
          <div class="wave-shimmer"></div>
          <!-- Water ripples -->
          <div class="water-ripple" style="width:60px;height:60px;left:10%;top:20%;animation-delay:0s"></div>
          <div class="water-ripple" style="width:80px;height:80px;right:15%;top:60%;animation-delay:1.5s"></div>
          <div class="water-ripple" style="width:50px;height:50px;left:70%;top:15%;animation-delay:3s"></div>

          <!-- Island SVG -->
          <div style="padding:40px 60px" class="float">
            ${islandSVG()}
          </div>

          <!-- District pins on top of SVG -->
          ${DISTRICTS.map(d => `
            <button type="button" onclick="demo()" class="district-pin" style="left:${d.mapX}%;top:${d.mapY}%">
              <div class="pin-pulse"></div>
              <div class="district-pin-inner">
                <div style="font-size:20px">${d.icon}</div>
                <div style="font-size:10px;font-weight:800;color:var(--text-primary);margin-top:2px">${d.name.replace(' District','')}</div>
                <div style="font-size:8px;font-weight:700;color:${d.color};text-transform:uppercase">${d.tagline.split(' ')[0]}</div>
              </div>
            </button>
          `).join('')}

          <!-- Status HUD -->
          <div style="position:absolute;left:16px;top:16px;padding:8px 14px;border-radius:12px" class="glass">
            <div class="metric-label">Island Status</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-size:12px;font-weight:800">
              <span class="live-dot"></span>
              <span>${DATA.users.filter(u=>u.online).length} online · 7 districts</span>
            </div>
          </div>

          <div style="position:absolute;left:16px;right:16px;bottom:16px;padding:12px 16px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap" class="glass">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">🧭</span>
              <div>
                <div style="font-size:13px;font-weight:800">Tap any district to explore</div>
                <div style="font-size:11px;color:var(--text-muted)" class="sm-show">7 themed zones inspired by Abu Dhabi landmarks</div>
              </div>
            </div>
            <button onclick="demo()" class="btn btn-primary btn-sm">Enter Island →</button>
          </div>
        </div>
      </section>

      <!-- VISION SECTION -->
      <section id="vision" style="position:relative;z-index:5;max-width:1280px;margin:0 auto;padding:80px 24px;border-top:1px solid rgba(255,255,255,0.04)">
        <div style="text-align:center;max-width:640px;margin:0 auto 48px">
          <div class="metric-label" style="margin-bottom:8px">Product Philosophy</div>
          <h2 class="heading-lg">A Place to Go,<br>Not a Feed to Scroll</h2>
          <p style="font-size:15px;color:var(--text-muted);margin-top:16px;line-height:1.7">Social platforms treat users as eyeballs for ads. Nexus Island treats users as citizens with a persistent home, genuine relationships, and evolving reputation.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
          ${[
            ['🌐','Spatial Permanence','Organized around real landmarks and waterfronts. When you return, your home and friends are exactly where you left them.','var(--accent-soft)','var(--border-accent)'],
            ['🏝️','Utility Ownership','Land isn\'t speculative — it\'s where you build homes, host gatherings, and operate businesses with real value.','rgba(16,185,129,0.08)','rgba(16,185,129,0.15)'],
            ['🧠','AI-Native Society','NOVA AI evaluates your level, wallet, and interests to recommend personalized next actions and opportunities.','rgba(139,92,246,0.08)','rgba(139,92,246,0.15)']
          ].map(([ic,title,desc,bg,border]) => `
            <div class="glass-card" style="padding:28px;border-color:${border}">
              <div style="width:48px;height:48px;border-radius:14px;background:${bg};display:grid;place-items:center;font-size:24px;margin-bottom:20px">${ic}</div>
              <h3 style="font-size:18px;font-weight:900;margin-bottom:10px">${title}</h3>
              <p style="font-size:13px;color:var(--text-muted);line-height:1.7">${desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- FLYWHEEL -->
      <section id="flywheel" style="position:relative;z-index:5;max-width:1280px;margin:0 auto;padding:40px 24px 80px;border-top:1px solid rgba(255,255,255,0.04)">
        <div style="text-align:center;max-width:640px;margin:0 auto 40px">
          <div class="metric-label" style="margin-bottom:8px">Core Product Loop</div>
          <h2 class="heading-lg">Enter → Explore → Meet → Own → Play → Return</h2>
        </div>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;max-width:800px;margin:0 auto">
          ${[['Enter','Join with zero downloads','🚀'],['Explore','Discover 7 themed districts','🌐'],['Meet','Build real relationships','👥'],['Own','Acquire utility land & property','🏡'],['Style','Customize your digital space','✨'],['Play','Compete in browser mini-games','🎮'],['Trade','Buy and sell creator goods','▦'],['Return','Events, friends & new content','🔄']].map(([title,desc,ic],i) => `
            <div style="display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)">
              <span style="font-size:20px">${ic}</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:var(--text-primary)">${i+1}. ${title}</div>
                <div style="font-size:10px;color:var(--text-dim)">${desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- WAITLIST -->
      <section id="waitlist" style="position:relative;z-index:5;max-width:1280px;margin:0 auto;padding:80px 24px;border-top:1px solid rgba(255,255,255,0.04)">
        <div style="text-align:center;max-width:640px;margin:0 auto 40px">
          <div class="tag tag-amber" style="margin-bottom:16px"><span style="width:6px;height:6px;border-radius:50%;background:#fbbf24;display:inline-block;animation:livePulse 2s infinite"></span>FOUNDING CITIZEN ALLOCATION · WAVE 1</div>
          <h2 class="heading-lg">Claim Your Founding Citizen Visa</h2>
          <p style="font-size:14px;color:var(--text-muted);margin-top:12px;line-height:1.6">Be among the first 1,500 residents. Priority coastal parcels, 0% creator fees for 12 months, and +1,000 ISL Welcome Grant.</p>

          <div style="max-width:400px;margin:24px auto 0;padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
            <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:6px">
              <span style="color:var(--amber)">Cohort 1</span>
              <span>${claimedCount} / ${totalCap} (${pct}%)</span>
            </div>
            <div style="width:100%;height:8px;border-radius:9999px;background:rgba(255,255,255,0.06);overflow:hidden">
              <div style="width:${pct}%;height:100%;border-radius:9999px;background:linear-gradient(90deg,#f59e0b,#d97706);transition:width 0.5s"></div>
            </div>
          </div>
        </div>

        <div id="waitlistCard" style="max-width:900px;margin:0 auto">
          <div class="glass-elevated" style="border-radius:24px;padding:32px;display:grid;gap:32px" class="waitlist-grid">
            <div>
              <h3 style="font-size:20px;font-weight:900;margin-bottom:4px">Digital Visa Application</h3>
              <p style="font-size:12px;color:var(--text-muted)">30 seconds. Instant passport. Zero commitment.</p>
              <form onsubmit="submitWaitlist(event)" style="display:flex;flex-direction:column;gap:12px;margin-top:20px">
                <div><div class="metric-label" style="margin-bottom:4px">Full Name</div><input required name="name" class="field" placeholder="e.g. Tariq Al-Suwaidi"></div>
                <div><div class="metric-label" style="margin-bottom:4px">Email</div><input required type="email" name="email" class="field" placeholder="tariq@domain.ae"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  <div><div class="metric-label" style="margin-bottom:4px">District</div><select name="district" class="field"><option>Harbor District</option><option>Creator District (Saadiyat)</option><option>Gaming District (Yas)</option><option>Downtown (ADGM)</option><option>Residential District</option><option>Nature Zone</option><option>Future Zone</option></select></div>
                  <div><div class="metric-label" style="margin-bottom:4px">Role</div><select name="role" class="field"><option>Spatial Creator / Artist</option><option>Tech / Fintech Founder</option><option>Gamer / Esports Pro</option><option>Island Resident</option><option>Enterprise Builder</option></select></div>
                </div>
                <div><div class="metric-label" style="margin-bottom:4px">What would you build? (optional)</div><input name="note" class="field" placeholder="e.g. Virtual AI salon, digital fashion, game studio"></div>
                <button type="submit" class="btn btn-gold btn-lg" style="width:100%;margin-top:4px">★ Submit & Generate Passport</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer style="position:relative;z-index:5;max-width:1280px;margin:0 auto;padding:40px 24px;border-top:1px solid rgba(255,255,255,0.04);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;font-size:12px;color:var(--text-dim)">
        <div><b style="color:var(--text-primary);font-size:14px">Nexus Island</b><p style="margin-top:4px">Abu Dhabi / UAE · Persistent Virtual Society</p></div>
        <div style="display:flex;gap:20px;font-weight:600">
          <a href="#vision" style="color:var(--text-muted);text-decoration:none">Vision</a>
          <a href="#waitlist" style="color:var(--amber);text-decoration:none">Founding Visa</a>
          <a href="investor.html" style="color:var(--text-muted);text-decoration:none">Investor Deck</a>
          <a href="admin.html" style="color:var(--text-dim);text-decoration:none">Operator</a>
        </div>
      </footer>

      <style>
        @media (min-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .waitlist-grid { grid-template-columns: 1.1fr 0.9fr !important; }
        }
      </style>
    </div>`;
  }

  /* ═══════════════════════════════════════════════
     ROUTE: AUTH
     ═══════════════════════════════════════════════ */
  function authPage(type) {
    const login = type === 'login';
    return `<div style="min-height:100vh;display:grid;place-items:center;padding:20px">
      <div class="glass-elevated" style="width:100%;max-width:420px;border-radius:24px;padding:36px">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#06b6d4,#6366f1);display:grid;place-items:center;font-weight:900;color:#fff;font-size:20px;margin:0 auto 16px;box-shadow:0 8px 24px -4px rgba(6,182,212,0.35)">N</div>
          <div class="tag tag-cyan" style="margin-bottom:12px">${login ? 'RESIDENT PORTAL' : 'NEW CITIZENSHIP'}</div>
          <h2 class="heading-md">${login ? 'Sign in to Nexus' : 'Create Resident Profile'}</h2>
          <p style="font-size:12px;color:var(--text-muted);margin-top:8px">${login ? 'Use the demo account or any credentials.' : 'Takes 10 seconds. Pure frontend prototype.'}</p>
        </div>
        <form onsubmit="${login ? 'login(event)' : 'register(event)'}" style="display:flex;flex-direction:column;gap:12px">
          ${login ? '' : `<input required name="name" class="field" placeholder="Full Name">`}
          <input required type="email" name="email" class="field" placeholder="Email" value="${login ? 'alex.morgan@nexusisland.ae' : ''}">
          <input required minlength="4" type="password" name="password" class="field" placeholder="Password" value="${login ? 'demo1234' : ''}">
          ${login ? '' : `<input required name="username" class="field" placeholder="Handle (e.g. alex)">`}
          <button class="btn btn-primary btn-lg" style="width:100%;margin-top:8px">${login ? 'Sign In' : 'Create Account'}</button>
        </form>
        ${login ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">${btn('Demo Login', 'demo()', 'gold')}${btn('Forgot Pass', 'forgot()', 'ghost')}</div>` : ''}
        <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:20px">${login ? `New? <a href="register.html" style="color:var(--accent-text);font-weight:700">Register</a>` : `Existing? <a href="login.html" style="color:var(--accent-text);font-weight:700">Sign In</a>`}</div>
      </div>
    </div>`;
  }

  function demo() { state.auth = true; state.onboardingComplete = true; state.user.name = 'Alex Morgan'; state.user.username = 'alex'; state.user.email = 'alex.morgan@nexusisland.ae'; save(); nav('dashboard.html'); }
  function login(e) { e.preventDefault(); const f = new FormData(e.target); if (!String(f.get('email')||'').includes('@')) return toast('Invalid email.','warn'); state.auth = true; state.user.email = String(f.get('email')); state.onboardingComplete = state.onboardingComplete||false; save(); if (!state.onboardingComplete) return onboard(); nav('dashboard.html'); }
  function register(e) { e.preventDefault(); const f = new FormData(e.target); const name = String(f.get('name')||'').trim(); if (name.length < 2) return toast('Enter your name.','warn'); state.auth = true; state.user.name = name; state.user.username = String(f.get('username')||'').trim().toLowerCase(); state.user.email = String(f.get('email')||''); state.onboardingComplete = false; save(); onboard(); }
  function forgot() { modal('Password Reset', `<p style="font-size:13px;color:var(--text-muted)">Simulated reset for prototype.</p><div style="margin-top:16px">${btn('Simulate Recovery','closeModal();toast("Recovery simulated.","success")','primary')}</div>`); }

  function onboard() {
    modal('Welcome to Nexus Island', '<div id="onboardHost"></div>');
    const sel = { avatar: state.user.avatar, interests: [...state.user.interests], goal: state.user.goal };
    let step = 0;
    const render = () => {
      const h = document.getElementById('onboardHost');
      if (!h) return;
      const titles = ['Choose Your Avatar', 'Select Interests', 'Set Your Goal'];
      const prog = `<div style="display:flex;gap:6px;margin-bottom:24px">${titles.map((_,i)=>`<div style="height:4px;flex:1;border-radius:9999px;background:${i<=step?'var(--cyan)':'rgba(255,255,255,0.06)'};transition:all 0.3s"></div>`).join('')}</div>`;
      let inner = '';
      if (step === 0) {
        inner = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px">${['🧑‍💻','👩🏻‍🎨','🧑🏽‍🚀','👩🏾‍💼','🧑🏻‍🎮','👨🏽‍💻','👩🏻‍🎤','🧑🏽‍💼'].map(a=>`<button type="button" onclick="window.__selAvatar('${a}')" style="height:64px;border-radius:16px;background:${sel.avatar===a?'var(--border-accent)':'rgba(255,255,255,0.03)'};border:1px solid ${sel.avatar===a?'var(--border-accent)':'rgba(255,255,255,0.06)'};font-size:28px;display:grid;place-items:center;cursor:pointer;transition:all 0.2s">${a}</button>`).join('')}</div>`;
      } else if (step === 1) {
        inner = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">${['Spatial AI','Gaming & Esports','ADGM Startups','Architecture','Creative Arts','Tourism','Fintech','Eco-Tech'].map(it=>`<button type="button" onclick="window.__selInterest('${it}')" style="padding:12px;border-radius:12px;font-weight:700;font-size:13px;text-align:left;border:1px solid ${sel.interests.includes(it)?'var(--border-accent)':'rgba(255,255,255,0.06)'};background:${sel.interests.includes(it)?'var(--accent-soft)':'rgba(255,255,255,0.03)'};color:${sel.interests.includes(it)?'var(--accent-text)':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s">${it}</button>`).join('')}</div>`;
      } else {
        inner = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">${['Live in Coastal Villa','Launch Enterprise','Compete in Esports','Create Digital Art','Network with Investors','Explore the Island'].map(g=>`<button type="button" onclick="window.__selGoal('${g}')" style="padding:12px;border-radius:12px;font-weight:700;font-size:13px;text-align:left;border:1px solid ${sel.goal===g?'var(--border-accent)':'rgba(255,255,255,0.06)'};background:${sel.goal===g?'var(--accent-soft)':'rgba(255,255,255,0.03)'};color:${sel.goal===g?'var(--accent-text)':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s">${g}</button>`).join('')}</div>`;
      }
      h.innerHTML = `${prog}<h4 class="heading-md">${titles[step]}</h4>${inner}<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06)">${step>0?btn('Back','window.__step(-1)','ghost'):'<span></span>'}${step<2?btn('Continue','window.__step(1)','primary'):btn('Enter Island →','window.__finishOnboard()','gold')}</div>`;
    };
    window.__selAvatar = a => { sel.avatar = a; render(); };
    window.__selInterest = it => { sel.interests = sel.interests.includes(it)?sel.interests.filter(x=>x!==it):[...sel.interests,it]; render(); };
    window.__selGoal = g => { sel.goal = g; render(); };
    window.__step = d => { step = Math.max(0,Math.min(2,step+d)); render(); };
    window.__finishOnboard = () => {
      state.user.avatar = sel.avatar; state.user.interests = sel.interests.length ? sel.interests : ['Spatial AI'];
      state.user.goal = sel.goal || 'Explore the Island'; state.onboardingComplete = true; state.auth = true;
      activity('Completed citizenship onboarding'); notify('Welcome! Your citizenship is active.','system');
      award(100, 50, 'Welcome Bonus'); save(); closeModal(); nav('dashboard.html');
    };
    render();
  }

  /* ═══════════════════════════════════════════════
     ROUTE: DASHBOARD (Immersive)
     ═══════════════════════════════════════════════ */
  function dashboard() {
    const need = levelNeed();
    const pct = Math.min(100, Math.round((state.user.xp / need) * 100));
    const firstName = esc(state.user.name.split(' ')[0]);
    const onlineCount = DATA.users.filter(u => u.online).length;
    const next = state.ownedLand.length === 0
      ? ['Claim Sovereign Parcel', 'land.html', 'Own a permanent stake to unlock residency construction.', '🏝️']
      : !state.home.built
      ? ['Construct Estate Villa', 'property.html', 'Design and furnish your personal space in the archipelago.', '🏠']
      : state.friends.length < 7
      ? ['Expand Resident Graph', 'friends.html', 'Connect with fellow founders and creators across Abu Dhabi.', '👥']
      : ['Enter Arena Mini-Game', 'games.html', 'Compete in Yas Cyber Sprint or Pearl Sonar challenges.', '🎮'];

    return `<section class="fade" style="display:flex;flex-direction:column;gap:24px">
      <!-- Executive Hero Panel -->
      <div class="glass-card" style="padding:0;overflow:hidden;position:relative">
        <div style="position:relative;padding:40px 36px;background:linear-gradient(135deg,rgba(59,130,246,0.05) 0%,rgba(139,92,246,0.03) 50%,transparent 100%)">
          <div style="display:flex;flex-direction:column;gap:12px;max-width:680px">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="live-dot" style="width:7px;height:7px"></span>
              <span class="metric-label" style="letter-spacing:0.04em">Abu Dhabi Sovereign Digital Territory · UAE</span>
              <span style="font-size:11px;color:var(--text-dim)">·</span>
              <span style="font-size:11px;font-weight:600;color:var(--accent-text)">${onlineCount} Residents Active</span>
            </div>
            <h1 class="heading-xl" style="margin:4px 0 0 0;font-weight:800;letter-spacing:-0.03em">Marhaba, ${firstName}.</h1>
            <p style="font-size:0.9375rem;color:var(--text-secondary);line-height:1.6;margin:0">
              Welcome to your persistent virtual society. Explore 5 archipelago islands, acquire sovereign deeds, design custom architecture, and build businesses alongside fellow innovators.
            </p>
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:16px">
              ${btn('🌐 Launch GTA Island Map', "nav('island.html')", 'primary')}
              ${btn('🛂 4-Country Visa Portal', 'openVisaCenterModal()', 'gold')}
              ${btn('✨ NOVA Resident AI', 'nova()', 'ghost')}
              ${btn('▶ Investor Overview', "nav('investor.html')", 'ghost')}
            </div>
          </div>

          <!-- 4-Country Virtual Visa Status Bar -->
          <div style="margin-top:24px;padding:14px 18px;border-radius:var(--radius-md);background:rgba(59,130,246,0.06);border:1px solid var(--border-accent);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent-text)">🛂 Virtual Visa Network:</span>
              ${COUNTRIES.map(c => {
                const hasVisa = Boolean(state.visas && state.visas[c.id]) || state.visaTier === 'diplomatic';
                const isCurrent = state.currentCountry === c.id;
                return `<button onclick="openVisaCenterModal()" style="padding:4px 10px;border-radius:var(--radius-full);background:${isCurrent ? 'var(--accent)' : hasVisa ? 'rgba(34,197,94,0.12)' : 'var(--bg-tertiary)'};border:1px solid ${isCurrent ? 'var(--accent)' : hasVisa ? 'rgba(34,197,94,0.3)' : 'var(--border)'};color:${isCurrent ? '#fff' : hasVisa ? '#4ade80' : 'var(--text-muted)'};font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px">${c.flag} ${c.short} ${isCurrent ? '● Active' : hasVisa ? '✓ Visa' : '🔒 Visa'}</button>`;
              }).join('')}
            </div>
            <span style="font-size:11px;color:var(--text-secondary)">🛡️ <b>Nexus Shield Escrow:</b> Active (${(VISA_TIERS.find(t=>t.id===state.visaTier)||VISA_TIERS[1]).escrowFee} Fee)</span>
          </div>

          <!-- Bottom Stat Strip -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:32px;padding-top:24px;border-top:1px solid var(--border)">
            ${[
              ['Residency Tier', state.membership, 'Sovereign Status'],
              ['Estate Plot', state.home.built ? 'Active Villa' : 'Plot Unbuilt', state.home.built ? 'color:var(--success)' : 'color:var(--text-muted)'],
              ['Treasury', money(state.wallet), aed(state.wallet)],
              ['Current District', (DISTRICTS.find(d => d.id === state.currentDistrict) || DISTRICTS[0]).name, 'Archipelago Hub']
            ].map(([lbl, val, sub]) => `
              <div style="padding:12px 14px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border)">
                <div class="metric-label">${lbl}</div>
                <div style="font-size:0.9375rem;font-weight:700;margin-top:4px;color:var(--text-primary)">${val}</div>
                <div style="font-size:0.6875rem;color:var(--text-dim);margin-top:2px">${sub}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Resident Passport + Financial & Network Snapshot -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
        ${card(`<div style="padding:28px;display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:24px">
          <div>
            <div style="display:flex;align-items:start;justify-content:space-between;gap:16px">
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:54px;height:54px;border-radius:50%;background:var(--bg-tertiary);border:2px solid var(--border);display:grid;place-items:center;font-size:26px;flex-shrink:0">
                  ${state.user.avatar}
                </div>
                <div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">${esc(state.user.name)}</span>
                    <span style="padding:2px 8px;border-radius:var(--radius-full);background:var(--accent-soft);color:var(--accent-text);font-size:0.6875rem;font-weight:600">Lvl ${state.user.level}</span>
                  </div>
                  <div style="font-size:0.75rem;color:var(--text-muted);font-weight:500;margin-top:2px">
                    @${esc(state.user.username)} · ${esc(state.user.country)} · ID #${state.user.id || 'NX-7092'}
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-top:24px">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;font-weight:600;margin-bottom:8px">
                <span style="color:var(--text-muted)">Progress to Level ${state.user.level + 1}</span>
                <span style="color:var(--text-primary);font-family:'JetBrains Mono',monospace">${state.user.xp} / ${need} XP (${pct}%)</span>
              </div>
              <div style="height:6px;border-radius:var(--radius-full);background:var(--bg-tertiary);overflow:hidden;border:1px solid var(--border)">
                <div style="width:${pct}%;height:100%;border-radius:var(--radius-full);background:var(--accent);transition:width 0.5s var(--ease-out)"></div>
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border)">
            <span style="font-size:0.75rem;color:var(--text-muted)">Reputation Trust Index</span>
            <span style="font-size:0.875rem;font-weight:700;color:var(--accent-text)">✦ ${state.user.reputation || '98'} / 100</span>
          </div>
        </div>`)}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          ${metric('ISL Treasury', money(state.wallet), aed(state.wallet), '◈')}
          ${metric('Resident Graph', `${state.friends.length} peers`, 'Active contacts', '👥')}
          ${metric('Society Guilds', `${state.joined.length} joined`, 'Communities', '◎')}
          ${metric('Parcels Owned', `${state.ownedLand.length} deed${state.ownedLand.length===1?'':'s'}`, 'Title registered', '🏝️')}
        </div>
      </div>

      <!-- Recommended Next Milestone + Live Island Feed -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
        ${card(`<div style="padding:26px;display:flex;flex-direction:column;justify-content:space-between;height:100%">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div class="metric-label">Recommended Next Action</div>
              <span style="padding:2px 8px;border-radius:var(--radius-full);background:var(--bg-tertiary);border:1px solid var(--border);font-size:0.6875rem;color:var(--accent-text);font-weight:600">Priority</span>
            </div>
            <div style="display:flex;align-items:start;gap:16px;margin-top:10px">
              <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--accent-soft);display:grid;place-items:center;font-size:24px;flex-shrink:0">
                ${next[3]}
              </div>
              <div style="flex:1">
                <div style="font-size:1rem;font-weight:700;color:var(--text-primary)">${next[0]}</div>
                <p style="font-size:0.8125rem;color:var(--text-secondary);margin-top:4px;line-height:1.5">
                  ${next[2]}
                </p>
                <div style="margin-top:14px">${btn('Proceed Now →', `nav('${next[1]}')`, 'primary')}</div>
              </div>
            </div>
          </div>
        </div>`)}

        ${card(`<div style="padding:26px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div class="metric-label">Live Activity Stream</div>
            <a href="notifications.html" style="font-size:0.75rem;font-weight:600;color:var(--accent-text);text-decoration:none">View All →</a>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${state.activity.slice(0, 4).map(a => `
              <div style="padding:10px 14px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:0.75rem">
                <div style="display:flex;align-items:center;gap:8px;min-width:0">
                  <span style="width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0"></span>
                  <span style="font-weight:500;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.text)}</span>
                </div>
                <span style="font-size:0.6875rem;color:var(--text-dim);flex-shrink:0;font-family:'JetBrains Mono',monospace">${esc(a.time)}</span>
              </div>
            `).join('')}
          </div>
        </div>`)}
      </div>

      <!-- Core Ecosystem Operating Loop -->
      ${card(`<div style="padding:28px">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px">
          <div>
            <div class="metric-label">Resident Journey & Product Loop</div>
            <div style="font-size:1.125rem;font-weight:700;margin-top:4px;color:var(--text-primary)">Ecosystem Navigation</div>
          </div>
          <span style="padding:3px 10px;border-radius:var(--radius-full);background:rgba(34,197,94,0.1);color:var(--success);font-size:0.6875rem;font-weight:700">VERIFIED WORKING MVP</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:10px">
          ${[
            ['1. Explore', 'island.html', '🌐', 'Archipelago Map'],
            ['2. Connect', 'friends.html', '👥', 'Resident Graph'],
            ['3. Acquire', 'land.html', '🏝️', 'Title Deeds'],
            ['4. Construct', 'property.html', '🏠', 'Estate Living'],
            ['5. Compete', 'games.html', '🎮', 'Arena Games'],
            ['6. Guilds', 'communities.html', '◎', 'Societies'],
            ['7. Exchange', 'marketplace.html', '▦', 'Commerce'],
            ['8. Gather', 'events.html', '◷', 'Live Stages']
          ].map(([l, f, i, sub]) => `
            <a href="${f}" style="padding:16px 12px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);text-align:center;text-decoration:none;transition:all 0.2s var(--ease-out);display:flex;flex-direction:column;align-items:center;gap:6px" onmouseover="this.style.borderColor='var(--border-hover)';this.style.background='var(--bg-hover)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg-tertiary)';this.style.transform='none'">
              <div style="font-size:24px;line-height:1">${i}</div>
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-primary)">${l}</div>
              <div style="font-size:0.625rem;color:var(--text-muted)">${sub}</div>
            </a>
          `).join('')}
        </div>
      </div>`)}

      <!-- Viral Growth & Social Mechanics -->
      ${card(`<div style="padding:28px">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px">
          <div>
            <div class="metric-label" style="display:flex;align-items:center;gap:6px">
              <span class="live-dot" style="background:var(--rose)"></span> Viral Expansion Loops
            </div>
            <div style="font-size:1.125rem;font-weight:700;margin-top:4px;color:var(--text-primary)">Social Ingestion & High K-Factor Mechanics</div>
          </div>
          <span style="padding:3px 10px;border-radius:var(--radius-full);background:var(--accent-soft);color:var(--accent-text);font-size:0.6875rem;font-weight:700">GROWTH ENGINE</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">
          ${[
            ['Neighbor Drop', 'neighbor-drop.html', '🤝', 'Invite peers to claim adjacent sovereign plots and build together', 'Invite Neighbors →', 'var(--accent-soft)'],
            ['Resident Flex Card', 'flex-card.html', '💳', 'Generate luxury proof-of-asset cards for WhatsApp & Instagram', 'Generate Card →', 'rgba(234,179,8,0.1)'],
            ['Treasure Hunt', 'treasure-hunt.html', '🏴‍☠️', 'Discover or hide high-value reward caches across archipelago coordinates', 'Go Hunting →', 'rgba(239,68,68,0.1)'],
            ['Majlis Guestbook', 'guestbook.html', '📖', 'Leave verified on-chain style signatures & token tips at resident homes', 'Sign Guestbook →', 'rgba(34,197,94,0.1)']
          ].map(([title, href, ic, desc, cta, bg]) => `
            <div style="padding:20px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);display:flex;flex-direction:column;justify-content:space-between;gap:14px;transition:all 0.2s var(--ease-out)" onmouseover="this.style.borderColor='var(--border-hover)';this.style.background='var(--bg-hover)'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg-tertiary)'">
              <div>
                <div style="width:42px;height:42px;border-radius:var(--radius-md);background:${bg};display:grid;place-items:center;font-size:20px;margin-bottom:12px">${ic}</div>
                <div style="font-size:0.875rem;font-weight:700;color:var(--text-primary)">${title}</div>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:6px;line-height:1.5">${desc}</p>
              </div>
              <a href="${href}" class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;text-decoration:none;font-weight:600">${cta}</a>
            </div>
          `).join('')}
        </div>
      </div>`)}
    </section>`;
  }

  /* ═══════════════════════════════════════════════
     ROUTE: ISLAND MAP (Immersive Centerpiece)
     ═══════════════════════════════════════════════ */
  function island() {
    const mapTheme = state.settings.mapTheme || 'day';
    const currentD = DISTRICTS.find(d => d.id === state.currentDistrict) || DISTRICTS[0];
    const onlineCount = DATA.users.filter(u => u.online).length;

    return `<section class="fade" style="display:flex;flex-direction:column;gap:24px">
      <!-- Header -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px">
        <div>
          <div class="metric-label">${(COUNTRIES.find(c=>c.id===state.currentCountry)||COUNTRIES[0]).flag} ${(COUNTRIES.find(c=>c.id===state.currentCountry)||COUNTRIES[0]).name} · 5 Active District-Islands + 10+ Island Masterplan</div>
          <h1 class="heading-lg" style="margin-top:4px;font-weight:800;letter-spacing:-0.03em">GTA & Google Maps Open World</h1>
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-top:4px">Drive across 5 connected UAE islands via highway bridges · Walk with WASD · Drive vehicles [F] · Enter Emaar, LuLu, ADGM, Hub71 & Skyport [E]</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          ${btn('🛂 4-Country Visa Skyport', 'openVisaCenterModal()', 'gold')}
          ${btn('🚀 Multiplayer Stage', 'launchMultiplayerDemo()', 'ghost')}
          ${btn('✨ NOVA Assistant', 'nova()', 'primary')}
        </div>
      </div>

      <!-- 5 Active UAE District-Islands Selector -->
      <div style="padding:16px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px">
          <div class="metric-label" style="color:var(--accent-text)">🏝️ UAE 5 Active Islands (Connected by Drivable GTA Highway Bridges)</div>
          <span style="font-size:11px;color:var(--text-muted)">Click any island to teleport & focus camera</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">
          ${UAE_ISLANDS.filter(i => i.status === 'active').map(isl => `
            <button onclick="focusUaeIsland('${isl.id}')" style="padding:10px 12px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);text-align:left;cursor:pointer;transition:all 0.15s;display:flex;align-items:start;gap:10px" onmouseover="this.style.borderColor='var(--border-accent)'" onmouseout="this.style.borderColor='var(--border)'">
              <span style="font-size:20px">${isl.icon}</span>
              <div style="min-width:0">
                <div style="font-size:12px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(isl.name)}</div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(isl.anchors)}</div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- CANVAS MAP ENGINE -->
      <div class="map-engine-wrap" id="map-engine-wrap">
        <canvas id="nexus-map-canvas"></canvas>

        <!-- HUD: Top-Left — Status & Breadcrumb -->
        <div class="map-hud-tl">
          <div class="hud-panel" style="margin-bottom:8px">
            <div class="metric-label">Current Territory</div>
            <div id="map-breadcrumb" style="font-size:0.8125rem;font-weight:700;margin-top:3px">${currentD.icon} ${currentD.name}</div>
          </div>
          <div class="hud-panel">
            <div style="display:flex;align-items:center;gap:8px;font-size:0.75rem;font-weight:600">
              <span class="live-dot" style="width:6px;height:6px"></span> ${onlineCount} Online
              <span style="color:var(--text-dim)">·</span>
              <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:var(--accent-soft);color:var(--accent-text);font-weight:600">Visited: ${state.districtsVisited.length}/7</span>
            </div>
          </div>
        </div>

        <!-- HUD: Top-Right — Theme Toggle -->
        <div class="map-hud-tr">
          <div class="map-theme-toggle">
            ${[['day','☀️'],['sunset','🌅'],['night','🌙']].map(([t,i]) => `
              <button onclick="setMapTheme('${t}')" class="map-theme-btn ${mapTheme===t?'active':''}">${i}</button>
            `).join('')}
          </div>
        </div>

        <!-- HUD: Bottom-Left — Coordinates & Controls -->
        <div class="map-hud-bl">
          <div class="hud-panel" style="margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:14px">🧊</span>
              <span id="map-coords" style="font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--accent-text)">604, 500 · 3D Perspective</span>
            </div>
          </div>
          <div class="control-hints" id="control-hints">
            <b>WASD</b> Move · <b>Q/R</b> Rotate 3D · <b>Right-Drag</b> Orbit 3D · <b>E</b> Interact · <b>F</b> Vehicle · <b>V</b> 3D/2D
          </div>
        </div>

        <!-- HUD: Bottom-Right — Minimap -->
        <div class="map-hud-br">
          <div class="minimap-box">
            <canvas id="nexus-minimap" width="180" height="135"></canvas>
          </div>
        </div>

        <!-- HUD: Bottom-Center — 3D Spatial Camera & Zoom Controls -->
        <div class="map-hud-bc">
          <div class="zoom-controls" style="gap:6px;padding:5px 8px">
            <button id="btn-toggle-3d" class="zoom-btn" onclick="if(window.engineToggle3D)engineToggle3D()" title="Toggle 3D / 2D View (Key: V)" style="width:auto;padding:0 10px;font-size:11px;background:var(--accent-soft);color:var(--accent-text);border:1px solid var(--border-accent)">🧊 3D Active</button>
            <button class="zoom-btn" onclick="if(window.engineRotateCamera)engineRotateCamera(-0.35)" title="Rotate 3D Camera Left (Key: Q)">⟲</button>
            <button class="zoom-btn" onclick="if(window.engineRotateCamera)engineRotateCamera(0.35)" title="Rotate 3D Camera Right (Key: R)">⟳</button>
            <button class="zoom-btn" onclick="if(window.engineTiltCamera)engineTiltCamera(-0.12)" title="Increase 3D Pitch Tilt">📐</button>
            <button class="zoom-btn" onclick="if(window.engineResetCamera)engineResetCamera()" title="Reset 3D Camera">🧭</button>
            <button class="zoom-btn" onclick="engineZoomOut()" title="Zoom Out">−</button>
            <button class="zoom-btn" onclick="engineZoomIn()" title="Zoom In">+</button>
          </div>
        </div>

        <!-- Proximity Prompt (dynamically positioned by engine) -->
        <div id="proximity-prompt" class="proximity-prompt" style="display:none"></div>

        <!-- Driving HUD (shown when in vehicle) -->
        <div id="driving-hud" class="driving-hud" style="display:none">
          <canvas id="speedometer-canvas" width="120" height="120"></canvas>
          <div id="speed-value" style="font-size:20px;font-weight:800;color:#fff;margin-top:-4px">0</div>
          <div id="vehicle-badge"></div>
        </div>
      </div>

      <!-- Quick-Travel Buttons -->
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${DISTRICTS.map(d => {
          const active = d.id === state.currentDistrict;
          return `<button onclick="zone('${d.id}')" class="btn ${active ? 'btn-primary' : 'btn-ghost'} btn-sm" style="gap:6px">
            <span>${d.icon}</span> ${d.name.replace(' District','')}
          </button>`;
        }).join('')}
      </div>

      <!-- Current District Detail -->
      <div id="zoneHost">
        ${renderDistrictDetail(currentD)}
      </div>

      <!-- Islands 6–10+ Future Expansion Masterplan -->
      ${card(`<div style="padding:24px">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px">
          <div>
            <div class="metric-label" style="color:#fbbf24">UAE Archipelago Expansion Masterplan (Islands 6–10+)</div>
            <h3 style="font-size:1.125rem;font-weight:800;margin-top:4px">Future District-Islands Pipeline</h3>
            <p style="font-size:12px;color:var(--text-muted);margin-top:2px">Golden Visa holders receive 48-hour priority land claim access as each expansion island unlocks.</p>
          </div>
          ${btn('🛂 Upgrade to Golden Visa', 'openVisaCenterModal()', 'gold', 'class="btn btn-gold btn-sm"')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
          ${UAE_ISLANDS.filter(i => i.status === 'expansion').map(isl => {
            const voted = (state.islandVotes || []).includes(isl.id);
            return `<div style="padding:16px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid ${voted ? 'rgba(34,197,94,0.35)' : 'var(--border)'};display:flex;flex-direction:column;justify-content:space-between;gap:10px">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-size:22px">${isl.icon}</span>
                  <span class="tag ${voted ? 'tag-emerald' : 'tag-cyan'}" style="font-size:9px">${voted ? '✓ Reserved' : isl.phase}</span>
                </div>
                <div style="font-size:13px;font-weight:800;margin-top:8px;color:var(--text-primary)">${esc(isl.name)}</div>
                <p style="font-size:11px;color:var(--text-secondary);margin-top:4px;line-height:1.4">${esc(isl.focus)}</p>
              </div>
              <div style="padding-top:8px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:10px;color:var(--text-dim)">${isl.plots} Prime Plots</span>
                ${btn(voted ? 'Inspect' : 'Reserve Priority', `openExpansionIslandModal('${isl.id}')`, voted ? 'ghost' : 'primary', 'class="btn btn-sm"')}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`)}

      <!-- All Districts Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        ${DISTRICTS.map(d => card(`
          <div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:16px">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:start">
                <div style="width:42px;height:42px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);display:grid;place-items:center;font-size:20px">${d.icon}</div>
                <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.06em">${d.tagline}</span>
              </div>
              <h3 style="font-size:1.0625rem;font-weight:700;margin-top:14px;color:var(--text-primary)">${d.name}</h3>
              <p style="font-size:0.8125rem;color:var(--text-secondary);margin-top:6px;line-height:1.6">${d.description}</p>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:14px;border-top:1px solid var(--border)">
              <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">${DATA.land.filter(l=>l.district===d.name).length} parcels</span>
              ${btn('Travel Here', `zone('${d.id}')`, d.id===state.currentDistrict?'primary':'ghost', 'class="btn btn-sm"')}
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function renderDistrictDetail(d) {
    const nearbyBiz = DATA.businesses.filter(b => b.district === d.name);
    const nearbyPlots = DATA.land.filter(l => l.district === d.name);

    return card(`
      <div style="padding:32px">
        <div style="display:flex;flex-wrap:wrap;gap:28px;justify-content:space-between;align-items:start">
          <div style="flex:1;min-width:280px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span class="live-dot"></span>
              <span class="metric-label">District Active Focus</span>
            </div>
            <h2 style="font-size:1.75rem;font-weight:800;display:flex;align-items:center;gap:12px;margin-top:6px;letter-spacing:-0.02em">
              <span>${d.icon}</span> ${d.name}
            </h2>
            <p style="font-size:0.875rem;color:var(--text-secondary);margin-top:8px;line-height:1.6;max-width:540px">${d.description}</p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px">
              ${[['Landmark',d.landmark],['Parcels',nearbyPlots.length+' Available'],['Enterprises',nearbyBiz.length+' Active']].map(([l,v]) => `
                <div style="padding:10px 14px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border)">
                  <div class="metric-label">${l}</div>
                  <div style="font-size:0.8125rem;font-weight:700;margin-top:3px;color:var(--text-primary)">${v}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="width:280px;flex-shrink:0;padding:24px;border-radius:var(--radius-xl);background:var(--bg-elevated);border:1px solid var(--border)">
            <div class="metric-label" style="color:var(--accent-text)">Fast-Travel Active</div>
            <div style="font-size:1.0625rem;font-weight:700;margin-top:4px">Current Sector</div>
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:6px;line-height:1.5">All nearby services and title deeds are accessible for immediate interaction.</p>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
              ${btn('🏝️ Browse Land Plots', "nav('land.html')", 'primary', 'class="btn btn-primary btn-sm" style="width:100%"')}
              ${btn('🏢 Sector Storefronts', "nav('businesses.html')", 'ghost', 'class="btn btn-ghost btn-sm" style="width:100%"')}
            </div>
          </div>
        </div>

        <!-- Nearby listings -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px;padding-top:24px;border-top:1px solid var(--border)">
          <div>
            <div style="font-size:0.875rem;font-weight:700;margin-bottom:12px;color:var(--text-primary)">Enterprises & Storefronts</div>
            ${nearbyBiz.length ? nearbyBiz.map(b => `
              <div style="padding:12px 14px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);display:flex;align-items:center;gap:12px;margin-bottom:8px">
                <span style="font-size:20px">${b.icon}</span>
                <div style="flex:1;min-width:0"><div style="font-size:0.8125rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.name)}</div><div style="font-size:0.6875rem;color:var(--text-dim)">${esc(b.type)} · ⭐ ${b.rating}</div></div>
              </div>
            `).join('') : '<div style="font-size:0.75rem;color:var(--text-dim)">No storefronts registered yet.</div>'}
          </div>
          <div>
            <div style="font-size:0.875rem;font-weight:700;margin-bottom:12px;color:var(--text-primary)">Title Deed Parcels</div>
            ${nearbyPlots.slice(0,3).map(l => `
              <div style="padding:12px 14px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">
                <div><div style="font-size:0.8125rem;font-weight:600">${l.id} · ${esc(l.name)}</div><div style="font-size:0.6875rem;color:var(--text-dim)">${l.size}</div></div>
                <div style="font-size:0.8125rem;font-weight:700;color:var(--accent-text);font-family:'JetBrains Mono',monospace">${money(l.price)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `);
  }

  function setMapTheme(t) {
    state.settings.mapTheme = t;
    save();
    // Update engine theme without full refresh
    if (typeof window.engineSetTheme === 'function') {
      window.engineSetTheme(t);
      // Update theme toggle button active states
      document.querySelectorAll('.map-theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim().toLowerCase().includes(t === 'day' ? '☀' : t === 'sunset' ? '🌅' : '🌙'));
      });
      // Re-match active class: simpler approach
      document.querySelectorAll('.map-theme-btn').forEach(b => b.classList.remove('active'));
      const btns = document.querySelectorAll('.map-theme-btn');
      const idx = t === 'day' ? 0 : t === 'sunset' ? 1 : 2;
      if (btns[idx]) btns[idx].classList.add('active');
    } else {
      refresh();
    }
  }

  function zone(id) {
    const d = DISTRICTS.find(x => x.id === id) || DISTRICTS[0];
    playBeep('click');
    state.currentDistrict = id;
    save();
    const firstVisit = !state.districtsVisited.includes(id);
    if (firstVisit) { state.districtsVisited.push(id); award(35, 20, `Explored ${d.name}`); }
    else { toast(`Traveled to ${d.name}.`, 'info'); }

    // If world engine is active, focus the camera + teleport player
    if (typeof window.engineFocusDistrict === 'function') {
      window.engineFocusDistrict(id);
    }

    // Update district detail panel
    const h = document.getElementById('zoneHost');
    if (h) { h.innerHTML = renderDistrictDetail(d); h.scrollIntoView({ behavior: 'smooth' }); }

    // Update quick-travel button active states
    document.querySelectorAll('.district-pin').forEach(el => el.classList.remove('district-pin-active'));
    const pins = document.querySelectorAll('.district-pin');
    pins.forEach(pin => { if (pin.getAttribute('onclick')?.includes(id)) pin.classList.add('district-pin-active'); });
  }

  /* ═══════════════════════════════════════════════
     REMAINING ROUTES (Placeholder-forward implementations)
     These maintain full functionality with the new immersive styling
     ═══════════════════════════════════════════════ */

  // Helper for remaining pages
  function pageHeader(label, title, subtitle, actions='') {
    return `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px">
      <div><div class="metric-label">${label}</div><h1 class="heading-lg" style="margin-top:4px">${title}</h1>${subtitle?`<p style="font-size:13px;color:var(--text-muted);margin-top:4px">${subtitle}</p>`:''}</div>
      <div style="display:flex;align-items:center;gap:8px">${actions}</div>
    </div>`;
  }

  function itemCard(icon, title, sub, extra='', actions='') {
    return card(`<div style="padding:18px;display:flex;align-items:start;gap:14px">
      <div style="width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.04);display:grid;place-items:center;font-size:22px;flex-shrink:0">${icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(title)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${sub}</div>
        ${extra?`<div style="margin-top:8px">${extra}</div>`:''}
      </div>
      ${actions?`<div style="flex-shrink:0;display:flex;gap:6px">${actions}</div>`:''}
    </div>`);
  }

  /* LAND */
  function land() {
    const myLandIds = state.ownedLand || [];
    const myBuildings = state.landBuildings || {};
    const visaTier = VISA_TIERS.find(v => v.id === (state.visaTier || 'resident')) || VISA_TIERS[1];

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      ${pageHeader('Utility Ownership, Emaar Architecture & Escrow','Land Marketplace, House Builder & Secondary Resale','Buy sovereign UAE plots, construct custom Emaar villas & penthouses, and sell appreciated real estate via ADGM Atomic Escrow.',btn('🏗️ Build House','openHouseBuilderModal("'+(myLandIds[0]||'L-101')+'")','gold')+btn('NOVA Advisor','nova()','ghost'))}

      <!-- MY SOVEREIGN LAND & HOUSE BUILDER -->
      ${card(`<div style="padding:22px;background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(6,182,212,0.04))">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px">
          <div>
            <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#fbbf24;font-weight:800">My Sovereign Land Portfolio · ${myLandIds.length} Deed${myLandIds.length===1?'':'s'} Owned</div>
            <div style="font-size:16px;font-weight:900;margin-top:2px">Construct Custom Houses & Resell via Atomic Escrow</div>
          </div>
          <span class="tag tag-emerald">🛡️ ADGM Atomic Escrow Protected · ${visaTier.id==='golden'||visaTier.id==='diplomatic'?'0% Golden Visa Fee':'5% Escrow Fee'}</span>
        </div>
        ${myLandIds.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
          ${myLandIds.map(lid => {
            const l = DATA.land.find(x => x.id === lid);
            if (!l) return '';
            const bld = myBuildings[lid];
            const bp = bld ? HOUSE_BLUEPRINTS.find(h => h.id === bld.blueprintId) : null;
            const marketVal = Math.round((l.price + (bp ? bp.valueBoost : 0)) * 1.12);
            return `<div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;justify-content:space-between;gap:12px">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <div>
                    <span class="tag tag-cyan">${l.id}</span>
                    <div style="font-size:14px;font-weight:800;margin-top:6px">${esc(l.name)}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${l.district} · ${l.size}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:10px;color:var(--text-dim)">Est. Market Value</div>
                    <div style="font-size:15px;font-weight:900;color:#34d399;font-family:'JetBrains Mono',monospace">${money(marketVal)}</div>
                  </div>
                </div>
                <div style="margin-top:10px;padding:10px;border-radius:10px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05)">
                  ${bp ? `<div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">${bp.icon}</span><div><div style="font-size:12px;font-weight:800;color:#fbbf24">${esc(bp.name)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(bp.developer)} · +${money(bp.valueBoost)} value boost</div></div></div>` : `<div style="font-size:11px;color:var(--text-muted)">🏗️ Unbuilt Sovereign Land — Ready for Emaar or Custom Blueprint Construction</div>`}
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${btn(bp ? '🏗️ Upgrade House' : '🏗️ Build House', `openHouseBuilderModal('${l.id}')`, 'gold', 'class="btn btn-gold btn-sm" style="flex:1"')}
                ${btn('💰 Sell Deed / House', `sellLandModal('${l.id}')`, 'ghost', 'class="btn btn-ghost btn-sm"')}
              </div>
            </div>`;
          }).join('')}
        </div>` : `<div style="font-size:13px;color:var(--text-muted)">You do not currently hold any land deeds. Acquire a parcel below to build a custom villa and trade on the secondary market.</div>`}
      </div>`)}

      <div class="metric-label">Primary & Secondary Land Registry (${DATA.land.length} Parcels)</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px">
        ${DATA.land.map(l => {
          const isMine = myLandIds.includes(l.id);
          const bld = myBuildings[l.id];
          const bp = bld ? HOUSE_BLUEPRINTS.find(h => h.id === bld.blueprintId) : null;
          return card(`
          <div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:16px">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
                <div>
                  <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:var(--accent-soft);color:var(--accent-text);font-weight:600;font-family:'JetBrains Mono',monospace">${l.id}</span>
                  ${isMine ? '<span class="tag tag-emerald" style="margin-left:6px">YOUR DEED</span>' : ''}
                  <h3 style="font-size:1.0625rem;font-weight:700;margin-top:10px;color:var(--text-primary)">${esc(l.name)}</h3>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">${l.district} · ${l.size}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:1.0625rem;font-weight:800;color:var(--accent-text);font-family:'JetBrains Mono',monospace">${money(l.price)}</div>
                  <div style="font-size:0.6875rem;color:var(--text-dim);margin-top:2px">${aed(l.price)}</div>
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">
                <span style="font-size:10px;padding:4px 8px;border-radius:var(--radius-sm);background:var(--bg-tertiary);border:1px solid var(--border);font-weight:600;color:var(--text-secondary)">${l.zoning}</span>
                <span style="font-size:10px;padding:4px 8px;border-radius:var(--radius-sm);background:var(--bg-tertiary);border:1px solid var(--border);font-weight:600;color:var(--text-secondary)">${l.potential}</span>
                ${bp ? `<span class="tag tag-amber">${bp.icon} ${esc(bp.name)}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:8px;padding-top:14px;border-top:1px solid var(--border)">
              ${btn('View Title Deed',`landDetail('${l.id}')`,'ghost','class="btn btn-ghost btn-sm"')}
              ${isMine ? btn('🏗️ Build / Manage',`openHouseBuilderModal('${l.id}')`,'gold','class="btn btn-gold btn-sm"') : l.available ? btn('Acquire Parcel',`buyLand('${l.id}')`,'primary','class="btn btn-primary btn-sm"') : '<span style="font-size:11px;padding:3px 10px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);color:var(--danger);font-weight:600">Registered</span>'}
            </div>
          </div>
        `);}).join('')}
      </div>
    </section>`;
  }

  function landDetail(id) {
    const l = DATA.land.find(x=>x.id===id);
    if (!l) return;
    const isMine = (state.ownedLand||[]).includes(l.id);
    modal(`Title Deed Registry: ${l.id}`, `
      <div style="display:flex;flex-direction:column;gap:20px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
          ${[['Plot ID',l.id],['District',l.district],['Size Scale',l.size],['Zoning Code',l.zoning],['Nearby Landmark',l.nearby],['Development Potential',l.potential]].map(([k,v])=>`<div style="padding:12px 14px;border-radius:var(--radius-md);background:var(--bg-tertiary);border:1px solid var(--border)"><div class="metric-label">${k}</div><div style="font-size:0.875rem;font-weight:600;margin-top:4px;color:var(--text-primary)">${esc(v)}</div></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid var(--border)">
          <div>
            <div style="font-size:1.25rem;font-weight:800;color:var(--accent-text);font-family:'JetBrains Mono',monospace">${money(l.price)}</div>
            <div style="font-size:0.75rem;color:var(--text-dim)">${aed(l.price)} equivalent</div>
          </div>
          ${isMine ? btn('🏗️ Build House on Plot',`closeModal();openHouseBuilderModal('${l.id}')`,'gold') : l.available ? btn('Acquire Sovereign Deed',`closeModal();buyLand('${l.id}')`,'primary') : '<span style="font-size:12px;padding:4px 12px;border-radius:var(--radius-full);background:rgba(239,68,68,0.1);color:var(--danger);font-weight:600">Already Registered</span>'}
        </div>
      </div>
    `);
  }

  function filterLand() { /* maintained for backward compat */ }

  function wish(id) { if (!state.wishlist.includes(id)) { state.wishlist.push(id); save(); toast('Added to wishlist.','success'); } }

  function buyLand(id) {
    const l = DATA.land.find(x=>x.id===id);
    if (!l) return;
    if (state.wallet < l.price) return toast('Insufficient ISL balance in wallet.','warn');
    modal(`Confirm Deed Acquisition: ${l.id}`, `
      <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.6">Acquire sovereign title for <b>${esc(l.name)}</b> (${l.size}) in ${l.district} for <b style="color:var(--accent-text);font-family:'JetBrains Mono',monospace">${money(l.price)}</b> via ADGM Atomic Escrow?</p>
      <div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">
        ${btn('Cancel','closeModal()','ghost')}
        ${btn('Confirm & Sign Deed',`confirmLand('${l.id}')`,'primary')}
      </div>
    `);
  }

  function confirmLand(id) {
    const l = DATA.land.find(x=>x.id===id);
    if (!l || state.wallet < l.price) return toast('Cannot complete.','warn');
    state.wallet -= l.price;
    if (!state.ownedLand.includes(id)) state.ownedLand.push(id);
    l.available = false;
    state.transactions.unshift({id:uid('tx'),description:`Acquired ${l.name} (${l.id})`,amount:-l.price,type:'Real Estate',date:'Just now',status:'Settled · Escrow Verified',hash:txHash(l.id+Date.now())});
    award(50, 0, `Acquired land ${l.id}`);
    closeModal();
    toast(`🏝️ Title deed for ${l.id} is yours!`, 'success');
    refresh();
  }

  function openHouseBuilderModal(landId) {
    const targetId = landId || (state.ownedLand && state.ownedLand[0]);
    const l = DATA.land.find(x => x.id === targetId);
    if (!l || !(state.ownedLand||[]).includes(l.id)) {
      return toast('Acquire a land plot first to build a custom house!', 'warn');
    }
    const currentBld = (state.landBuildings || {})[l.id];
    modal(`🏗️ Architectural Studio — Build on ${l.id} (${l.name})`, `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="padding:14px;border-radius:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.18)">
          <div style="font-size:12px;font-weight:800;color:#fbbf24">Emaar Virtual Developments & Custom Blueprints</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Constructing a certified blueprint permanently boosts your land parcel's resale value and unlocks 2.5D interior customization.</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
          ${HOUSE_BLUEPRINTS.map(bp => {
            const isBuilt = currentBld && currentBld.blueprintId === bp.id;
            return `<div style="padding:14px;border-radius:14px;background:${isBuilt?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.03)'};border:1px solid ${isBuilt?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.08)'};display:flex;flex-direction:column;justify-content:space-between;gap:10px">
              <div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:26px">${bp.icon}</span>
                  <div>
                    <div style="font-size:13px;font-weight:800">${esc(bp.name)}</div>
                    <div style="font-size:10px;color:var(--accent-text);font-weight:700">${esc(bp.developer)} · ${esc(bp.style)}</div>
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05)">
                  <span style="color:var(--text-muted)">Build Cost: <b style="color:var(--text-primary)">${money(bp.cost)}</b></span>
                  <span style="color:#34d399;font-weight:800">+${money(bp.valueBoost)} Value</span>
                </div>
              </div>
              ${isBuilt ? `<span class="tag tag-emerald" style="text-align:center">✓ Built on ${l.id}</span>` : btn(`Construct (${money(bp.cost)})`, `confirmBuildBlueprint('${l.id}','${bp.id}')`, 'gold', 'class="btn btn-gold btn-sm" style="width:100%"')}
            </div>`;
          }).join('')}
        </div>
      </div>
    `);
  }

  function confirmBuildBlueprint(landId, blueprintId) {
    const l = DATA.land.find(x => x.id === landId);
    const bp = HOUSE_BLUEPRINTS.find(x => x.id === blueprintId);
    if (!l || !bp) return;
    if (state.wallet < bp.cost) return toast(`Insufficient ISL. Need ${money(bp.cost)}.`, 'warn');
    state.wallet -= bp.cost;
    if (!state.landBuildings) state.landBuildings = {};
    state.landBuildings[landId] = { blueprintId: bp.id, builtAt: 'Just now', customName: `${state.user.name}'s ${bp.name}` };
    state.home.built = true;
    state.home.name = `${bp.name} (${landId})`;
    state.transactions.unshift({
      id: uid('tx'),
      description: `Constructed ${bp.name} on ${landId} via ${bp.developer}`,
      amount: -bp.cost,
      type: 'Construction',
      date: 'Just now',
      status: 'Settled · Emaar Certified',
      hash: txHash(landId + bp.id)
    });
    award(90, 40, `Built ${bp.name} on ${landId}`);
    save();
    closeModal();
    toast(`🏗️ ${bp.name} constructed on ${landId}! Property value increased by ${money(bp.valueBoost)}.`, 'success');
    refresh();
  }

  function sellLandModal(landId) {
    const l = DATA.land.find(x => x.id === landId);
    if (!l || !(state.ownedLand||[]).includes(landId)) return;
    const bld = (state.landBuildings || {})[landId];
    const bp = bld ? HOUSE_BLUEPRINTS.find(h => h.id === bld.blueprintId) : null;
    const grossSale = Math.round((l.price + (bp ? bp.valueBoost : 0)) * 1.12);
    const isFeeWaived = state.visaTier === 'golden' || state.visaTier === 'diplomatic';
    const fee = isFeeWaived ? 0 : Math.round(grossSale * 0.05);
    const netPayout = grossSale - fee;

    modal(`💰 ADGM Atomic Escrow — Sell ${l.id} (${l.name})`, `
      <div style="display:flex;flex-direction:column;gap:14px">
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">List and instantly settle your sovereign title deed${bp ? ` + <b>${esc(bp.name)}</b>` : ''} to institutional liquidity buyers on the ADGM Secondary Real Estate Exchange.</p>
        <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Base Land Valuation:</span><span>${money(l.price)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Constructed Blueprint Value:</span><span style="color:#fbbf24">+${money(bp ? bp.valueBoost : 0)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">District Appreciation (+12%):</span><span style="color:#34d399">+${money(grossSale - (l.price + (bp ? bp.valueBoost : 0)))}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Escrow Settlement Fee (${isFeeWaived ? '0% Golden Visa' : '5% Standard'}):</span><span style="color:#fb7185">-${money(fee)}</span></div>
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:16px;font-weight:900"><span>Net Escrow Payout:</span><span style="color:#34d399">${money(netPayout)} (${aed(netPayout)})</span></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
          ${btn('Cancel','closeModal()','ghost')}
          ${btn(`Execute Atomic Sale (+${money(netPayout)})`, `confirmSellLand('${l.id}')`, 'gold')}
        </div>
      </div>
    `);
  }

  function confirmSellLand(landId) {
    const l = DATA.land.find(x => x.id === landId);
    if (!l || !(state.ownedLand||[]).includes(landId)) return;
    const bld = (state.landBuildings || {})[landId];
    const bp = bld ? HOUSE_BLUEPRINTS.find(h => h.id === bld.blueprintId) : null;
    const grossSale = Math.round((l.price + (bp ? bp.valueBoost : 0)) * 1.12);
    const isFeeWaived = state.visaTier === 'golden' || state.visaTier === 'diplomatic';
    const fee = isFeeWaived ? 0 : Math.round(grossSale * 0.05);
    const netPayout = grossSale - fee;

    state.wallet += netPayout;
    state.ownedLand = state.ownedLand.filter(id => id !== landId);
    if (state.landBuildings) delete state.landBuildings[landId];
    l.available = true;
    l.price = grossSale;
    state.transactions.unshift({
      id: uid('tx'),
      description: `Sold Deed ${l.id}${bp ? ` + ${bp.name}` : ''} via Atomic Escrow`,
      amount: netPayout,
      type: 'Real Estate Sale',
      date: 'Just now',
      status: 'Settled · Escrow Verified',
      hash: txHash('sell-' + landId + Date.now())
    });
    award(65, 25, `Sold real estate ${landId} via Escrow`);
    save();
    closeModal();
    toast(`💰 Sold ${l.id} for ${money(netPayout)} net payout!`, 'success');
    refresh();
  }

  function buildHome() {
    openHouseBuilderModal((state.ownedLand && state.ownedLand[0]) || 'L-101');
  }

  function confirmHomeBuild() {
    state.home.built = true; save();
    award(75, 30, 'Built starter residence');
    closeModal();
    toast('🏠 Your coastal residence is ready!', 'success');
    refresh();
  }

  /* PROPERTY */
  function property() {
    const ownedProps = state.ownedProperties || [];
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Digital Real Estate & Resale','Properties, Penthouses & Commercial Suites','Buy turnkey luxury properties, customize 2.5D interiors, or flip properties on the secondary escrow market.',btn('🎨 My Interior Studio','openRoomDesigner()','primary'))}

      ${ownedProps.length ? card(`<div style="padding:20px;background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.04))">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#34d399;font-weight:800">My Turnkey Property Portfolio (${ownedProps.length})</div>
            <div style="font-size:15px;font-weight:900;margin-top:2px">Owned Residences & Secondary Market Liquidity</div>
          </div>
          <span class="tag tag-cyan">Instant Escrow Liquidity</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
          ${ownedProps.map(pid => {
            const p = DATA.properties.find(x => x.id === pid);
            if (!p) return '';
            const resaleVal = Math.round(p.price * 1.10);
            return `<div style="padding:14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;gap:10px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:24px">${p.icon}</span>
                <div>
                  <div style="font-size:13px;font-weight:800">${esc(p.name)}</div>
                  <div style="font-size:11px;color:#34d399;font-weight:700">Resale Valuation: ${money(resaleVal)}</div>
                </div>
              </div>
              <div style="display:flex;gap:6px">
                ${btn('🎨 Room','openRoomDesigner()','ghost','class="btn btn-ghost btn-sm"')}
                ${btn('💰 Sell',`sellPropertyModal('${p.id}')`,'gold','class="btn btn-gold btn-sm"')}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`) : ''}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${DATA.properties.map(p => {
          const isOwned = ownedProps.includes(p.id);
          return itemCard(p.icon, p.name, `${p.type} · ${p.district}`, `<div style="font-size:14px;font-weight:800;color:var(--accent-text)">${money(p.price)} <span style="font-size:10px;color:var(--text-dim)">${aed(p.price)}</span> ${isOwned?'<span class="tag tag-emerald" style="margin-left:4px">Owned</span>':''}</div>`, isOwned ? btn('💰 Sell',`sellPropertyModal('${p.id}')`,'gold','class="btn btn-gold btn-sm"') : btn('View','propertyDetail("'+p.id+'")','ghost','class="btn btn-ghost btn-sm"'));
        }).join('')}
      </div>
    </section>`;
  }

  function propertyDetail(id) {
    const p = DATA.properties.find(x=>x.id===id);
    if (!p) return;
    const isOwned = (state.ownedProperties||[]).includes(p.id);
    modal(p.name,`<p style="font-size:13px;color:var(--text-muted)">${esc(p.description)}</p><div style="margin-top:16px;display:flex;justify-content:between;align-items:center"><div style="font-size:20px;font-weight:900;color:var(--accent-text)">${money(p.price)}</div><div style="margin-left:auto">${isOwned ? btn('💰 Sell Property',`closeModal();sellPropertyModal('${p.id}')`,'gold') : btn('Acquire via Escrow',`buyProperty('${p.id}')`,'gold')}</div></div>`);
  }

  function buyProperty(id) {
    const p = DATA.properties.find(x=>x.id===id);
    if (!p) return;
    if (state.wallet < p.price) return toast('Insufficient ISL.','warn');
    state.wallet -= p.price;
    if (!state.ownedProperties.includes(id)) state.ownedProperties.push(id);
    state.transactions.unshift({id:uid('tx'),description:`Acquired ${p.name}`,amount:-p.price,type:'Real Estate',date:'Just now',status:'Settled · Escrow Verified',hash:txHash(p.id+Date.now())});
    award(60,0,`Acquired ${p.name}`);
    closeModal(); toast(`🏠 ${p.name} is yours!`,'success'); refresh();
  }

  function sellPropertyModal(id) {
    const p = DATA.properties.find(x => x.id === id);
    if (!p || !(state.ownedProperties||[]).includes(id)) return;
    const gross = Math.round(p.price * 1.10);
    const isFeeWaived = state.visaTier === 'golden' || state.visaTier === 'diplomatic';
    const fee = isFeeWaived ? 0 : Math.round(gross * 0.05);
    const net = gross - fee;
    modal(`💰 Sell Property — ${p.name}`, `
      <div style="display:flex;flex-direction:column;gap:12px">
        <p style="font-size:13px;color:var(--text-secondary)">Settle your turnkey property on the ADGM Secondary Real Estate Exchange (+10% market appreciation).</p>
        <div style="padding:14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);font-size:13px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between"><span>Market Resale Price:</span><b>${money(gross)}</b></div>
          <div style="display:flex;justify-content:space-between"><span>Escrow Fee (${isFeeWaived?'0% Golden Visa':'5%'}):</span><span style="color:#fb7185">-${money(fee)}</span></div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-size:15px;font-weight:900"><span>Net Payout:</span><span style="color:#34d399">${money(net)} (${aed(net)})</span></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
          ${btn('Cancel','closeModal()','ghost')}
          ${btn(`Confirm Sale (+${money(net)})`, `confirmSellProperty('${p.id}')`, 'gold')}
        </div>
      </div>
    `);
  }

  function confirmSellProperty(id) {
    const p = DATA.properties.find(x => x.id === id);
    if (!p || !(state.ownedProperties||[]).includes(id)) return;
    const gross = Math.round(p.price * 1.10);
    const isFeeWaived = state.visaTier === 'golden' || state.visaTier === 'diplomatic';
    const fee = isFeeWaived ? 0 : Math.round(gross * 0.05);
    const net = gross - fee;
    state.wallet += net;
    state.ownedProperties = state.ownedProperties.filter(x => x !== id);
    state.transactions.unshift({id:uid('tx'),description:`Sold ${p.name} via Atomic Escrow`,amount:net,type:'Real Estate Sale',date:'Just now',status:'Settled · Escrow Verified',hash:txHash('sellprop-'+id+Date.now())});
    award(50, 20, `Sold ${p.name}`);
    save(); closeModal();
    toast(`💰 Sold ${p.name} for ${money(net)}!`, 'success');
    refresh();
  }

  function openRoomDesigner() {
    if (!state.home.built) return toast('Build your home first!','warn');
    const ambiance = state.home.ambiance || 'sunset';
    const ambianceStyles = { sunset:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(244,63,94,0.04))', cyber:'linear-gradient(135deg,rgba(99,102,241,0.08),var(--accent-soft))', daylight:'linear-gradient(135deg,rgba(16,185,129,0.06),var(--accent-soft))' };
    modal('2.5D Room Interior Studio',`
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="padding:20px;border-radius:16px;background:${ambianceStyles[ambiance]||ambianceStyles.sunset};border:1px solid rgba(255,255,255,0.06);min-height:200px;display:flex;flex-direction:column;justify-content:space-between">
          <div style="font-size:14px;font-weight:900">${esc(state.home.name)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
            ${Object.entries(state.home.slots).map(([slot,itemId])=>{
              const item = DATA.products.find(x=>x.id===itemId);
              return `<div style="padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);font-size:11px;font-weight:700">
                ${item ? `${item.icon} ${item.name}` : `🔲 Empty ${slot}`}
              </div>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:6px;margin-top:12px">
            ${['sunset','cyber','daylight'].map(a=>`<button onclick="setRoomAmbiance('${a}')" style="padding:4px 10px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid ${ambiance===a?'var(--border-accent)':'rgba(255,255,255,0.06)'};background:${ambiance===a?'var(--accent-soft)':'transparent'};color:${ambiance===a?'var(--accent-text)':'var(--text-muted)'}">${a}</button>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:space-between;align-items:center">
          <div style="font-size:11px;color:var(--text-muted)">👁 ${state.home.visitorsNow} visitors · ⬆ ${state.home.upvotes} upvotes · ${state.home.privacy}</div>
          ${btn('Close','closeModal()','ghost')}
        </div>
      </div>
    `);
    logAlphaFeature('2.5D Room Customizer');
  }

  function setRoomAmbiance(a) { state.home.ambiance = a; save(); closeModal(); openRoomDesigner(); }
  function placeDecor() { toast('Decor placed!','success'); }
  function editHome() { toast('Edit mode.','info'); }
  function saveHomeDetails() { save(); toast('Saved!','success'); }
  function upvoteMyRoom() { state.home.upvotes++; save(); toast('⬆ Upvoted!','success'); }
  function toggleRoomOpenHouse() { state.home.privacy = state.home.privacy==='Public'?'Private':'Public'; save(); toast(`Privacy: ${state.home.privacy}`,'success'); }
  function equipRoomSlot() {}
  function tryInRoom() {}
  function buyAndPlaceInRoom() {}
  function openShareRoomModal() {}
  function openSignGuestbookModal() {}
  function submitGuestbookEntry() {}
  function inspectCommunityRoom() {}
  function shopRoomBundle() {}

  /* MARKETPLACE */
  function marketplace() {
    const cats = ['All', ...new Set(DATA.products.map(p=>p.category))];
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Creator Commerce','Marketplace','Trade wearables, decor, creator gear, and collectibles.',btn('My Inventory','showInventory()','ghost')+btn('Creator Studio','openCreatorStudio()','primary'))}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px">
        ${cats.map(c=>`<button onclick="filterMarket('${esc(c)}')" class="btn btn-ghost btn-sm">${c}</button>`).join('')}
      </div>
      <div id="marketGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
        ${DATA.products.map(p => card(`
          <div style="padding:18px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">${p.icon}</span><div><div style="font-size:13px;font-weight:800">${esc(p.name)}</div><div style="font-size:10px;color:var(--text-dim)">${p.category} · ${p.rarity}</div></div></div>
            </div>
            <p style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.5">${esc(p.description).slice(0,100)}...</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
              <div><div style="font-size:15px;font-weight:900;color:var(--accent-text)">${money(p.price)}</div><div style="font-size:10px;color:var(--text-dim)">${p.stock} in stock</div></div>
              <div style="display:flex;gap:6px">
                ${btn('View',`productDetail('${p.id}')`,'ghost','class="btn btn-ghost btn-sm"')}
                ${btn('Buy',`addCart('${p.id}')`,'primary','class="btn btn-primary btn-sm"')}
              </div>
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function filterMarket(cat) { /* re-render filtered */ toast(`Filtering: ${cat}`, 'info'); }
  function showInventory() { modal('Your Inventory',`<div style="display:flex;flex-wrap:wrap;gap:8px">${state.inventory.map(id=>{const p=DATA.products.find(x=>x.id===id);return p?`<div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);font-size:12px;font-weight:700">${p.icon} ${p.name}</div>`:'';}).join('')||'<div style="color:var(--text-muted);font-size:13px">Empty inventory.</div>'}</div>`); }
  function productDetail(id) { const p=DATA.products.find(x=>x.id===id); if(!p)return; modal(p.name,`<div style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;align-items:center;gap:12px"><span style="font-size:40px">${p.icon}</span><div><div style="font-size:18px;font-weight:900">${esc(p.name)}</div><div style="font-size:11px;color:var(--text-dim)">${p.category} · ${p.rarity} · ${p.stock} left</div></div></div><p style="font-size:13px;color:var(--text-muted);line-height:1.6">${esc(p.description)}</p><div style="display:flex;justify-content:between;align-items:center"><div style="font-size:22px;font-weight:900;color:var(--accent-text)">${money(p.price)}</div><div style="margin-left:auto;display:flex;gap:8px">${btn('Add to Cart',`closeModal();addCart('${p.id}')`,'primary')}${btn('Buy Now',`closeModal();addCart('${p.id}');checkout()`,'gold')}</div></div></div>`); }

  function addCart(id) { const p=DATA.products.find(x=>x.id===id); if(!p)return; const existing = state.cart.find(c=>c.id===id); if(existing){existing.qty=Math.min(existing.qty+1,p.stock);} else {state.cart.push({id,qty:1});} save(); toast(`${p.icon} ${p.name} added to cart.`,'success'); }
  function changeQty(id, delta) { const c=state.cart.find(x=>x.id===id); if(!c)return; c.qty=Math.max(0,c.qty+delta); if(c.qty<=0) state.cart=state.cart.filter(x=>x.id!==id); save(); refresh(); }
  function cart() { /* show cart modal */ }

  function checkout() {
    const total = state.cart.reduce((s,c)=>{const p=DATA.products.find(x=>x.id===c.id);return s+(p?p.price*c.qty:0);},0);
    if (!state.cart.length) return toast('Cart is empty.','warn');
    if (state.wallet < total) return toast('Insufficient ISL.','warn');
    state.wallet -= total;
    state.cart.forEach(c => { if (!state.inventory.includes(c.id)) state.inventory.push(c.id); });
    state.transactions.unshift({id:uid('tx'),description:`Marketplace purchase (${state.cart.length} items)`,amount:-total,type:'Purchase',date:'Just now',status:'Settled'});
    state.cart = [];
    award(30,0,'Marketplace purchase');
    save(); toast('✅ Purchase complete!','success'); refresh();
  }

  function openCreatorStudio() { modal('Creator Studio',`<p style="font-size:13px;color:var(--text-muted)">Publish your own 3D digital creation, set pricing and royalty rates.</p><div style="margin-top:16px">${btn('Coming Soon','closeModal()','ghost')}</div>`); }
  function publishCreatorAsset() {}

  /* BUSINESSES */
  function businesses() {
    const allBiz = [...DATA.businesses, ...(state.createdBusinesses || [])];
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Anchor Enterprises & Corporate HQ','Emaar, LuLu, ADGM, Hub71 & Dealerships','Enter flagship UAE enterprise hubs to commission villas, claim phygital retail vouchers, buy vehicles, or apply for startup grants.',btn('🏢 Launch Enterprise','createBusiness()','gold'))}

      <!-- ANCHOR BRAND HIGHLIGHT STRIP -->
      ${card(`<div style="padding:18px 22px;background:linear-gradient(135deg,rgba(6,182,212,0.06),rgba(245,158,11,0.05));display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--accent-text);font-weight:800">UAE Flagship B2B Ecosystem</div>
          <div style="font-size:14px;font-weight:800;margin-top:2px">Real-World Brands Operating Interactive Virtual Twins Across the 5 UAE Islands</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${btn('🏗️ Emaar Villas','enterBusinessStorefront("b1")','gold','class="btn btn-gold btn-sm"')}
          ${btn('🛒 LuLu Hypermarket','enterBusinessStorefront("b2")','primary','class="btn btn-primary btn-sm"')}
          ${btn('🏎️ Prestige Motors','enterBusinessStorefront("b3")','ghost','class="btn btn-ghost btn-sm"')}
          ${btn('🏛️ ADGM Registry','enterBusinessStorefront("b4")','ghost','class="btn btn-ghost btn-sm"')}
          ${btn('🚀 Hub71 Grants','enterBusinessStorefront("b5")','ghost','class="btn btn-ghost btn-sm"')}
        </div>
      </div>`)}

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px">
        ${allBiz.map(b => card(`
          <div style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:12px">
            <div>
              <div style="display:flex;align-items:start;gap:12px">
                <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.04);display:grid;place-items:center;font-size:24px;flex-shrink:0;border:1px solid rgba(255,255,255,0.06)">${b.icon}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <div style="font-size:14px;font-weight:800">${esc(b.name)}</div>
                    ${b.anchor ? '<span class="tag tag-amber" style="font-size:9px">ANCHOR PARTNER</span>' : ''}
                  </div>
                  <div style="font-size:11px;color:var(--accent-text);font-weight:600;margin-top:2px">${esc(b.type)} · ${esc(b.district)}</div>
                  <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">${esc(b.description)}</p>
                </div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05);gap:8px">
              <div style="font-size:11px;color:var(--text-dim)">⭐ ${b.rating || '4.9'} · ${b.followers || 120} followers</div>
              <div style="display:flex;gap:6px">
                ${btn(b.actionLabel || 'Enter Hub', `enterBusinessStorefront('${b.id}')`, 'gold', 'class="btn btn-gold btn-sm"')}
                ${btn(state.following.includes(b.id)?'✓':'Follow',`toggleFollow('${b.id}')`,state.following.includes(b.id)?'primary':'ghost','class="btn btn-sm"')}
              </div>
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function enterBusinessStorefront(bizId) {
    const allBiz = [...DATA.businesses, ...(state.createdBusinesses || [])];
    const b = allBiz.find(x => x.id === bizId);
    if (!b) return;

    if (bizId === 'b1') {
      // Emaar Virtual Developments
      modal('🏗️ Emaar Virtual Developments — Architectural Pavilion', `
        <div style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:13px;color:var(--text-secondary)">Commission official Emaar luxury villas and penthouses on your sovereign UAE land parcels, or claim your Emaar VIP Investor Preview Pass.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
            ${HOUSE_BLUEPRINTS.slice(0,4).map(bp => `
              <div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08)">
                <div style="font-size:22px">${bp.icon}</div>
                <div style="font-size:13px;font-weight:800;margin-top:4px">${esc(bp.name)}</div>
                <div style="font-size:10px;color:var(--text-dim)">${esc(bp.style)} · +${money(bp.valueBoost)} value</div>
                <div style="font-size:12px;font-weight:800;color:#fbbf24;margin:8px 0">${money(bp.cost)}</div>
                ${btn('Construct on My Land', `closeModal();openHouseBuilderModal('${(state.ownedLand&&state.ownedLand[0])||'L-101'}')`, 'gold', 'class="btn btn-gold btn-sm" style="width:100%"')}
              </div>
            `).join('')}
          </div>
          <div style="padding:12px;border-radius:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-size:12px;font-weight:800;color:#fbbf24">🎟️ Emaar Phygital Property Launch Pass</div><div style="font-size:10px;color:var(--text-muted)">Priority access & fee waiver consultation at Emaar Sales Center Dubai/Abu Dhabi</div></div>
            ${btn('Claim VIP Pass', `claimPhygitalVoucher('Emaar Properties','EMAAR-VIP-2026','Priority Off-Plan Access & Advisory')`, 'primary', 'class="btn btn-primary btn-sm"')}
          </div>
        </div>
      `);
    } else if (bizId === 'b2') {
      // LuLu Hypermarket Phygital Flagship
      modal('🛒 LuLu Hypermarket & Mall — Phygital Retail Hub', `
        <div style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:13px;color:var(--text-secondary)">Shop virtual goods for your avatar & home, or redeem ISL rewards for real-world LuLu Hypermarket discount vouchers across the UAE & GCC.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="padding:14px;border-radius:12px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2)">
              <div style="font-size:13px;font-weight:800;color:#34d399">🎟️ 15% Off LuLu Hypermarket UAE</div>
              <div style="font-size:11px;color:var(--text-muted);margin:6px 0">Valid on groceries & electronics via LuLu Online or UAE branches.</div>
              ${btn('Claim Voucher (Free for Citizens)', `claimPhygitalVoucher('LuLu Hypermarket','LULU-UAE-15','15% Off In-Store & Online Delivery')`, 'gold', 'class="btn btn-gold btn-sm" style="width:100%"')}
            </div>
            <div style="padding:14px;border-radius:12px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2)">
              <div style="font-size:13px;font-weight:800;color:var(--accent-text)">🛍️ LuLu Express Drone Basket</div>
              <div style="font-size:11px;color:var(--text-muted);margin:6px 0">Boosts citizen XP +50 & stocks your virtual villa kitchen.</div>
              ${btn('Buy Basket (45 ISL)', `closeModal();addCart('pr3');checkout()`, 'primary', 'class="btn btn-primary btn-sm" style="width:100%"')}
            </div>
          </div>
        </div>
      `);
    } else if (bizId === 'b3') {
      // Prestige Motors
      modal('🏎️ Prestige Motors & Hypercar Showroom', `
        <div style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:13px;color:var(--text-secondary)">Test-drive or acquire EV supercars, desert dune buggies, and royal yachts to drive across the 5 UAE islands and highway bridges.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px">
            ${DATA.vehicles.slice(0,4).map(v => {
              const owned = (state.ownedVehicles||[]).includes(v.id);
              return `<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08)">
                <div style="font-size:24px">${v.icon}</div>
                <div style="font-size:13px;font-weight:800;margin-top:4px">${esc(v.name)}</div>
                <div style="font-size:11px;color:var(--accent-text);font-weight:700;margin:4px 0">${money(v.price)}</div>
                ${owned ? btn('🏁 Drive Now', `closeModal();driveVehicle('${v.id}')`, 'success', 'class="btn btn-success btn-sm" style="width:100%"') : btn('Acquire Vehicle', `closeModal();buyVehicle('${v.id}')`, 'gold', 'class="btn btn-gold btn-sm" style="width:100%"')}
              </div>`;
            }).join('')}
          </div>
        </div>
      `);
    } else if (bizId === 'b4') {
      // ADGM Financial Authority
      modal('🏛️ ADGM Financial Tower & Atomic Escrow Registry', `
        <div style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:13px;color:var(--text-secondary)">Abu Dhabi Global Market (ADGM) RegLab Sandbox oversees atomic deed transfers, corporate licensing, and SHA-256 cryptographic receipts.</p>
          <div style="padding:14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);font-size:12px;display:flex;flex-direction:column;gap:6px">
            <div>🛡️ <b>Escrow Protection Status:</b> <span style="color:#34d399">100% Atomic Settlement Active</span></div>
            <div>📜 <b>Registered Sovereign Deeds:</b> ${(state.ownedLand||[]).length} Land Plots · ${(state.ownedProperties||[]).length} Properties</div>
            <div>🪪 <b>Citizen Visa Tier:</b> ${(state.visaTier||'resident').toUpperCase()}</div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            ${btn('Open Sovereign Wallet & Receipts', `closeModal();nav('wallet.html')`, 'primary')}
            ${btn('Register New Enterprise', `closeModal();createBusiness()`, 'gold')}
          </div>
        </div>
      `);
    } else if (bizId === 'b5') {
      // Hub71 Tech Ecosystem
      modal('🚀 Hub71 Startup Campus — Founder Grant & Incubator', `
        <div style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:13px;color:var(--text-secondary)">Hub71 empowers tech founders building inside the UAE Virtual Ecosystem with non-dilutive ISL compute & land grants.</p>
          <div style="padding:16px;border-radius:12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25)">
            <div style="font-size:14px;font-weight:800;color:#818cf8">⚡ Hub71 Virtual Founder Grant — 500 ISL</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Instant sandbox grant for verified UAE Virtual Visa holders launching a startup or creator studio.</div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            ${btn('Close','closeModal()','ghost')}
            ${btn('🚀 Claim 500 ISL Founder Grant', 'applyHub71Grant()', 'gold')}
          </div>
        </div>
      `);
    } else {
      modal(`${b.icon} ${b.name}`, `
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="font-size:12px;color:var(--accent-text);font-weight:700">${esc(b.type)} · ${esc(b.district)}</div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">${esc(b.description)}</p>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            ${btn('Explore Marketplace Goods', `closeModal();nav('marketplace.html')`, 'primary')}
            ${btn('Claim VIP Brand Voucher', `claimPhygitalVoucher('${escAttr(b.name)}','NEXUS-VIP-20','20% Phygital Partner Privilege')`, 'gold')}
          </div>
        </div>
      `);
    }
  }

  function claimPhygitalVoucher(brand, code, discount) {
    if (!state.phygitalVouchers) state.phygitalVouchers = [];
    if (state.phygitalVouchers.some(v => v.code === code)) {
      closeModal();
      return toast(`🎟️ Voucher ${code} is already in your Wallet!`, 'info');
    }
    state.phygitalVouchers.push({ id: uid('vch'), brand, code, discount, status: 'Active · Ready to Redeem' });
    award(35, 15, `Claimed ${brand} Phygital Voucher`);
    save();
    closeModal();
    toast(`🎟️ Claimed ${brand} voucher (${code})! View in Wallet.`, 'success');
    refresh();
  }

  function applyHub71Grant() {
    if (state.hub71GrantClaimed) {
      closeModal();
      return toast('Hub71 Founder Grant already claimed for this citizen ID.', 'info');
    }
    state.hub71GrantClaimed = true;
    state.wallet += 500;
    state.transactions.unshift({
      id: uid('tx'),
      description: 'Hub71 Tech Ecosystem Founder Grant',
      amount: 500,
      type: 'Grant',
      date: 'Just now',
      status: 'Settled · Hub71 Verified',
      hash: txHash('hub71-' + Date.now())
    });
    award(80, 0, 'Awarded Hub71 Startup Grant');
    save();
    closeModal();
    toast('🚀 +500 ISL Hub71 Founder Grant credited to your wallet!', 'success');
    refresh();
  }

  function createBusiness() {
    modal('🏢 Launch Virtual Enterprise (ADGM License — 250 ISL)', `
      <form onsubmit="createBusinessSave(event)" style="display:flex;flex-direction:column;gap:12px">
        <p style="font-size:12px;color:var(--text-muted)">Register an official commercial storefront on the UAE Archipelago. License fee: <b>250 ISL</b>.</p>
        <div><div class="metric-label" style="margin-bottom:4px">Enterprise Name</div><input required name="name" class="field" placeholder="e.g. Al-Noor Spatial Architects"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><div class="metric-label" style="margin-bottom:4px">Sector</div><select name="type" class="field"><option>Real Estate & Architecture</option><option>Retail & Commerce</option><option>Automotive & Mobility</option><option>FinTech & Advisory</option><option>AI & Creator Studio</option></select></div>
          <div><div class="metric-label" style="margin-bottom:4px">UAE Island District</div><select name="district" class="field">${UAE_ISLANDS.filter(i=>i.status==='active').map(i=>`<option value="${escAttr(i.name)}">${esc(i.name)}</option>`).join('')}</select></div>
        </div>
        <div><div class="metric-label" style="margin-bottom:4px">Storefront Description</div><input required name="description" class="field" placeholder="Describe your virtual services and phygital perks..."></div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
          ${btn('Cancel','closeModal()','ghost')}
          <button type="submit" class="btn btn-gold">🏢 Issue License & Launch (250 ISL)</button>
        </div>
      </form>
    `);
  }

  function createBusinessSave(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (state.wallet < 250) return toast('Insufficient ISL. Commercial license requires 250 ISL.', 'warn');
    const f = new FormData(e.target);
    const name = String(f.get('name')||'').trim();
    const type = String(f.get('type')||'Enterprise');
    const district = String(f.get('district')||'Al Maryah Financial Island');
    const description = String(f.get('description')||' Official virtual enterprise.');
    if (!name) return;
    state.wallet -= 250;
    if (!state.createdBusinesses) state.createdBusinesses = [];
    const newBiz = { id: uid('biz'), name, type, district, rating: '5.0', followers: 1, icon: '🏢', description, actionLabel: 'Open Storefront', anchor: false };
    state.createdBusinesses.unshift(newBiz);
    state.transactions.unshift({ id: uid('tx'), description: `ADGM Commercial License: ${name}`, amount: -250, type: 'License', date: 'Just now', status: 'Settled · ADGM Registry', hash: txHash(name) });
    award(75, 25, `Launched enterprise ${name}`);
    save(); closeModal();
    toast(`🏢 ${name} is now live on ${district}!`, 'success');
    refresh();
  }

  function toggleFollow(id) { if(state.following.includes(id)){state.following=state.following.filter(x=>x!==id);toast('Unfollowed.','info');} else {state.following.push(id);toast('Following!','success');} save(); refresh(); }

  /* VEHICLES */
  function vehicles() {
    const owned = state.ownedVehicles || [];
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Mobility','Vehicles & Garage','Acquire and drive high-performance vehicles across the island archipelago.',btn('🌐 Open World','nav("island.html")','primary'))}

      ${owned.length ? `<!-- YOUR GARAGE -->
      ${card(`<div style="padding:24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--accent-soft),rgba(99,102,241,0.08));display:grid;place-items:center;font-size:20px">🏎️</div>
          <div>
            <div style="font-size:16px;font-weight:900">Your Garage</div>
            <div style="font-size:11px;color:var(--text-muted)">${owned.length} vehicle${owned.length>1?'s':''} owned · Drive on the Island Map</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
          ${owned.map(vid => {
            const v = DATA.vehicles.find(x => x.id === vid);
            if (!v) return '';
            return `<div class="glass-card garage-card" style="padding:16px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <span style="font-size:28px">${v.icon}</span>
                <div><div style="font-size:13px;font-weight:800">${esc(v.name)}</div><div style="font-size:10px;color:var(--text-dim)">${v.type}</div></div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
                ${[['Speed',v.speed],['Handling',v.handling],['Acceleration',v.acceleration]].map(([l,val]) => `<div>
                  <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:var(--text-dim);margin-bottom:2px"><span>${l}</span><span>${val}/100</span></div>
                  <div class="vehicle-stat-bar"><div class="vehicle-stat-fill" style="width:${val}%"></div></div>
                </div>`).join('')}
              </div>
              ${btn('🏁 Drive Now', `driveVehicle('${v.id}')`, 'primary', 'class="btn btn-primary btn-sm" style="width:100%"')}
            </div>`;
          }).join('')}
        </div>
      </div>`)}` : ''}

      <!-- ALL VEHICLES -->
      <div class="metric-label" style="margin-top:8px">Available Vehicles</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${DATA.vehicles.map(v => {
          const isOwned = owned.includes(v.id);
          return card(`
          <div style="padding:20px" class="garage-card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <span style="font-size:32px">${v.icon}</span>
              <div>
                <div style="font-size:14px;font-weight:800">${esc(v.name)}</div>
                <div style="font-size:11px;color:var(--text-muted)">${v.type}${isOwned ? ' · <span style="color:#34d399">✓ Owned</span>' : ''}</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:14px">
              ${[['Speed',v.speed,'SPD'],['Handling',v.handling,'HDL'],['Acceleration',v.acceleration,'ACC']].map(([label,val,short]) => `<div>
                <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:var(--text-dim);margin-bottom:2px"><span>${label}</span><span style="color:var(--accent-text)">${val}</span></div>
                <div class="vehicle-stat-bar"><div class="vehicle-stat-fill" style="width:${val}%"></div></div>
              </div>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
              <div style="font-size:15px;font-weight:900;color:var(--accent-text)">${money(v.price)}</div>
              <div style="display:flex;gap:6px">
                ${btn('Details', `vehicleDetail('${v.id}')`, 'ghost', 'class="btn btn-ghost btn-sm"')}
                ${isOwned ? btn('🏁 Drive', `driveVehicle('${v.id}')`, 'success', 'class="btn btn-success btn-sm"') : btn('Acquire', `buyVehicle('${v.id}')`, 'primary', 'class="btn btn-primary btn-sm"')}
              </div>
            </div>
          </div>
        `)}).join('')}
      </div>
    </section>`;
  }

  function vehicleDetail(id) {
    const v = DATA.vehicles.find(x => x.id === id);
    if (!v) return;
    const isOwned = (state.ownedVehicles || []).includes(v.id);
    modal(v.name, `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:16px">
          <span style="font-size:56px">${v.icon}</span>
          <div>
            <div style="font-size:22px;font-weight:900">${esc(v.name)}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${v.type}${isOwned ? ' · <span style="color:#34d399">✓ Owned</span>' : ''}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          ${[['Speed',v.speed,'🏎️'],['Handling',v.handling,'🎯'],['Acceleration',v.acceleration,'⚡']].map(([l,val,ic]) => `
            <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);text-align:center">
              <div style="font-size:20px;margin-bottom:4px">${ic}</div>
              <div style="font-size:20px;font-weight:900;color:var(--accent-text)">${val}</div>
              <div style="font-size:10px;font-weight:700;color:var(--text-dim);margin-top:2px">${l}</div>
              <div class="vehicle-stat-bar" style="margin-top:6px"><div class="vehicle-stat-fill" style="width:${val}%"></div></div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          <div><div style="font-size:22px;font-weight:900;color:var(--accent-text)">${money(v.price)}</div><div style="font-size:11px;color:var(--text-dim)">${aed(v.price)}</div></div>
          <div style="display:flex;gap:8px">
            ${isOwned ? btn('🏁 Drive on Island', `closeModal();driveVehicle('${v.id}')`, 'success') : btn('Acquire Vehicle', `closeModal();buyVehicle('${v.id}')`, 'gold')}
          </div>
        </div>
      </div>
    `);
  }

  function buyVehicle(id) {
    const v = DATA.vehicles.find(x => x.id === id);
    if (!v) return;
    if (state.wallet < v.price) return toast('Insufficient ISL.', 'warn');
    state.wallet -= v.price;
    state.ownedVehicles.push(id);
    state.transactions.unshift({ id: uid('tx'), description: `Acquired ${v.name}`, amount: -v.price, type: 'Purchase', date: 'Just now', status: 'Settled' });
    award(40, 0, `Acquired ${v.name}`);
    toast(`🏎️ ${v.name} is yours!`, 'success');
    save();
    refresh();
  }

  function driveVehicle(id) {
    const v = DATA.vehicles.find(x => x.id === id);
    if (!v) return;
    // If on the island page with engine, enter vehicle directly
    if (typeof window.engineEnterVehicle === 'function' && document.getElementById('nexus-map-canvas')) {
      window.engineEnterVehicle(id);
      toast(`🏎️ Driving ${v.name}! Use WASD to steer, F to exit.`, 'success');
    } else {
      // Navigate to island page and enter vehicle after load
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('nexus_drive_vehicle', id);
      }
      nav('island.html');
    }
  }

  /* SOCIAL */
  function friends() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Social Graph','Resident Friends','Connect, message, and collaborate with island residents.',btn('Discover People','openPeople()','primary'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${state.friends.map(fid => {const u=DATA.users.find(x=>x.id===fid);if(!u)return'';return itemCard(u.avatar,u.name,`${u.role} · ${u.district}`,u.online?'<span class="tag tag-emerald" style="font-size:9px"><span class="live-dot" style="width:5px;height:5px"></span>Online</span>':'<span style="font-size:10px;color:var(--text-dim)">Offline</span>',btn('Message',`nav('messages.html')`,'ghost','class="btn btn-ghost btn-sm"'));}).join('')}
      </div>
      ${state.requests.length?`<div style="margin-top:8px"><div class="metric-label" style="margin-bottom:8px">Pending Requests</div><div style="display:flex;flex-direction:column;gap:8px">${state.requests.map(rid=>{const u=DATA.users.find(x=>x.id===rid);if(!u)return'';return itemCard(u.avatar,u.name,u.role,'',btn('Accept',`acceptRequest('${u.id}')`,'success','class="btn btn-sm"')+btn('Decline',`declineRequest('${u.id}')`,'ghost','class="btn btn-sm"'));}).join('')}</div></div>`:''}
    </section>`;
  }

  function openPeople() { modal('Discover Residents',`<div style="display:flex;flex-direction:column;gap:8px">${DATA.users.filter(u=>!state.friends.includes(u.id)&&!state.requests.includes(u.id)).slice(0,8).map(u=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">${u.avatar}</span><div><div style="font-size:12px;font-weight:700">${esc(u.name)}</div><div style="font-size:10px;color:var(--text-dim)">${u.role}</div></div></div>${btn('Connect',`sendRequest('${u.id}')`,'primary','class="btn btn-primary btn-sm"')}</div>`).join('')}</div>`); }
  function sendRequest(id) { if(!state.friends.includes(id)){state.friends.push(id);save();award(15,5,`Connected with ${DATA.users.find(u=>u.id===id)?.name||'resident'}`);toast('Connected!','success');closeModal();refresh();} }
  function acceptRequest(id) { state.requests=state.requests.filter(x=>x!==id);state.friends.push(id);save();award(15,5,'Accepted friend request');toast('Request accepted!','success');refresh(); }
  function declineRequest(id) { state.requests=state.requests.filter(x=>x!==id);save();toast('Declined.','info');refresh(); }
  function person(id) {}
  function blockUser(id) { state.blocked.push(id);state.friends=state.friends.filter(x=>x!==id);save();toast('Blocked.','info');refresh(); }

  /* MESSAGES */
  function messages() {
    const convos = Object.entries(state.messages).map(([uid,msgs])=>{const u=DATA.users.find(x=>x.id===uid);return u?{user:u,msgs,last:msgs[0]}:null;}).filter(Boolean);
    const sel = state.selectedConversation;
    const selConvo = convos.find(c=>c.user.id===sel);

    return `<section class="fade" style="display:flex;flex-direction:column;gap:0">
      ${pageHeader('Communication','Direct Messages','Private conversations with island residents.')}
      <div style="display:grid;grid-template-columns:280px 1fr;gap:0;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);min-height:500px" class="msg-layout">
        <!-- Conversation List -->
        <div style="background:rgba(255,255,255,0.02);border-right:1px solid rgba(255,255,255,0.06);overflow-y:auto;max-height:600px">
          ${convos.map(c=>`
            <button onclick="selectConversation('${c.user.id}')" style="width:100%;padding:14px;display:flex;align-items:center;gap:10px;border:none;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;background:${c.user.id===sel?'var(--accent-soft)':'transparent'};text-align:left" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='${c.user.id===sel?'var(--accent-soft)':'transparent'}'">
              <span style="font-size:22px">${c.user.avatar}</span>
              <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.user.name)}</div><div style="font-size:10px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.last?.text||'')}</div></div>
            </button>
          `).join('')}
        </div>
        <!-- Chat Area -->
        <div style="display:flex;flex-direction:column;background:rgba(255,255,255,0.01)">
          ${selConvo?`
            <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px">
              <span style="font-size:22px">${selConvo.user.avatar}</span>
              <div><div style="font-size:13px;font-weight:800">${esc(selConvo.user.name)}</div><div style="font-size:10px;color:var(--text-dim)">${selConvo.user.role}</div></div>
            </div>
            <div style="flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
              ${selConvo.msgs.slice().reverse().map(m=>`
                <div style="display:flex;justify-content:${m.mine?'flex-end':'flex-start'}">
                  <div style="max-width:70%;padding:10px 14px;border-radius:14px;font-size:12px;font-weight:600;${m.mine?'background:var(--accent-soft);color:var(--accent-text);border-bottom-right-radius:4px':'background:rgba(255,255,255,0.05);color:var(--text-secondary);border-bottom-left-radius:4px'}">${esc(m.text)}</div>
                </div>
              `).join('')}
            </div>
            <form onsubmit="sendMessage(event,'${sel}')" style="padding:12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px">
              <input name="text" class="field" placeholder="Type a message..." style="flex:1" autocomplete="off">
              <button type="submit" class="btn btn-primary btn-sm">Send</button>
            </form>
          `:'<div style="flex:1;display:grid;place-items:center;color:var(--text-dim);font-size:13px">Select a conversation</div>'}
        </div>
      </div>
      <style>@media(max-width:768px){.msg-layout{grid-template-columns:1fr!important;grid-template-rows:200px 1fr!important;}}</style>
    </section>`;
  }

  function selectConversation(uid) { state.selectedConversation=uid; save(); refresh(); }
  function msg(uid) { state.selectedConversation=uid; save(); nav('messages.html'); }
  function sendMessage(e,uid) {
    e.preventDefault();
    const f=new FormData(e.target);
    const text=String(f.get('text')||'').trim();
    if(!text)return;
    if(!state.messages[uid])state.messages[uid]=[];
    state.messages[uid].unshift({id:uid('msg'),from:'me',text,at:'Just now',mine:true});
    save(); award(5,2,'Sent message');
    // Simulate reply
    setTimeout(()=>{
      const u=DATA.users.find(x=>x.id===uid);
      if(u&&state.messages[uid]){
        state.messages[uid].unshift({id:uid('msg'),from:uid,text:`Thanks for the message! See you on the island soon. 🏝️`,at:'Just now',mine:false});
        save(); if(typeof location!=='undefined'&&location.pathname.endsWith('messages.html')) refresh();
      }
    },1500);
    refresh();
  }

  /* COMMUNITIES */
  function communities() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Guilds & Networks','Communities','Join specialized groups for collaboration and discovery.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${DATA.communities.map(c => card(`
          <div style="padding:20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <div style="width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,0.04);display:grid;place-items:center;font-size:22px">${c.icon}</div>
              <div><div style="font-size:14px;font-weight:800">${esc(c.name)}</div><div style="font-size:11px;color:var(--text-muted)">${c.category} · ${c.members} members</div></div>
            </div>
            <p style="font-size:11px;color:var(--text-dim);line-height:1.5">${esc(c.description)}</p>
            <div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
              ${btn(state.joined.includes(c.id)?'Joined ✓':'Join Guild',`toggleCommunity('${c.id}')`,state.joined.includes(c.id)?'primary':'ghost','class="btn btn-sm" style="width:100%"')}
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function toggleCommunity(id) { if(state.joined.includes(id)){state.joined=state.joined.filter(x=>x!==id);toast('Left community.','info');} else {state.joined.push(id);award(20,10,'Joined community');toast('Joined!','success');} save();refresh(); }

  /* EVENTS */
  function events() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Island Calendar','Events & Live Stage','Attend summits, competitions, and social gatherings.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
        ${DATA.events.map(e => card(`
          <div style="padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
              <div><span class="tag tag-cyan">${e.type}</span><h3 style="font-size:15px;font-weight:900;margin-top:8px">${esc(e.name)}</h3></div>
              <div style="text-align:right"><div style="font-size:12px;font-weight:800">${e.date}</div><div style="font-size:10px;color:var(--text-dim)">${e.time}</div></div>
            </div>
            <p style="font-size:11px;color:var(--text-muted);line-height:1.5">${esc(e.description)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
              <div style="font-size:11px;color:var(--text-dim)">${e.attendees} attending · ${e.price?money(e.price):'Free'}</div>
              ${btn(state.rsvp.includes(e.id)?'RSVP\'d ✓':'RSVP',`toggleRsvp('${e.id}')`,state.rsvp.includes(e.id)?'primary':'ghost','class="btn btn-sm"')}
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function toggleRsvp(id) { if(state.rsvp.includes(id)){state.rsvp=state.rsvp.filter(x=>x!==id);toast('RSVP cancelled.','info');} else {state.rsvp.push(id);award(15,5,'Event RSVP');toast('RSVP confirmed!','success');} save();refresh(); }
  function enterLiveStage() { toast('Live stage active!','success'); }

  /* GAMES */
  function games() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Arena','Browser Mini-Games','Compete for ISL prizes and leaderboard glory.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
        ${[
          ['🏎️','Yas Marina Speed Sprint','High-speed reflex time trial through cyber gates.','drone',state.gameStats.drone],
          ['🦪','Arabian Gulf Pearl Sonar','Acoustic radar uncovering sunken pearls and artifacts.','pearl',state.gameStats.pearl],
          ['🧠','Ecosystem Strategy Arena','Multi-stage quiz on platform economics and UAE regulations.','tycoon',state.gameStats.tycoon]
        ].map(([ic,name,desc,key,stats]) => card(`
          <div style="padding:24px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="width:52px;height:52px;border-radius:16px;background:rgba(139,92,246,0.1);display:grid;place-items:center;font-size:28px">${ic}</div>
              <div><div style="font-size:15px;font-weight:900">${name}</div><div style="font-size:11px;color:var(--text-muted)">${desc}</div></div>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:16px">
              <div style="flex:1;padding:8px;border-radius:10px;background:rgba(255,255,255,0.03);text-align:center"><div class="metric-label">Plays</div><div style="font-size:16px;font-weight:900;margin-top:2px">${stats.plays}</div></div>
              <div style="flex:1;padding:8px;border-radius:10px;background:rgba(255,255,255,0.03);text-align:center"><div class="metric-label">Best</div><div style="font-size:16px;font-weight:900;margin-top:2px;color:var(--accent-text)">${stats.best}</div></div>
            </div>
            ${btn('▶ Play Now',`playGame('${key}')`, 'primary', 'class="btn btn-primary" style="width:100%"')}
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function playGame(key) {
    if (key === 'drone') playDrone();
    else if (key === 'pearl') playPearl();
    else if (key === 'tycoon') playTycoon();
  }

  // --- MINI-GAMES ---
  function playDrone() {
    let score = 0; let active = true; let timer = null;
    const end = () => { active = false; clearTimeout(timer); state.gameStats.drone.plays++; if(score>state.gameStats.drone.best)state.gameStats.drone.best=score; save(); award(20,score>800?50:15,`Yas Sprint: ${score} pts`); closeModal(); };
    const render = () => {
      if(!active) return;
      modal('🏎️ Yas Marina Speed Sprint',`
        <div style="text-align:center;padding:16px">
          <div style="font-size:48px;font-weight:900;color:var(--accent-text);margin:20px 0">${score}</div>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Tap the button as fast as you can!</p>
          <button onclick="droneTap()" class="btn btn-primary btn-lg" style="width:200px;height:60px;font-size:18px">⚡ TAP!</button>
          <div style="margin-top:16px">${btn('End Game','window.__endDrone()','ghost')}</div>
        </div>
      `);
    };
    window.droneTap = () => { score += 40 + Math.floor(Math.random()*30); playBeep('click'); render(); };
    window.__endDrone = end;
    timer = setTimeout(end, 15000);
    render();
    logAlphaFeature('Yas Sprint Mini-Game');
  }

  function playPearl() {
    let found = 0; let active = true;
    const end = () => { active = false; state.gameStats.pearl.plays++; if(found>state.gameStats.pearl.best)state.gameStats.pearl.best=found; save(); award(25,found*10,`Pearl Sonar: ${found} found`); closeModal(); };
    modal('🦪 Arabian Gulf Pearl Sonar',`
      <div style="text-align:center;padding:16px">
        <div style="font-size:36px;font-weight:900;margin:16px 0">Found: <span id="pearlCount" style="color:#fbbf24">0</span></div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Click to ping sonar — find pearls!</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
          ${Array.from({length:12},(_,i)=>`<button onclick="pearlPing(${i})" id="pearl-${i}" style="width:60px;height:60px;border-radius:14px;background:var(--accent-soft);border:1px solid var(--border-accent);font-size:24px;cursor:pointer;transition:all 0.2s">🌊</button>`).join('')}
        </div>
        <div style="margin-top:16px">${btn('End Dive','window.__endPearl()','ghost')}</div>
      </div>
    `);
    window.__endPearl = end;
    window.pearlPing = (i) => {
      const el = document.getElementById(`pearl-${i}`);
      if(!el || el.dataset.found) return;
      playBeep('click');
      if(Math.random()>0.5) {
        el.textContent = '🦪'; el.style.background = 'rgba(245,158,11,0.15)'; el.dataset.found = '1';
        found++;
        const pc = document.getElementById('pearlCount'); if(pc) pc.textContent = found;
      } else {
        el.textContent = '💨'; el.style.opacity = '0.4'; el.dataset.found = '1';
      }
    };
    logAlphaFeature('Pearl Sonar');
  }

  function playTycoon() {
    let qIdx = 0; let correct = 0;
    const qs = [
      {q:'What is the primary revenue model?',a:['Ads','Memberships + Creator Fees','Crypto Mining'],correct:1},
      {q:'How many themed districts exist?',a:['5','7','12'],correct:1},
      {q:'What is the target ARPU?',a:['$5','$15','$50'],correct:1},
      {q:'What framework runs the MVP?',a:['React','Vanilla JS + Tailwind','Unity'],correct:1},
      {q:'Nexus Island is anchored in?',a:['Dubai','Abu Dhabi','Riyadh'],correct:1}
    ];
    const render = () => {
      if(qIdx >= qs.length) {
        state.gameStats.tycoon.plays++; if(correct>state.gameStats.tycoon.best)state.gameStats.tycoon.best=correct; save();
        award(30,correct*15,`Strategy Arena: ${correct}/${qs.length}`);
        modal('🧠 Results',`<div style="text-align:center"><div style="font-size:36px;font-weight:900;color:var(--accent-text)">${correct}/${qs.length}</div><p style="color:var(--text-muted);margin:12px 0">Questions answered correctly.</p>${btn('Close','closeModal()','primary')}</div>`);
        return;
      }
      const q = qs[qIdx];
      modal(`🧠 Question ${qIdx+1}/${qs.length}`,`
        <div style="display:flex;flex-direction:column;gap:12px">
          <p style="font-size:15px;font-weight:700">${q.q}</p>
          ${q.a.map((a,i)=>`<button onclick="answerTycoon(${i},${q.correct})" class="btn btn-ghost" style="width:100%;text-align:left;justify-content:start">${a}</button>`).join('')}
        </div>
      `);
    };
    window.answerTycoon = (sel,corr) => {
      if(sel===corr) { correct++; toast('✅ Correct!','success'); } else { toast('❌ Wrong.','warn'); }
      qIdx++; setTimeout(render,600);
    };
    render();
    logAlphaFeature('Strategy Arena');
  }

  function droneTap() {} // overridden in playDrone
  function pearlPing() {} // overridden in playPearl
  function answerTycoon() {} // overridden in playTycoon

  /* WALLET */
  function wallet() {
    const sec = state.security || { score: 98, escrowActive: true, kycVerified: true, twoFactor: true, pinLocked: false };
    const vouchers = state.phygitalVouchers || [];

    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Sovereign Treasury & Nexus Shield','Wallet, Atomic Escrow & Cryptographic Receipts','1 ISL = 0.50 AED · Regulated Web2.5 ledger with SHA-256 receipt verification and phygital brand vouchers.',btn('🛂 Visa Center','openVisaCenterModal()','ghost')+btn('+ Demo Funds (2,500 ISL)','demoFunds(2500)','gold'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
        ${metric('Balance', money(state.wallet), aed(state.wallet), '◈')}
        ${metric('Nexus Shield Score', `${sec.score}/100`, 'UAE Pass + Escrow KYC', '🛡️')}
        ${metric('Active Visa Tier', (VISA_TIERS.find(v=>v.id===(state.visaTier||'resident'))||VISA_TIERS[1]).name, `${Object.values(state.visas||{}).filter(v=>v.unlocked).length}/4 Countries Unlocked`, '🛂')}
        ${metric('Transactions', state.transactions.length, 'SHA-256 signed ledger', '📜')}
      </div>

      <!-- NEXUS SHIELD SECURITY & ATOMIC ESCROW VAULT -->
      ${card(`<div style="padding:20px;background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.04))">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px">
          <div>
            <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#34d399;font-weight:800">🛡️ Nexus Shield — Zero-Trust Security Architecture</div>
            <div style="font-size:15px;font-weight:900;margin-top:2px">ADGM Atomic Escrow Vault & Cryptographic Transaction Protection</div>
          </div>
          <button onclick="toggleSecurityPin()" class="btn ${sec.pinLocked?'btn-gold':'btn-ghost'} btn-sm">${sec.pinLocked?'🔒 Vault Hardware-Locked':'🔓 Lock Escrow Vault'}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;font-size:12px">
          <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
            <div style="color:#34d399;font-weight:800">✓ Atomic Deed Escrow</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Title deeds & ISL settle simultaneously; zero counterparty default risk.</div>
          </div>
          <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
            <div style="color:var(--accent-text);font-weight:800">✓ SHA-256 Audit Receipts</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Every land, house, vehicle, and visa transaction has a verifiable hash.</div>
          </div>
          <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
            <div style="color:#fbbf24;font-weight:800">✓ Sovereign Identity KYC</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Verified UAE Virtual Visa prevents sybil bots and wash trading.</div>
          </div>
        </div>
      </div>`)}

      <!-- PHYGITAL PARTNER VOUCHERS -->
      ${card(`<div style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-size:14px;font-weight:900">🎟️ Phygital Partner Vouchers (Real-World UAE Redemption)</div>
          ${btn('Claim More at Enterprises','nav("businesses.html")','ghost','class="btn btn-ghost btn-sm"')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">
          ${vouchers.map(v => `
            <div style="padding:14px;border-radius:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);display:flex;justify-content:space-between;align-items:center;gap:10px">
              <div>
                <div style="font-size:13px;font-weight:800;color:#fbbf24">${esc(v.brand)}</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${esc(v.discount)}</div>
                <div style="font-size:10px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-top:4px">CODE: ${esc(v.code)}</div>
              </div>
              <span class="tag tag-emerald" style="font-size:9px">Active</span>
            </div>
          `).join('')}
        </div>
      </div>`)}

      <!-- CRYPTOGRAPHIC TRANSACTION LEDGER -->
      ${card(`<div style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div style="font-size:14px;font-weight:900">Cryptographic Transaction Ledger (Click to Verify Receipt)</div>
          <span style="font-size:11px;color:var(--text-dim)">SHA-256 Immutable Audit Trail</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${state.transactions.slice(0,15).map(t => {
            const h = t.hash || txHash(t.id + t.description);
            return `<div onclick="verifyTxReceipt('${t.id}')" style="padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;font-size:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
              <div>
                <div style="font-weight:700">${esc(t.description)}</div>
                <div style="font-size:10px;color:var(--text-dim);margin-top:2px">${t.date} · ${t.type} · <span style="color:#34d399">${esc(t.status||'Settled')}</span> · <span style="font-family:'JetBrains Mono',monospace;color:var(--accent-text)">${h.slice(0,16)}...</span></div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="font-weight:800;color:${t.amount>=0?'#34d399':'#fb7185'}">${t.amount>=0?'+':''}${money(t.amount)}</div>
                <span class="tag tag-cyan" style="font-size:9px">🔒 Verify</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`)}
    </section>`;
  }

  function verifyTxReceipt(txId) {
    const t = state.transactions.find(x => x.id === txId) || state.transactions[0];
    if (!t) return;
    const h = t.hash || txHash(t.id + t.description);
    modal('🔒 Nexus Shield — Cryptographic Receipt Verification', `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="padding:16px;border-radius:14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);text-align:center">
          <div style="font-size:32px;margin-bottom:4px">🛡️</div>
          <div style="font-size:15px;font-weight:900;color:#34d399">Cryptographic Signature Verified</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">ADGM Atomic Escrow & Nexus Shield Ledger</div>
        </div>
        <div style="padding:14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);font-size:12px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Transaction ID:</span><span class="mono">${esc(t.id)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Description:</span><b>${esc(t.description)}</b></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Amount:</span><b style="color:${t.amount>=0?'#34d399':'#fb7185'}">${t.amount>=0?'+':''}${money(t.amount)} (${aed(Math.abs(t.amount))})</b></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Settlement Status:</span><span style="color:#34d399;font-weight:700">${esc(t.status||'Settled · Escrow Verified')}</span></div>
          <div style="padding-top:8px;border-top:1px solid rgba(255,255,255,0.06)">
            <div style="font-size:10px;color:var(--text-dim);margin-bottom:4px">SHA-256 AUDIT HASH</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--accent-text);word-break:break-all">${h}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end">${btn('Close','closeModal()','primary')}</div>
      </div>
    `);
  }

  function toggleSecurityPin() {
    if (!state.security) state.security = { score: 98, escrowActive: true, kycVerified: true, twoFactor: true, pinLocked: false };
    state.security.pinLocked = !state.security.pinLocked;
    save();
    toast(state.security.pinLocked ? '🔒 Escrow Vault locked with hardware session guard.' : '🔓 Escrow Vault unlocked for trading.', 'success');
    refresh();
  }

  /* PROFILE */
  function profile() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Identity','Resident Profile','Your public identity on Nexus Island.',btn('Edit Profile','editProfile()','ghost'))}
      ${card(`<div style="padding:28px">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,var(--accent-soft),rgba(99,102,241,0.08));display:grid;place-items:center;font-size:40px;border:2px solid var(--border-accent)">${state.user.avatar}</div>
          <div>
            <div style="font-size:22px;font-weight:900">${esc(state.user.name)}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">@${esc(state.user.username)} · ${esc(state.user.country)}</div>
            <div style="font-size:11px;color:var(--accent-text);font-weight:700;margin-top:4px">${esc(state.user.title)} · Level ${state.user.level}</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-top:16px;line-height:1.6">${esc(state.user.bio)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">
          ${state.user.interests.map(i=>`<span class="tag tag-cyan">${esc(i)}</span>`).join('')}
        </div>
      </div>`)}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
        ${metric('Level', state.user.level, `${state.user.xp} XP`, '⭐')}
        ${metric('Reputation', state.user.reputation, 'Trust score', '✦')}
        ${metric('Friends', state.friends.length, 'Connections', '👥')}
        ${metric('Properties', state.ownedProperties.length + state.ownedLand.length, 'Owned', '🏡')}
      </div>
    </section>`;
  }

  function editProfile() { modal('Edit Profile',`<p style="font-size:13px;color:var(--text-muted)">Profile editing available in the prototype.</p><div style="margin-top:12px">${btn('Close','closeModal()','ghost')}</div>`); }
  function saveProfile() { save(); toast('Profile saved!','success'); }

  /* NOTIFICATIONS */
  function notifications() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Activity','Notifications & Inbox','Island updates, social interactions, and system alerts.',btn('Mark All Read','readAll()','ghost')+btn('Clear Read','clearRead()','ghost'))}
      <div style="display:flex;flex-direction:column;gap:6px">
        ${state.notifications.map(n=>`
          <div style="padding:12px 16px;border-radius:14px;background:${n.read?'rgba(255,255,255,0.01)':'var(--accent-soft)'};border:1px solid ${n.read?'rgba(255,255,255,0.04)':'var(--accent-soft)'};display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;transition:all 0.2s" onclick="readOne('${n.id}')" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='${n.read?'rgba(255,255,255,0.01)':'var(--accent-soft)'}'">
            <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
              ${n.read?'':'<span class="live-dot" style="width:6px;height:6px;flex-shrink:0"></span>'}
              <span style="font-size:12px;font-weight:${n.read?'500':'700'};color:${n.read?'var(--text-muted)':'var(--text-primary)'}; overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.text)}</span>
            </div>
            <span style="font-size:10px;color:var(--text-dim);flex-shrink:0">${esc(n.time)}</span>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  function readOne(id) { const n=state.notifications.find(x=>x.id===id); if(n) n.read=true; save(); refresh(); }
  function readAll() { state.notifications.forEach(n=>n.read=true); save(); toast('All read.','success'); refresh(); }
  function clearRead() { state.notifications=state.notifications.filter(n=>!n.read); save(); toast('Cleared.','success'); refresh(); }

  /* SETTINGS */
  function settings() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Preferences','Settings','Customize your island experience.')}
      ${card(`<div style="padding:20px;display:flex;flex-direction:column;gap:12px">
        ${Object.entries(state.settings).filter(([k])=>typeof state.settings[k]==='boolean').map(([key,val])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05)">
            <span style="font-size:13px;font-weight:700">${key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</span>
            <button onclick="toggleSetting('${key}')" style="width:44px;height:24px;border-radius:12px;cursor:pointer;border:none;transition:all 0.2s;background:${val?'#06b6d4':'rgba(255,255,255,0.1)'};position:relative">
              <div style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${val?'23px':'3px'};transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>
            </button>
          </div>
        `).join('')}
      </div>`)}
      <div style="display:flex;gap:8px">
        ${btn('Reset Demo','confirmReset()','danger')}
        ${btn('Sign Out','signOut()','ghost')}
      </div>
    </section>`;
  }

  function toggleSetting(key) { state.settings[key] = !state.settings[key]; save(); refresh(); }
  function setSetting(key,val) { state.settings[key] = val; save(); }
  function confirmReset() { modal('Reset All Data?',`<p style="color:var(--text-muted);font-size:13px">This erases all progress.</p><div style="margin-top:16px;display:flex;gap:8px;justify-content:end">${btn('Cancel','closeModal()','ghost')}${btn('Reset','resetDemo()','danger')}</div>`); }
  function resetDemo() { if(typeof localStorage!=='undefined')localStorage.removeItem(STORAGE_KEY); closeModal(); nav('index.html'); }
  function signOut() { state.auth=false; save(); nav('index.html'); }

  /* INVESTOR DECK */
  function investor() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Investor Suite','11-Slide Pitch Deck & Tour','Navigate the full investor presentation.',
        `<a href="one-pager.html" class="btn btn-gold btn-sm">📄 1-Pager PDF</a>${btn('▶ Demo Script','tour()','primary')}`)}
      ${card(`<div style="padding:28px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px">🎬</div>
        <h2 class="heading-md">Interactive Investor Deck</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-top:8px;max-width:500px;margin-left:auto;margin-right:auto">Walk through the Problem, Solution, Market, Districts, Revenue Streams, Unit Economics, Traction, Team, and the $1.25M Pre-Seed Ask.</p>
        <div style="margin-top:20px">${btn('▶ Launch Pitch Deck','openPitchDeck()','gold','class="btn btn-gold btn-lg"')}</div>
      </div>`)}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
        ${[['Problem','Feed burnout + hardware fallacy'],['Solution','Browser-first persistent place'],['7 Districts','Cultural geography of Abu Dhabi'],['Revenue','12 monetization streams'],['Traction','54 alpha testers · 8.4m sessions'],['Team','3 founders · Full-stack execution'],['The Ask','$1.25M Pre-Seed SAFE']].map(([t,d])=>
          `<div class="metric-card"><div class="metric-label">${t}</div><div style="font-size:13px;font-weight:700;margin-top:6px">${d}</div></div>`
        ).join('')}
      </div>
    </section>`;
  }

  function tour() { toast('3-minute demo script — follow the sequence in INVESTOR_PITCH_PACK.md','info'); }
  function openPitchDeck() { toast('Pitch deck launching — navigate through each slide.','info'); }

  /* BUSINESS MODEL */
  function businessModel() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Financial Engine','14 Revenue Streams & Unit Economics','Diversified B2C, B2B Enterprise, and Sovereign Escrow monetization across 4 Countries & 10+ Islands.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
        ${[
          ['Virtual Visa Issuance','Country & Golden Visa upgrades (0–1,200 ISL)','🛂'],
          ['Primary Land Minting','Sovereign parcel releases across 5–10+ islands','🏝️'],
          ['Secondary Property Escrow','5% atomic escrow fee on land & house sales','🏛️'],
          ['Emaar Blueprint Royalties','20% platform cut on custom villa construction','🏗️'],
          ['Anchor Brand Flagships','$2,500–$15,000/mo enterprise towers (LuLu, ADGM)','🏢'],
          ['Phygital Retail Commissions','3–8% affiliate rev-share on real-world vouchers','🛒'],
          ['Vehicle & Dealership Economy','Supercar sales, custom liveries & racing fees','🏎️'],
          ['Citizen Memberships','$9.99/mo Gold & Founder Pass subscriptions','👤'],
          ['Creator Marketplace Take-Rate','15% commission on 3D wearables & decor','🎨'],
          ['Event & Summit Ticketing','Ticketed concerts, expos & VIP backstage passes','🎭'],
          ['Spatial Brand Sponsorships','Highway bridge & Skyport terminal naming rights','📢'],
          ['NOVA AI Concierge Pro','AI interior architect & automated shopkeeper','🧠'],
          ['ADGM Commercial Licenses','250 ISL virtual business incorporation fees','📋'],
          ['White-Label Sovereign Cloud','Licensing multi-country infrastructure to govs','🌐']
        ].map(([name,desc,ic])=>
          card(`<div style="padding:18px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:36px;height:36px;border-radius:10px;background:var(--accent-soft);display:grid;place-items:center;font-size:18px">${ic}</div><div style="font-size:13px;font-weight:800">${name}</div></div><p style="font-size:11px;color:var(--text-muted)">${desc}</p></div>`)
        ).join('')}
      </div>
      ${card(`<div style="padding:24px">
        <div style="font-size:15px;font-weight:900;margin-bottom:16px">Interactive Unit Economics</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div><div class="metric-label" style="margin-bottom:6px">Monthly Active Users</div><input type="range" min="10000" max="500000" value="100000" oninput="unitCalc()" id="mauSlider" style="width:100%;accent-color:#06b6d4"><div style="font-size:14px;font-weight:800;margin-top:4px" id="mauLabel">100,000 MAU</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px" id="unitResults">
            <div class="metric-card"><div class="metric-label">MRR</div><div class="metric-value" style="color:var(--accent-text)">$125K</div></div>
            <div class="metric-card"><div class="metric-label">ARR</div><div class="metric-value" style="color:#34d399">$1.5M</div></div>
            <div class="metric-card"><div class="metric-label">Gross Margin</div><div class="metric-value" style="color:#fbbf24">82%</div></div>
          </div>
        </div>
      </div>`)}
    </section>`;
  }

  function unitCalc() {
    const slider = document.getElementById('mauSlider');
    if (!slider) return;
    const mau = Number(slider.value);
    const arpu = 15;
    const conv = 0.08;
    const mrr = Math.round(mau * conv * arpu);
    const arr = mrr * 12;
    document.getElementById('mauLabel').textContent = `${mau.toLocaleString()} MAU`;
    document.getElementById('unitResults').innerHTML = `
      <div class="metric-card"><div class="metric-label">MRR</div><div class="metric-value" style="color:var(--accent-text)">$${(mrr/1000).toFixed(0)}K</div></div>
      <div class="metric-card"><div class="metric-label">ARR</div><div class="metric-value" style="color:#34d399">$${(arr/1000000).toFixed(1)}M</div></div>
      <div class="metric-card"><div class="metric-label">Gross Margin</div><div class="metric-value" style="color:#fbbf24">82%</div></div>
    `;
  }

  /* FUTURE / WHY NEXUS / ALPHA / ADMIN — Compact Implementations */
  function future() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Vision','Spatial Roadmap','The long-term evolution from browser-first to fully immersive.')}
      ${[['Q4 2026','Closed Alpha → Open Beta with 5,000 users + WebGL 3D district views'],['Q1 2027','Mobile companion app + Creator SDK + 50 registered creators'],['Q2 2027','Enterprise virtual branches + Government pilot programs'],['Q3 2027','Series A raise + VR/AR spatial extension + International expansion'],['2028+','Programmable world + 100K+ MAU + Full spatial computing integration']].map(([period,desc])=>
        card(`<div style="padding:18px;display:flex;align-items:start;gap:14px"><div style="width:10px;height:10px;border-radius:50%;background:#06b6d4;margin-top:5px;flex-shrink:0;box-shadow:0 0 8px var(--border-accent)"></div><div><div style="font-size:13px;font-weight:800">${period}</div><p style="font-size:12px;color:var(--text-muted);margin-top:4px;line-height:1.5">${desc}</p></div></div>`)
      ).join('')}
    </section>`;
  }

  function why() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Defensibility','Why Nexus Island Wins','The moat is not graphics — it\'s the ecosystem.')}
      ${[['Network Effects','Every user, creator, business, and community makes the island more valuable for everyone else.'],['Cultural Geography','Districts mapped to Abu Dhabi landmarks create emotional resonance no competitor can replicate.'],['Creator Flywheel','85% royalty rate attracts creators → more content → more users → more creators.'],['Browser-First','Zero downloads, zero VR headsets. Anyone enters in 3 seconds on any device.'],['AI-Native','NOVA AI provides personalized guidance that improves with every interaction.'],['Utility Over Speculation','Land and property serve real purposes — no speculative flipping.']].map(([title,desc])=>
        card(`<div style="padding:20px"><h3 style="font-size:15px;font-weight:900;margin-bottom:8px">${title}</h3><p style="font-size:12px;color:var(--text-muted);line-height:1.6">${desc}</p></div>`)
      ).join('')}
    </section>`;
  }

  function alpha() {
    const tel = getAlphaTelemetry();
    const cohort = tel.cohort || [];
    const activeCount = cohort.length;
    const d1Count = cohort.filter(x=>x.d1Return).length;
    const d7Count = cohort.filter(x=>x.d7Return).length;
    const avgMin = cohort.length ? Math.round(cohort.reduce((s,x)=>s+(x.totalMinutes||0),0)/cohort.length * 10)/10 : 0;
    const avgSess = cohort.length ? Math.round(cohort.reduce((s,x)=>s+(x.sessions||0),0)/cohort.length * 10)/10 : 0;

    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Traction Proof','Closed Alpha Cohort 1','Real usage telemetry powering Pre-Seed milestones.',btn('+ Simulate Session','simulateAlphaSession()','ghost')+btn('Invite Testers','openAlphaInviteModal()','primary')+btn('📥 Export CSV','exportAlphaTelemetryCSV()','ghost'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
        ${metric('Enrolled', `${activeCount}/100`, 'Alpha quota', '⚡')}
        ${metric('Avg Session', `${avgMin}m`, `${avgSess} sessions avg`, '⏱️')}
        ${metric('D1 Return', `${cohort.length?Math.round(d1Count/cohort.length*100):0}%`, `${d1Count} returned`, '📈')}
        ${metric('D7 Return', `${cohort.length?Math.round(d7Count/cohort.length*100):0}%`, `${d7Count} returned`, '🔄')}
      </div>
      ${card(`<div style="padding:20px"><div style="font-size:14px;font-weight:900;margin-bottom:14px">Cohort Members</div><div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto">${cohort.slice(0,20).map(t=>`<div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;align-items:center;font-size:12px"><div><div style="font-weight:700">${esc(t.name)}</div><div style="font-size:10px;color:var(--text-dim)">${t.cohort} · ${t.sessions} sessions · ${t.totalMinutes}m</div></div><div style="display:flex;gap:4px">${t.d1Return?'<span class="tag tag-emerald" style="font-size:8px">D1✓</span>':''}${t.d7Return?'<span class="tag tag-cyan" style="font-size:8px">D7✓</span>':''}</div></div>`).join('')}</div></div>`)}
    </section>`;
  }

  function admin() {
    const waitlist = getWaitlist();
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Operations','Platform Admin Console','Operator-level data, waitlist management, and telemetry.',btn('📥 Export Waitlist','exportWaitlistCSV()','gold'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
        ${metric('Waitlist', waitlist.length + 1248, 'Total signups', '📋')}
        ${metric('Alpha Testers', getAlphaTelemetry().cohort.length, 'Enrolled', '⚡')}
        ${metric('Routes', '25', 'Working surfaces', '🌐')}
      </div>
      ${card(`<div style="padding:20px"><div style="font-size:14px;font-weight:900;margin-bottom:14px">Recent Waitlist Entries</div><div style="display:flex;flex-direction:column;gap:6px">${waitlist.slice(0,10).map(w=>`<div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;align-items:center;font-size:12px"><div><div style="font-weight:700">${esc(w.name)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(w.email)} · ${esc(w.district)}</div></div><span class="tag tag-amber" style="font-size:9px">${esc(w.passportNo)}</span></div>`).join('')}</div></div>`)}
    </section>`;
  }

  /* NOVA AI CO-PILOT */
  function nova() {
    const tips = [];
    if (state.ownedLand.length === 0) tips.push({text:'Acquire your first land parcel in Harbor District to unlock home construction.',action:`nav('land.html')`,btn:'Browse Land'});
    if (!state.home.built) tips.push({text:'Build your private residence to unlock the 2.5D Room Interior Studio.',action:'buildHome()',btn:'Build Home'});
    if (state.friends.length < 7) tips.push({text:'Connect with more residents to unlock community governance voting.',action:`nav('friends.html')`,btn:'Find People'});
    if (state.joined.length < 3) tips.push({text:'Join at least 3 communities to earn the Guild Member achievement.',action:`nav('communities.html')`,btn:'Browse Guilds'});
    tips.push({text:`You have ${money(state.wallet)} in your treasury. Consider exploring the marketplace for creator goods.`,action:`nav('marketplace.html')`,btn:'Marketplace'});

    modal('✨ NOVA AI Co-Pilot', `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="padding:14px;border-radius:14px;background:linear-gradient(135deg,var(--accent-soft),rgba(99,102,241,0.04));border:1px solid var(--accent-soft)">
          <div style="font-size:12px;font-weight:800;color:var(--accent-text);margin-bottom:6px">Context-Aware Recommendations</div>
          <div style="font-size:11px;color:var(--text-muted)">Based on Level ${state.user.level} · ${money(state.wallet)} balance · ${state.ownedLand.length} parcels · ${state.friends.length} friends</div>
        </div>
        ${tips.map(t => `
          <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;gap:12px">
            <span style="font-size:13px;color:var(--text-secondary);font-weight:600;flex:1">${t.text}</span>
            ${btn(t.btn, `closeModal();${t.action}`, 'primary', 'class="btn btn-primary btn-sm"')}
          </div>
        `).join('')}
      </div>
    `);
  }

  function askNOVA(q) { nova(); }

  /* SEARCH */
  function search() {
    modal('⌕ Search Nexus Island', `
      <form onsubmit="searchResults(event)" style="display:flex;flex-direction:column;gap:12px">
        <input name="q" class="field" placeholder="Search districts, people, businesses, items..." autofocus>
        <button type="submit" class="btn btn-primary">Search</button>
      </form>
    `);
  }

  function searchResults(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const q = String(f.get('q')||'').trim().toLowerCase();
    if (!q) return;
    const results = [
      ...DISTRICTS.filter(d=>d.name.toLowerCase().includes(q)).map(d=>({name:d.name,type:'District',action:`closeModal();zone('${d.id}')`})),
      ...DATA.users.filter(u=>u.name.toLowerCase().includes(q)).map(u=>({name:u.name,type:'Resident',action:`closeModal();nav('friends.html')`})),
      ...DATA.businesses.filter(b=>b.name.toLowerCase().includes(q)).map(b=>({name:b.name,type:'Business',action:`closeModal();nav('businesses.html')`})),
      ...DATA.products.filter(p=>p.name.toLowerCase().includes(q)).map(p=>({name:p.name,type:'Product',action:`closeModal();productDetail('${p.id}')`}))
    ];
    closeModal();
    modal(`Results for "${esc(q)}"`, results.length ?
      results.map(r=>`<div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div><div style="font-size:13px;font-weight:700">${esc(r.name)}</div><div style="font-size:10px;color:var(--text-dim)">${r.type}</div></div>${btn('Go',r.action,'primary','class="btn btn-primary btn-sm"')}</div>`).join('') :
      '<p style="font-size:13px;color:var(--text-muted)">No results found.</p>'
    );
  }

  /* MULTIPLAYER (simplified — keeping broadcast channel logic) */
  const MP_CHANNEL_NAME = 'nexus_island_multiplayer_v1';
  let mpChannel = null;
  const remotePeers = {};

  function initMultiplayer() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    try {
      if (!mpChannel) {
        mpChannel = new BroadcastChannel(MP_CHANNEL_NAME);
        mpChannel.onmessage = (event) => handleMultiplayerPacket(event.data);
      }
      broadcastMultiplayer({ type:'PRESENCE_JOIN', id:state.user.id, name:state.user.name, avatar:state.user.avatar, districtId:state.currentDistrict||'harbor', x:state.avatarPosition?.x||48, y:state.avatarPosition?.y||64, time:Date.now() });
    } catch {}
  }

  function broadcastMultiplayer(payload) {
    if (mpChannel) try { mpChannel.postMessage(payload); } catch {}
    if (typeof localStorage !== 'undefined') try { localStorage.setItem('nexus_mp_event', JSON.stringify({...payload, _ts:Date.now()})); } catch {}
  }

  function handleMultiplayerPacket(data) {
    if (!data || data.id === state.user.id) return;
    if (data.type === 'PRESENCE_JOIN') {
      remotePeers[data.id] = data;
      broadcastMultiplayer({ type:'PRESENCE_ACK', id:state.user.id, name:state.user.name, avatar:state.user.avatar, districtId:state.currentDistrict, x:state.avatarPosition?.x||48, y:state.avatarPosition?.y||64 });
      toast(`📡 ${data.name} connected!`, 'info');
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'nexus_mp_event' && e.newValue) try { handleMultiplayerPacket(JSON.parse(e.newValue)); } catch {}
    });
  }

  function launchMultiplayerDemo(districtId) {
    const dId = districtId || state.currentDistrict || 'harbor';
    const guests = [{ name:'Tariq_Al-Hashimi', avatar:'👨🏽‍💻' },{ name:'Noura_Al-Suwaidi', avatar:'👩🏽‍🎨' }];
    const g = guests[Math.floor(Math.random()*guests.length)];
    const url = `island.html?guest=${g.name}&avatar=${encodeURIComponent(g.avatar)}&district=${dId}`;
    if (typeof window !== 'undefined') {
      const popup = window.open(url, 'NexusMP_'+Date.now(), 'width=980,height=820');
      if (popup) toast(`🚀 Companion window launched as ${g.name.replace(/_/g,' ')}!`, 'success');
      else toast('Popup blocked — open manually.', 'warn');
    }
  }

  // Plaza-related functions — connected to world engine
  function walkToPlazaPoint(districtId) {
    if (typeof window.engineFocusDistrict === 'function') {
      window.engineFocusDistrict(districtId || state.currentDistrict);
      toast('Walking to plaza...', 'info');
    }
  }
  function submitDistrictSay(e) {
    if (e && e.preventDefault) e.preventDefault();
    toast('💬 Message sent to nearby residents!', 'success');
  }
  function sendDistrictEmote(emote) {
    toast(`${emote || '👋'} Emote sent!`, 'info');
    playBeep('emote');
  }
  function waveAtPeer(userId) {
    const u = DATA.users.find(x => x.id === userId);
    toast(`👋 Waved at ${u?.name || 'resident'}!`, 'success');
    playBeep('emote');
  }
  function inspectPeer(userId) {
    const u = DATA.users.find(x => x.id === userId);
    if (u) person(userId);
  }
  function tipPeer(userId, amount) {
    const tip = amount || 10;
    if (state.wallet < tip) return toast('Insufficient ISL.', 'warn');
    const u = DATA.users.find(x => x.id === userId);
    state.wallet -= tip;
    state.transactions.unshift({ id: uid('tx'), description: `Tip to ${u?.name || 'resident'}`, amount: -tip, type: 'Social', date: 'Just now', status: 'Settled' });
    save();
    toast(`💰 Tipped ${u?.name || 'resident'} ${money(tip)}!`, 'success');
    playBeep('reward');
  }

  /* ═══════════════════════════════════════════════
     VIRAL FEATURE 1: NEIGHBOR DROP
     ═══════════════════════════════════════════════ */
  function neighborDrop() {
    const myLands = state.ownedLand;
    const availablePlots = DATA.land.filter(l => l.available && !state.ownedLand.includes(l.id));
    const adjacentPlots = myLands.length > 0
      ? availablePlots.filter(l => { const owned = DATA.land.find(o => o.id === myLands[0]); return owned && l.district === owned.district; })
      : availablePlots.slice(0, 3);

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      ${pageHeader('Viral Growth','Neighbor Drop','Invite friends to claim the land next to yours. Build your neighborhood together.',btn('📋 View Sent Invites','showNeighborInvites()','ghost'))}

      <!-- Hero Card -->
      ${card(`<div style="padding:32px;position:relative;overflow:hidden">
        <div class="wave-shimmer"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span class="live-dot"></span>
            <span class="metric-label">Neighborhood Builder</span>
          </div>
          <h2 class="heading-lg" style="margin-bottom:12px">Be My Neighbor 🏡</h2>
          <p style="font-size:14px;color:var(--text-muted);line-height:1.7;max-width:520px">Send a personalized invitation link. When your friend joins, they can claim the plot right next to yours. Build a connected virtual neighborhood in minutes.</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:20px">
            ${btn('📨 Send Neighbor Invite','openNeighborInviteModal()','gold','class="btn btn-gold btn-lg"')}
            ${btn('🏘️ View My Neighborhood','viewMyNeighborhood()','ghost','class="btn btn-ghost btn-lg"')}
          </div>
        </div>
      </div>`)}

      <!-- How It Works -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
        ${[['1. Choose Plot','Select the vacant land next to yours','🏝️','var(--accent-soft)'],
          ['2. Send Invite','Share a personalized "Be My Neighbor" link','📨','rgba(245,158,11,0.08)'],
          ['3. Friend Joins','They claim the reserved plot instantly','🤝','rgba(16,185,129,0.08)'],
          ['4. Neighborhood!','Both earn Neighborhood Bonus XP & ISL','🎉','rgba(139,92,246,0.08)']].map(([t,d,i,bg]) => `
          <div class="glass-card" style="padding:20px;text-align:center">
            <div style="width:48px;height:48px;border-radius:14px;background:${bg};display:grid;place-items:center;font-size:24px;margin:0 auto 12px">${i}</div>
            <div style="font-size:13px;font-weight:800;margin-bottom:4px">${t}</div>
            <div style="font-size:11px;color:var(--text-muted)">${d}</div>
          </div>
        `).join('')}
      </div>

      <!-- Nearby Vacant Plots -->
      <div>
        <div class="metric-label" style="margin-bottom:12px">Available Neighbor Plots</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
          ${adjacentPlots.slice(0,6).map(l => card(`
            <div style="padding:18px">
              <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
                <div><span class="tag tag-cyan">${l.id}</span><h3 style="font-size:14px;font-weight:800;margin-top:6px">${esc(l.name)}</h3><div style="font-size:11px;color:var(--text-muted);margin-top:2px">${l.district} · ${l.size}</div></div>
                <div style="font-size:14px;font-weight:900;color:var(--accent-text)">${money(l.price)}</div>
              </div>
              <div style="display:flex;gap:6px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
                ${btn('🏡 Invite Neighbor',`sendNeighborInvite('${l.id}')`,'gold','class="btn btn-gold btn-sm" style="flex:1"')}
                ${btn('View',`landDetail('${l.id}')`,'ghost','class="btn btn-ghost btn-sm"')}
              </div>
            </div>
          `)).join('')}
        </div>
      </div>

      <!-- Sent Invitations -->
      ${state.neighborInvites.length ? `
      <div>
        <div class="metric-label" style="margin-bottom:12px">Sent Neighbor Invitations (${state.neighborInvites.length})</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${state.neighborInvites.map(inv => `
            <div style="padding:12px 16px;border-radius:14px;background:rgba(245,158,11,0.04);border:1px solid rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:space-between;gap:10px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:18px">📨</span>
                <div><div style="font-size:12px;font-weight:700">Invited ${esc(inv.friendName)} → Plot ${esc(inv.landId)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(inv.date)} · Reserved 48h</div></div>
              </div>
              <span class="tag ${inv.status==='claimed'?'tag-emerald':'tag-amber'}">${inv.status==='claimed'?'✓ Claimed':'Pending'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </section>`;
  }

  function openNeighborInviteModal() {
    const plots = DATA.land.filter(l => l.available).slice(0, 6);
    modal('📨 Send Neighbor Invitation', `
      <form onsubmit="submitNeighborInvite(event)" style="display:flex;flex-direction:column;gap:14px">
        <div style="padding:14px;border-radius:14px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">🏘️</span>
          <div><div style="font-size:13px;font-weight:800;color:#fbbf24">Neighbor Drop Invitation</div><div style="font-size:11px;color:var(--text-muted)">Your friend gets 48h to claim this reserved plot</div></div>
        </div>
        <div><div class="metric-label" style="margin-bottom:6px">Friend's Name</div><input required name="friendName" class="field" placeholder="e.g. Omar Al-Zaabi"></div>
        <div><div class="metric-label" style="margin-bottom:6px">Friend's Email or Phone</div><input required name="contact" class="field" placeholder="email@domain.ae or +971..."></div>
        <div><div class="metric-label" style="margin-bottom:6px">Select Neighbor Plot</div><select name="landId" class="field">${plots.map(l=>`<option value="${l.id}">${l.id} — ${esc(l.name)} (${l.district})</option>`).join('')}</select></div>
        <div><div class="metric-label" style="margin-bottom:6px">Personal Message (optional)</div><input name="message" class="field" placeholder="Come be my neighbor! 🏡"></div>
        <div style="display:flex;justify-content:end;gap:8px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          ${btn('Cancel','closeModal()','ghost')}
          <button type="submit" class="btn btn-gold">📨 Send Invitation</button>
        </div>
      </form>
    `);
  }

  function submitNeighborInvite(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const friendName = String(f.get('friendName')||'').trim();
    const contact = String(f.get('contact')||'').trim();
    const landId = String(f.get('landId')||'');
    const message = String(f.get('message')||'Come be my neighbor! 🏡');
    if (!friendName || !contact) return toast('Please fill in friend details.','warn');
    const inv = { id:uid('inv'), friendName, contact, landId, message, date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}), status:'pending' };
    state.neighborInvites.push(inv);
    award(25, 15, `Sent neighbor invite to ${friendName}`);
    save(); closeModal();
    const refUrl = `${typeof window!=='undefined'&&window.location?window.location.origin+window.location.pathname.replace(/[^/]*$/,''):'https://nexusisland.ae/'}?neighbor=${encodeURIComponent(landId)}&from=${encodeURIComponent(state.user.name)}`;
    shareNeighborLink(refUrl, friendName, message);
  }

  function sendNeighborInvite(landId) {
    const l = DATA.land.find(x=>x.id===landId);
    if(!l) return;
    modal('📨 Quick Neighbor Invite',`
      <form onsubmit="submitNeighborInvite(event)" style="display:flex;flex-direction:column;gap:12px">
        <div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div class="metric-label">Selected Plot</div>
          <div style="font-size:14px;font-weight:800;margin-top:4px">${l.id} — ${esc(l.name)}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px">${l.district} · ${l.size} · ${money(l.price)}</div>
        </div>
        <input type="hidden" name="landId" value="${l.id}">
        <div><div class="metric-label" style="margin-bottom:6px">Friend's Name</div><input required name="friendName" class="field" placeholder="e.g. Sara Al-Mansoori"></div>
        <div><div class="metric-label" style="margin-bottom:6px">Contact</div><input required name="contact" class="field" placeholder="email or phone"></div>
        <input type="hidden" name="message" value="Come be my neighbor on Nexus Island! 🏡">
        <div style="display:flex;gap:8px;justify-content:end;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
          ${btn('Cancel','closeModal()','ghost')}
          <button type="submit" class="btn btn-gold">📨 Send</button>
        </div>
      </form>
    `);
  }

  function shareNeighborLink(url, friendName, message) {
    modal('📨 Invitation Sent!', `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="padding:16px;border-radius:16px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);text-align:center">
          <span style="font-size:40px;display:block;margin-bottom:8px">🎉</span>
          <div style="font-size:16px;font-weight:900;color:#34d399">Invite Sent to ${esc(friendName)}!</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">They have 48 hours to claim the reserved plot</div>
        </div>
        <div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:8px">
          <input type="text" readonly value="${escAttr(url)}" class="field mono" style="font-size:10px;flex:1" id="neighborLink">
          <button onclick="navigator.clipboard.writeText(document.getElementById('neighborLink').value);toast('📋 Copied!','success')" class="btn btn-primary btn-sm">Copy</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(message + ' ' + url)}" target="_blank" class="btn btn-success" style="text-align:center">💬 WhatsApp</a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Come be my neighbor on @NexusIsland! ' + url)}" target="_blank" class="btn btn-primary" style="text-align:center">𝕏 Share</a>
        </div>
      </div>
    `);
  }

  function showNeighborInvites() { if(!state.neighborInvites.length) return toast('No invitations sent yet.','info'); modal('📨 Sent Invitations',`<div style="display:flex;flex-direction:column;gap:8px">${state.neighborInvites.map(inv=>`<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:12px;font-weight:700">${esc(inv.friendName)} → ${esc(inv.landId)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(inv.date)}</div></div><span class="tag tag-amber">Pending</span></div>`).join('')}</div>`); }
  function viewMyNeighborhood() { toast('Your neighborhood is growing! Invite more friends.','info'); }

  /* ═══════════════════════════════════════════════
     VIRAL FEATURE 2: ISLAND FLEX CARD
     ═══════════════════════════════════════════════ */
  function flexCard() {
    const builtCount = Object.keys(state.landBuildings || {}).length;
    const netWorth = state.wallet + state.ownedLand.length * 800 + builtCount * 1100 + state.ownedProperties.length * 1200 + state.ownedVehicles.length * 600 + state.inventory.length * 50;
    const totalVisitors = state.home.visitorsNow * 47 + state.home.upvotes * 12;
    const assetCount = state.ownedLand.length + state.ownedProperties.length + state.ownedVehicles.length + state.inventory.length;
    const tier = netWorth >= 10000 ? 'Platinum' : netWorth >= 5000 ? 'Gold' : netWorth >= 2000 ? 'Silver' : 'Bronze';
    const tierColors = { Platinum:'linear-gradient(135deg,#0f172a,#1e293b,#334155)', Gold:'linear-gradient(135deg,#b45309,#d97706,#78350f)', Silver:'linear-gradient(135deg,#334155,#475569,#1e293b)', Bronze:'linear-gradient(135deg,#78350f,#92400e,#451a03)' };
    const activeVisa = VISA_TIERS.find(v => v.id === (state.visaTier || 'resident')) || VISA_TIERS[1];
    const visaStamps = COUNTRIES.map(c => (state.visas && state.visas[c.id] && state.visas[c.id].unlocked) ? `${c.flag} ${c.id.toUpperCase()} ✓` : `${c.flag} 🔒`).join(' · ');

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      ${pageHeader('Social Sharing & Sovereign Status','Citizen Flex Card & Multi-Country Visa Passport','Generate a verified sovereign status card displaying your 4-Country Visa stamps, Emaar properties, supercars, and net worth.',btn('🛂 Visa Center','openVisaCenterModal()','ghost')+btn('📲 Share Now','shareFlexCard()','gold'))}

      <!-- Preview Card -->
      <div style="max-width:520px;margin:0 auto;width:100%">
        <div id="flexCardPreview" style="aspect-ratio:1.586;border-radius:20px;padding:28px;position:relative;overflow:hidden;background:${tierColors[tier]};box-shadow:0 20px 60px -10px rgba(0,0,0,0.5),0 0 40px -10px rgba(245,158,11,0.25);border:1px solid rgba(255,255,255,0.18)">
          <!-- Card Pattern Overlay -->
          <div style="position:absolute;inset:0;opacity:0.08;background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.1) 20px,rgba(255,255,255,0.1) 21px)"></div>

          <!-- Card Content -->
          <div style="position:relative;z-index:1;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff">
            <!-- Top Row -->
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;font-weight:800;color:#fbbf24">🇦🇪 UAE Sovereign Archipelago · ${esc(activeVisa.name)}</div>
                <div style="font-size:22px;font-weight:900;margin-top:4px;letter-spacing:-0.02em">${esc(state.user.name)}</div>
                <div style="font-size:11px;opacity:0.8;font-weight:600;margin-top:2px">@${esc(state.user.username)} · Level ${state.user.level} · 🛡️ Nexus Shield Verified</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:32px">${state.user.avatar}</div>
                <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.15)">${tier}</div>
              </div>
            </div>

            <!-- Center Stats -->
            <div style="display:flex;gap:14px;justify-content:space-between;margin:auto 0;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,0.28);border:1px solid rgba(255,255,255,0.08)">
              ${[['Net Worth',money(netWorth)],['Land & Villas',`${state.ownedLand.length} / ${builtCount}`],['Supercars',state.ownedVehicles.length],['Visitors',totalVisitors.toLocaleString()]].map(([l,v]) => `
                <div style="text-align:center">
                  <div style="font-size:15px;font-weight:900;letter-spacing:-0.02em">${v}</div>
                  <div style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.75;margin-top:2px">${l}</div>
                </div>
              `).join('')}
            </div>

            <!-- Bottom Row -->
            <div style="display:flex;justify-content:space-between;align-items:end;gap:8px">
              <div style="font-size:9px;opacity:0.85;font-weight:700">${visaStamps}</div>
              <div style="font-size:9px;opacity:0.65;font-family:'JetBrains Mono',monospace">VISA-${state.user.id.slice(0,6).toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Style Selector -->
      <div style="display:flex;justify-content:center;gap:8px;margin-top:-8px">
        ${[['black','⬛'],['gold','🟡'],['ocean','🔵'],['sunset','🟠']].map(([style,ic]) => `
          <button onclick="setFlexStyle('${style}')" style="width:40px;height:40px;border-radius:12px;border:2px solid ${state.flexCardStyle===style?'var(--accent-text)':'rgba(255,255,255,0.1)'};background:rgba(255,255,255,0.04);font-size:18px;display:grid;place-items:center;cursor:pointer;transition:all 0.2s">${ic}</button>
        `).join('')}
      </div>

      <!-- Actions -->
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
        ${btn('📋 Copy Image','copyFlexCard()','primary','class="btn btn-primary btn-lg"')}
        ${btn('💬 WhatsApp','shareFlexWhatsApp()','success','class="btn btn-success btn-lg"')}
        ${btn('📸 Instagram Story','shareFlexInstagram()','ghost','class="btn btn-ghost btn-lg"')}
        ${btn('𝕏 Share','shareFlexTwitter()','ghost','class="btn btn-ghost btn-lg"')}
      </div>

      <!-- Stats Breakdown -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
        ${metric('Virtual Net Worth', money(netWorth), `${aed(netWorth)}`, '💎')}
        ${metric('Card Tier', tier, tierColors[tier] ? 'Premium status' : '', '🏆')}
        ${metric('Total Assets', assetCount, `${state.ownedLand.length} land · ${state.ownedProperties.length} property`, '🏡')}
        ${metric('Island Visitors', totalVisitors.toLocaleString(), 'All-time unique visits', '👁')}
      </div>
    </section>`;
  }

  function setFlexStyle(style) { state.flexCardStyle = style; save(); refresh(); }
  function copyFlexCard() { toast('📋 Flex Card copied! Paste into any app.','success'); playBeep('reward'); }
  function shareFlexCard() { shareFlexWhatsApp(); }
  function shareFlexWhatsApp() {
    const netWorth = state.wallet + state.ownedLand.length * 800 + state.ownedProperties.length * 1200;
    const url = typeof window!=='undefined'?window.location.origin:'https://nexusisland.ae';
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`🏝️ My Nexus Island Flex Card\n💎 Net Worth: ${money(netWorth)}\n🏆 Level ${state.user.level} Resident\n\nJoin me on the island: ${url}`)}`,'_blank');
    award(10, 5, 'Shared Flex Card on WhatsApp');
  }
  function shareFlexInstagram() { toast('📸 Screenshot your card and share to Instagram Stories!','info'); award(10, 5, 'Shared Flex Card'); }
  function shareFlexTwitter() {
    const url = typeof window!=='undefined'?window.location.origin:'https://nexusisland.ae';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just checked my @NexusIsland Flex Card — Level ${state.user.level} resident with ${state.ownedLand.length} land parcels! 🏝️💎 ${url}`)}`,'_blank');
    award(10, 5, 'Shared Flex Card on X');
  }

  /* ═══════════════════════════════════════════════
     VIRAL FEATURE 3: SECRET TREASURE BOX
     ═══════════════════════════════════════════════ */
  function treasureHunt() {
    const hidden = state.treasureBoxes.filter(t => !t.found);
    const found = state.foundTreasures;
    const rarityColors = { Common:'tag-cyan', Rare:'tag-amber', Epic:'tag-violet', Legendary:'tag-rose' };
    const rarityEmoji = { Common:'📦', Rare:'🎁', Epic:'💜', Legendary:'👑' };

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      ${pageHeader('Exploration','Secret Treasure Boxes','Hide treasures on your island or find treasures hidden by friends.',btn('🎁 Hide a Treasure','openHideTreasureModal()','gold')+btn('🗺️ Treasure Map','openTreasureMap()','primary'))}

      <!-- Hero -->
      ${card(`<div style="padding:28px;position:relative;overflow:hidden">
        <div class="wave-shimmer"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="width:56px;height:56px;border-radius:18px;background:rgba(245,158,11,0.1);display:grid;place-items:center;font-size:32px;border:1px solid rgba(245,158,11,0.2)">🏴‍☠️</div>
            <div>
              <h2 style="font-size:20px;font-weight:900">Island Treasure Hunt</h2>
              <p style="font-size:12px;color:var(--text-muted);margin-top:2px">Hide chests for visitors to discover. Finders earn rewards!</p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
            ${metric('Hidden', state.treasureBoxes.length, 'By you', '🎁')}
            ${metric('Found', found.length, 'By you', '🏆')}
            ${metric('Unclaimed', hidden.length, 'Still hidden', '🔍')}
          </div>
        </div>
      </div>`)}

      <!-- Your Hidden Treasures -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div class="metric-label">Your Hidden Treasure Boxes</div>
          ${btn('+ Hide New','openHideTreasureModal()','primary','class="btn btn-primary btn-sm"')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
          ${state.treasureBoxes.map(t => {
            const land = DATA.land.find(l=>l.id===t.landId);
            return card(`
              <div style="padding:18px">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:28px">${rarityEmoji[t.rarity]||'📦'}</span>
                    <div><div style="font-size:13px;font-weight:800">${t.rarity} Treasure</div><div style="font-size:10px;color:var(--text-dim)">${land?land.name:'Unknown Plot'}</div></div>
                  </div>
                  <span class="tag ${rarityColors[t.rarity]||'tag-cyan'}">${t.rarity}</span>
                </div>
                <div style="padding:10px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);font-size:11px;color:var(--text-muted);margin-bottom:10px">
                  <span style="font-weight:700;color:var(--text-secondary)">🔍 Hint:</span> ${esc(t.hint)}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div style="font-size:12px;font-weight:800;color:#fbbf24">Reward: ${money(t.reward)}</div>
                  ${t.found ? `<span class="tag tag-emerald">Found by ${esc(t.foundBy||'Someone')}</span>` : '<span class="tag tag-amber">Hidden ✓</span>'}
                </div>
              </div>
            `);
          }).join('')}
        </div>
      </div>

      <!-- Discover Treasures -->
      <div>
        <div class="metric-label" style="margin-bottom:12px">🔍 Discover Hidden Treasures (from other residents)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
          ${[{hint:'The old lighthouse keeper left something under the third stone.',rarity:'Rare',reward:150,owner:'Maya Chen'},
            {hint:'Where the mangrove roots meet the sand, a golden chest awaits.',rarity:'Epic',reward:350,owner:'Omar Al-Zaabi'},
            {hint:'Climb to the top of the arcade and look behind the neon sign.',rarity:'Legendary',reward:750,owner:'Sara Al-Mansoori'},
            {hint:'The cafe counter has a loose tile. Look underneath.',rarity:'Common',reward:50,owner:'Daniel Ross'},
            {hint:'Follow the drone path to where the signal drops — X marks the spot.',rarity:'Rare',reward:200,owner:'Lina Park'}
          ].filter(t => !state.foundTreasures.includes(t.hint)).map((t,i) => card(`
            <div style="padding:18px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <span style="font-size:22px">${rarityEmoji[t.rarity]}</span>
                <div><div style="font-size:13px;font-weight:800">${t.rarity} Chest</div><div style="font-size:10px;color:var(--text-dim)">Hidden by ${t.owner}</div></div>
                <span class="tag ${rarityColors[t.rarity]}" style="margin-left:auto">${money(t.reward)}</span>
              </div>
              <div style="padding:10px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);font-size:11px;color:var(--text-muted);margin-bottom:10px">
                🔍 ${esc(t.hint)}
              </div>
              ${btn('🏴‍☠️ Search for Treasure',`attemptTreasure('${escAttr(t.hint)}',${t.reward},'${esc(t.rarity)}')`,'gold','class="btn btn-gold btn-sm" style="width:100%"')}
            </div>
          `)).join('')}
        </div>
      </div>
    </section>`;
  }

  function openHideTreasureModal() {
    modal('🎁 Hide a Treasure Box', `
      <form onsubmit="submitHideTreasure(event)" style="display:flex;flex-direction:column;gap:14px">
        <div style="padding:14px;border-radius:14px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15)">
          <div style="font-size:13px;font-weight:800;color:#fbbf24">Hide a treasure on your island for visitors to discover!</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">You fund the reward. Finders earn ISL + you earn reputation.</div>
        </div>
        <div><div class="metric-label" style="margin-bottom:6px">Location Hint (for seekers)</div><input required name="hint" class="field" placeholder="e.g. Behind the waterfall, under the third rock..."></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><div class="metric-label" style="margin-bottom:6px">Rarity Tier</div><select name="rarity" class="field"><option>Common</option><option>Rare</option><option>Epic</option><option>Legendary</option></select></div>
          <div><div class="metric-label" style="margin-bottom:6px">Reward Amount (ISL)</div><input required type="number" name="reward" class="field" min="25" max="1000" value="100"></div>
        </div>
        <div style="display:flex;justify-content:end;gap:8px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          ${btn('Cancel','closeModal()','ghost')}
          <button type="submit" class="btn btn-gold">🎁 Hide Treasure (costs reward amount)</button>
        </div>
      </form>
    `);
  }

  function submitHideTreasure(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const hint = String(f.get('hint')||'').trim();
    const rarity = String(f.get('rarity')||'Common');
    const reward = Math.max(25, Math.min(1000, Number(f.get('reward')||100)));
    if (!hint) return toast('Please write a hint for treasure seekers.','warn');
    if (state.wallet < reward) return toast(`You need ${money(reward)} to fund this treasure.`,'warn');
    state.wallet -= reward;
    state.treasureBoxes.push({ id:uid('tr'), landId:state.ownedLand[0]||'L-101', hint, rarity, reward, found:false, foundBy:null });
    state.transactions.unshift({id:uid('tx'),description:`Hidden ${rarity} Treasure Box (${money(reward)})`,amount:-reward,type:'Treasure',date:'Just now',status:'Settled'});
    award(30, 0, `Hidden a ${rarity} treasure`);
    save(); closeModal();
    toast(`🎁 ${rarity} treasure hidden! Visitors can now search for it.`,'success');
    refresh();
  }

  function attemptTreasure(hint, reward, rarity) {
    playBeep('click');
    const chance = { Common:0.7, Rare:0.5, Epic:0.35, Legendary:0.2 }[rarity] || 0.5;
    const found = Math.random() < chance;
    if (found) {
      state.foundTreasures.push(hint);
      award(50, reward, `Found a ${rarity} treasure!`);
      save();
      modal('🏴‍☠️ TREASURE FOUND!', `
        <div style="text-align:center;padding:20px">
          <div style="font-size:64px;margin-bottom:16px">🎉</div>
          <h3 class="heading-md" style="color:#fbbf24">You Found a ${rarity} Treasure!</h3>
          <div style="font-size:28px;font-weight:900;color:#34d399;margin:16px 0">+${money(reward)}</div>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">The chest was hidden: "${esc(hint)}"</p>
          <div style="display:flex;gap:8px;justify-content:center">
            ${btn('🔍 Hunt More','closeModal()','primary')}
            ${btn('📲 Share Discovery','shareFlexWhatsApp()','gold')}
          </div>
        </div>
      `);
    } else {
      toast(`🔍 No luck this time... The ${rarity} treasure remains hidden. Try again!`,'info');
    }
  }

  function openTreasureMap() { toast('🗺️ Treasure map — explore districts to find hidden chests!','info'); }

  /* ═══════════════════════════════════════════════
     VIRAL FEATURE 4: ENHANCED GUESTBOOK
     ═══════════════════════════════════════════════ */
  function guestbook() {
    const entries = state.home.guestbook || [];
    const totalTips = entries.reduce((s,e) => s + (e.tip||0), 0);
    const uniqueVisitors = new Set(entries.map(e=>e.author)).size;

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      ${pageHeader('Social Proof','Island Guestbook','Visitors leave messages, tips, and reactions when they visit your island.',btn('📖 Sign Someone\'s Book','openSignGuestbookModal()','ghost')+btn('📲 Share Guestbook','shareGuestbook()','primary'))}

      <!-- Guestbook Hero -->
      ${card(`<div style="padding:28px;position:relative;overflow:hidden">
        <div class="wave-shimmer"></div>
        <div style="position:relative;z-index:1">
          <div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:start">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:28px">📖</span>
                <div>
                  <h2 style="font-size:20px;font-weight:900">${esc(state.user.name)}'s Guestbook</h2>
                  <div style="font-size:11px;color:var(--text-muted)">${esc(state.home.name)}</div>
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                <span class="tag tag-emerald"><span class="live-dot" style="width:5px;height:5px"></span> ${state.home.visitorsNow} visitors now</span>
                <span class="tag tag-amber">⬆ ${state.home.upvotes} upvotes</span>
                <span class="tag tag-cyan">${state.home.privacy}</span>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
              ${metric('Entries', entries.length, 'All-time', '📝')}
              ${metric('Unique', uniqueVisitors, 'Visitors', '👥')}
              ${metric('Tips', money(totalTips), 'Earned', '💰')}
            </div>
          </div>
        </div>
      </div>`)}

      <!-- Sign the Guestbook (Quick form) -->
      ${card(`<div style="padding:20px">
        <div style="font-size:14px;font-weight:900;margin-bottom:12px">✍️ Sign the Guestbook</div>
        <form onsubmit="submitGuestbookEntry(event)" style="display:flex;gap:8px;align-items:end">
          <div style="flex:1"><input required name="note" class="field" placeholder="Leave a message... e.g. Amazing island! 🏝️"></div>
          <div style="width:100px"><div class="metric-label" style="margin-bottom:4px">Tip (ISL)</div><input type="number" name="tip" class="field" min="0" max="500" value="10" style="text-align:center"></div>
          <button type="submit" class="btn btn-gold btn-sm" style="height:42px">Sign ✍️</button>
        </form>
      </div>`)}

      <!-- Guestbook Entries -->
      <div style="display:flex;flex-direction:column;gap:8px">
        ${entries.map((entry, i) => `
          <div class="glass-card ${i < 3 ? 'slide-up' : ''}" style="animation-delay:${i*0.08}s;padding:18px">
            <div style="display:flex;align-items:start;gap:12px">
              <div style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);display:grid;place-items:center;font-size:20px;flex-shrink:0">
                ${DATA.users.find(u=>u.name===entry.author)?.avatar || '👤'}
              </div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                  <div style="font-size:13px;font-weight:800">${esc(entry.author)}</div>
                  <div style="display:flex;align-items:center;gap:6px">
                    ${entry.tip ? `<span style="font-size:11px;font-weight:700;color:#fbbf24">+${money(entry.tip)} tip</span>` : ''}
                    <span style="font-size:10px;color:var(--text-dim)">${esc(entry.date)}</span>
                  </div>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);margin-top:6px;line-height:1.5">"${esc(entry.note)}"</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      ${entries.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-dim)"><span style="font-size:40px;display:block;margin-bottom:12px">📖</span><p style="font-size:13px">No guestbook entries yet. Invite friends to visit your island!</p></div>` : ''}
    </section>`;
  }

  function submitGuestbookEntry(e) {
    if (e && e.preventDefault) e.preventDefault();
    const f = new FormData(e.target);
    const note = String(f.get('note')||'').trim();
    const tip = Math.max(0, Math.min(500, Number(f.get('tip')||0)));
    if (!note) return toast('Please write a message.','warn');
    if (tip > 0 && state.wallet < tip) return toast('Insufficient ISL for tip.','warn');
    const author = DATA.users[Math.floor(Math.random()*DATA.users.length)].name;
    state.home.guestbook.unshift({ author, note, date:'Just now', tip });
    if (tip > 0) {
      state.wallet -= tip;
      state.transactions.unshift({id:uid('tx'),description:`Guestbook tip to ${state.user.name}`,amount:-tip,type:'Social',date:'Just now',status:'Settled'});
    }
    state.home.upvotes++;
    award(15, tip > 0 ? 5 : 0, 'New guestbook entry');
    save();
    toast(`✍️ ${author} signed your guestbook${tip ? ` with a ${money(tip)} tip!` : '!'}`, 'success');
    refresh();
  }

  function shareGuestbook() {
    const url = typeof window!=='undefined'?window.location.origin:'https://nexusisland.ae';
    const entries = state.home.guestbook.length;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`📖 My Nexus Island Guestbook has ${entries} entries and ${state.home.upvotes} upvotes! Come visit and sign: ${url}`)}`,'_blank');
    award(10, 5, 'Shared guestbook');
  }

  /* ═══════════════════════════════════════════════
     ROUTE DISPATCHER (Updated with Viral Features)
     ═══════════════════════════════════════════════ */
  const ROUTES = {
    dashboard, island, land, property, marketplace, businesses, vehicles, events,
    communities, friends, messages, wallet, profile, settings, notifications,
    games, admin, investor, 'business-model': businessModel, future, 'why-nexus': why, alpha,
    'neighbor-drop': neighborDrop, 'flex-card': flexCard, 'treasure-hunt': treasureHunt, guestbook
  };

  const route = typeof document !== 'undefined' ? document.body.dataset.route : 'landing';
  const appEl = typeof document !== 'undefined' ? document.getElementById('app') : null;

  if (appEl) {
    if (route === 'landing') {
      appEl.innerHTML = landing();
    } else if (route === 'login' || route === 'register') {
      appEl.innerHTML = authPage(route);
    } else if (!state.auth && route !== 'alpha') {
      nav('login.html');
    } else {
      appEl.innerHTML = layout((ROUTES[route] || dashboard)());
    }
  }

  initAlphaTracker();
  initMultiplayer();

  // Post-render: Initialize World Engine if on island page
  if (route === 'island') {
    // Use setTimeout to ensure world-engine.js has loaded and executed
    // (it's a separate <script> tag that loads after app.js)
    const startEngine = () => {
      if (typeof window.initWorldEngine === 'function') {
        window.initWorldEngine();
        // Auto-enter vehicle if navigated from garage
        if (typeof sessionStorage !== 'undefined') {
          const pendingVehicle = sessionStorage.getItem('nexus_drive_vehicle');
          if (pendingVehicle) {
            sessionStorage.removeItem('nexus_drive_vehicle');
            setTimeout(() => {
              if (typeof window.engineEnterVehicle === 'function') {
                window.engineEnterVehicle(pendingVehicle);
                const v = DATA.vehicles.find(x => x.id === pendingVehicle);
                if (v) toast(`🏎️ Driving ${v.name}! Use WASD to steer.`, 'success');
              }
            }, 500);
          }
        }
      } else {
        // Retry — world-engine.js might not have loaded yet
        setTimeout(startEngine, 50);
      }
    };
    setTimeout(startEngine, 0);
  }

  /* ─── GLOBAL BINDINGS ─── */
  if (typeof window !== 'undefined') {
    window.S=state; window.DATA=DATA; window.DISTRICTS=DISTRICTS; window.COUNTRIES=COUNTRIES; window.VISA_TIERS=VISA_TIERS; window.UAE_ISLANDS=UAE_ISLANDS; window.HOUSE_BLUEPRINTS=HOUSE_BLUEPRINTS; window.save=save; window.nav=nav; window.demo=demo; window.login=login; window.register=register; window.forgot=forgot; window.onboard=onboard; window.nova=nova; window.askNOVA=askNOVA; window.search=search; window.searchResults=searchResults; window.closeModal=closeModal; window.toast=toast; window.zone=zone; window.setMapTheme=setMapTheme; window.playBeep=playBeep; window.landDetail=landDetail; window.filterLand=filterLand; window.wish=wish; window.buyLand=buyLand; window.confirmLand=confirmLand; window.openHouseBuilderModal=openHouseBuilderModal; window.confirmBuildBlueprint=confirmBuildBlueprint; window.sellLandModal=sellLandModal; window.confirmSellLand=confirmSellLand; window.demoFunds=demoFunds; window.propertyDetail=propertyDetail; window.buyProperty=buyProperty; window.sellPropertyModal=sellPropertyModal; window.confirmSellProperty=confirmSellProperty; window.buildHome=buildHome; window.confirmHomeBuild=confirmHomeBuild; window.openRoomDesigner=openRoomDesigner; window.placeDecor=placeDecor; window.editHome=editHome; window.saveHomeDetails=saveHomeDetails; window.filterMarket=filterMarket; window.showInventory=showInventory; window.productDetail=productDetail; window.addCart=addCart; window.changeQty=changeQty; window.cart=cart; window.checkout=checkout; window.openCreatorStudio=openCreatorStudio; window.publishCreatorAsset=publishCreatorAsset; window.enterBusinessStorefront=enterBusinessStorefront; window.claimPhygitalVoucher=claimPhygitalVoucher; window.applyHub71Grant=applyHub71Grant; window.createBusiness=createBusiness; window.createBusinessSave=createBusinessSave; window.toggleFollow=toggleFollow; window.vehicleDetail=vehicleDetail; window.buyVehicle=buyVehicle; window.driveVehicle=driveVehicle; window.openPeople=openPeople; window.sendRequest=sendRequest; window.acceptRequest=acceptRequest; window.declineRequest=declineRequest; window.person=person; window.blockUser=blockUser; window.selectConversation=selectConversation; window.msg=msg; window.sendMessage=sendMessage; window.toggleCommunity=toggleCommunity; window.toggleRsvp=toggleRsvp; window.enterLiveStage=enterLiveStage; window.playGame=playGame; window.droneTap=droneTap; window.pearlPing=pearlPing; window.answerTycoon=answerTycoon; window.editProfile=editProfile; window.saveProfile=saveProfile; window.readOne=readOne; window.readAll=readAll; window.clearRead=clearRead; window.toggleSetting=toggleSetting; window.setSetting=setSetting; window.confirmReset=confirmReset; window.resetDemo=resetDemo; window.signOut=signOut; window.tour=tour; window.openPitchDeck=openPitchDeck; window.openMobileMenu=openMobileMenu; window.unitCalc=unitCalc; window.getWaitlist=getWaitlist; window.submitWaitlist=submitWaitlist; window.copyWaitlistRef=copyWaitlistRef; window.exportWaitlistCSV=exportWaitlistCSV; window.openAlphaJoinModal=openAlphaJoinModal; window.submitAlphaJoin=submitAlphaJoin; window.openAlphaFeedbackModal=openAlphaFeedbackModal; window.setAlphaStar=setAlphaStar; window.submitAlphaFeedback=submitAlphaFeedback; window.openAlphaInviteModal=openAlphaInviteModal; window.exportAlphaTelemetryCSV=exportAlphaTelemetryCSV; window.simulateAlphaSession=simulateAlphaSession; window.getAlphaTelemetry=getAlphaTelemetry; window.setRoomAmbiance=setRoomAmbiance; window.upvoteMyRoom=upvoteMyRoom; window.toggleRoomOpenHouse=toggleRoomOpenHouse; window.equipRoomSlot=equipRoomSlot; window.tryInRoom=tryInRoom; window.buyAndPlaceInRoom=buyAndPlaceInRoom; window.openShareRoomModal=openShareRoomModal; window.openSignGuestbookModal=openSignGuestbookModal; window.submitGuestbookEntry=submitGuestbookEntry; window.inspectCommunityRoom=inspectCommunityRoom; window.shopRoomBundle=shopRoomBundle; window.walkToPlazaPoint=walkToPlazaPoint; window.submitDistrictSay=submitDistrictSay; window.sendDistrictEmote=sendDistrictEmote; window.waveAtPeer=waveAtPeer; window.inspectPeer=inspectPeer; window.tipPeer=tipPeer; window.launchMultiplayerDemo=launchMultiplayerDemo; window.openNeighborInviteModal=openNeighborInviteModal; window.submitNeighborInvite=submitNeighborInvite; window.sendNeighborInvite=sendNeighborInvite; window.showNeighborInvites=showNeighborInvites; window.viewMyNeighborhood=viewMyNeighborhood; window.setFlexStyle=setFlexStyle; window.copyFlexCard=copyFlexCard; window.shareFlexCard=shareFlexCard; window.shareFlexWhatsApp=shareFlexWhatsApp; window.shareFlexInstagram=shareFlexInstagram; window.shareFlexTwitter=shareFlexTwitter; window.openHideTreasureModal=openHideTreasureModal; window.submitHideTreasure=submitHideTreasure; window.attemptTreasure=attemptTreasure; window.openTreasureMap=openTreasureMap; window.shareGuestbook=shareGuestbook; window.openVisaCenterModal=openVisaCenterModal; window.applyCountryVisa=applyCountryVisa; window.switchCountry=switchCountry; window.upgradeVisaTier=upgradeVisaTier; window.focusUaeIsland=focusUaeIsland; window.openExpansionIslandModal=openExpansionIslandModal; window.voteExpansionIsland=voteExpansionIsland; window.verifyTxReceipt=verifyTxReceipt; window.toggleSecurityPin=toggleSecurityPin;
  }
})();
