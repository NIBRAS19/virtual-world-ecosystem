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
      } else if (type === 'engine') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'drift') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
        osc.start(now); osc.stop(now + 0.18);
      } else if (type === 'nitro') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === 'horn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'cash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.24);
        osc.start(now); osc.stop(now + 0.24);
      }
    } catch {}
  }

  /* ═══════════════════════════════════════════════
     DATA MODELS
     ═══════════════════════════════════════════════ */
  const DISTRICTS = [
    { id:'harbor', name:'Harbor District', icon:'⚓', tagline:'Waterfront Marina Hub', description:'The primary arrival port inspired by Abu Dhabi Corniche & Marina. Cafes, luxury yachts, event plazas and social discovery.', color:'#0891b2', gradient:'from-cyan-500 to-blue-600', landmark:'Marina Grand Promenade', mapX:22, mapY:30 },
    { id:'creator', name:'Creator District', icon:'🎨', tagline:'Cultural & Atelier Zone', description:'Ateliers, NFT galleries, sound studios and VR stages inspired by the Saadiyat Cultural District.', color:'#ea580c', gradient:'from-rose-500 to-amber-500', landmark:'Louvre-style Crystal Pavilion', mapX:68, mapY:24 },
    { id:'gaming', name:'Gaming District', icon:'🎮', tagline:'Interactive Arena Hub', description:'High-octane esports stadiums, racetracks and neon arcades inspired by Yas Island entertainment.', color:'#7c3aed', gradient:'from-indigo-600 to-purple-600', landmark:'Yas Cyber Arena', mapX:32, mapY:65 },
    { id:'downtown', name:'Downtown', icon:'🏢', tagline:'Financial & Tech Core', description:'ADGM & Al Maryah inspired corporate spires, virtual banks, enterprise hubs and premier retail towers.', color:'#0ea5e9', gradient:'from-slate-800 to-cyan-900', landmark:'ADGM Apex Tower', mapX:72, mapY:56 },
    { id:'residential', name:'Residential District', icon:'🏡', tagline:'Waterfront Living', description:'Coastal villas, palm gardens, private residences and social majlis spaces inspired by Nurai Island.', color:'#059669', gradient:'from-emerald-600 to-teal-700', landmark:'Palm Sanctuary Lagoon', mapX:50, mapY:78 },
    { id:'nature', name:'Nature Zone', icon:'🌿', tagline:'Mangrove Reserve', description:'Eco-tourism paths, coastal mangrove boardwalks, desert safari camps and serene meditation spaces.', color:'#16a34a', gradient:'from-green-600 to-emerald-800', landmark:'Eastern Mangrove Sanctuary', mapX:16, mapY:72 },
    { id:'future', name:'Future Zone', icon:'∞', tagline:'AI & Quantum Port', description:'Masdar-inspired clean tech, NOVA AI Supercomputing Spire, quantum labs and VR/AR spatial portals.', color:'#6366f1', gradient:'from-sky-500 to-indigo-800', landmark:'NOVA Quantum Spire', mapX:80, mapY:80 }
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
      'Harbor & Co. Roastery','Yas Cyber Forge','Nexus AI Labs','Canvas House Saadiyat','Emirates Gourmet Food','ADGM Founders Circle','Oceanic Yacht Charters','Motion Works VFX','Arena Esports League','Green Oasis Eco-Tech'
    ].map((name,i) => ({
      id:`b${i+1}`, name,
      type:['Artisan Cafe','Game Studio','AI & Tech','Art Gallery','Fine Dining','Advisory & Law','Tourism & Charters','Digital VFX','Esports Org','Sustainability'][i],
      district:['Harbor District','Gaming District','Downtown','Creator District','Harbor District','Downtown','Nature Zone','Creator District','Gaming District','Nature Zone'][i],
      owner: USER_NAMES[i], icon:['☕','🎮','🧪','🎨','🍽️','🏛️','🌊','✨','🏆','🌱'][i],
      followers:140+i*95, rating:4.8 + (i%3)*0.1, dailyRevenue:120+i*45,
      description:['Premier artisanal coffee and tea majlis with harbor views.','Top esports tournament operator and custom experience builder.','Pioneering intelligent agent workflows and spatial AI infrastructure.','Contemporary digital gallery showcasing regional & global digital artists.','Virtual franchise serving gourmet Emirati and international cuisine.','Corporate structuring, venture connections and ecosystem networking.','Exclusive yacht excursions and offshore virtual diving adventures.','High-end 3D avatars, apparel modeling and spatial branding.','Weekly prize-pool competitive gaming tournaments across the island.','Clean-tech digital twins and biodiversity preservation simulations.'][i]
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
      {id:'tx-01',description:'Initial Island Citizenship Grant',amount:1000,type:'Grant',date:'Today',status:'Settled'},
      {id:'tx-02',description:'Falcon Explorer Golden Badge',amount:-25,type:'Purchase',date:'Today',status:'Settled'},
      {id:'tx-03',description:'Exploration Quest Reward — Harbor',amount:80,type:'Reward',date:'Today',status:'Settled'},
      {id:'tx-04',description:'Arabian Gulf Pearl Lamp',amount:-40,type:'Marketplace',date:'Yesterday',status:'Settled'},
      {id:'tx-05',description:'Daily Login & Presence Stipend',amount:50,type:'Reward',date:'Yesterday',status:'Settled'},
      {id:'tx-06',description:'Yas Speed Challenge Runner-Up',amount:120,type:'Gaming',date:'2d ago',status:'Settled'},
      {id:'tx-07',description:'Creator Royalties — Asset Licensing',amount:75,type:'Earning',date:'3d ago',status:'Settled'},
      {id:'tx-08',description:'Community Hub Membership Fee',amount:-15,type:'Social',date:'3d ago',status:'Settled'},
      {id:'tx-09',description:'NOVA Assistant Strategy Consultation',amount:0,type:'System',date:'4d ago',status:'Settled'}
    ];
  }

  /* ─── STATE MANAGEMENT ─── */
  function defaultState() {
    return {
      schema: 6,
      auth: false,
      onboardingComplete: false,
      user: {
        id: 'demo-user', name: 'Alex Morgan', username: 'alex',
        email: 'alex.morgan@nexusisland.ae', country: 'United Arab Emirates',
        avatar: '🧑‍💻', title: 'Founding Island Architect',
        bio: 'Explorer, venture builder and digital resident of Nexus Island. Focused on AI spatial ecosystems & MENA innovation.',
        level: 4, xp: 840, reputation: 88,
        interests: ['Spatial AI','ADGM Startups','Esports','Architecture'],
        goal: 'Build an Enterprise'
      },
      wallet: 1450, wishlist: [], cart: [],
      inventory: ['m5','m2','m7','m9','m11','m13'],
      equipped: { fashion: null, badge: 'm5', vehicle: null },
      ownedLand: [], ownedProperties: [], ownedVehicles: ['v1'],
      activeVehicle: 'v1', streetCred: 3, worldLayer: 'satellite', worldMode: 'map',
      home: {
        built: true, name: 'Alex\'s Coastal Atelier & Majlis',
        landId: 'Suite #104 (Pioneer District)', style: 'UAE Luxury Coastal',
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
      following: ['b1','b3','b6'], joined: ['c1','c2','c5'], rsvp: ['e1','e2','e4'],
      events: {}, communities: {},
      messages: seedMessages(), selectedConversation: 'u1',
      notifications: seedNotifications(), transactions: seedTransactions(),
      gameStats: { drone: { plays: 2, best: 940 }, pearl: { plays: 3, best: 7 }, tycoon: { plays: 1, best: 3 } },
      activity: [
        {id:uid('act'),text:'Claimed UAE Pioneer Island Citizen pass',time:'Today'},
        {id:uid('act'),text:'Traveled to Harbor District & Marina Promenade',time:'Today'},
        {id:uid('act'),text:'Equipped Falcon Explorer Golden Badge',time:'Today'},
        {id:uid('act'),text:'Connected with Maya Chen (Spatial Creator)',time:'Yesterday'}
      ],
      createdBusinesses: [], customCreatedProducts: [],
      settings: {
        publicProfile: true, notifications: true, emailUpdates: false,
        reducedMotion: false, audio: true, graphics: 'High (Spatial 60FPS)',
        chatPrivacy: 'Everyone', mapTheme: 'day'
      },
      districtsVisited: ['harbor','creator','downtown'],
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
      passportStamps: ['harbor','creator']
    };
  }

  function loadState() {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return defaultState();
    try {
      const p = JSON.parse(raw);
      const base = defaultState();
      const merged = { ...base, ...p, user:{...base.user, ...(p.user||{})}, settings:{...base.settings, ...(p.settings||{})}, gameStats:{...base.gameStats, ...(p.gameStats||{})}, home:{...base.home, ...(p.home||{})} };
      if (!Array.isArray(merged.inventory)) merged.inventory = base.inventory;
      if (!merged.equipped) merged.equipped = base.equipped;
      if (!Array.isArray(merged.districtsVisited)) merged.districtsVisited = ['harbor'];
      if (!Array.isArray(merged.neighborInvites)) merged.neighborInvites = [];
      if (!Array.isArray(merged.treasureBoxes)) merged.treasureBoxes = base.treasureBoxes;
      if (!Array.isArray(merged.foundTreasures)) merged.foundTreasures = [];
      if (!Array.isArray(merged.passportStamps)) merged.passportStamps = ['harbor'];
      if (!merged.home.slots) merged.home.slots = { ...base.home.slots };
      if (!Array.isArray(merged.home.guestbook)) merged.home.guestbook = [ ...base.home.guestbook ];
      if (!merged.home.ambiance) merged.home.ambiance = 'sunset';
      if (merged.home.upvotes === undefined) merged.home.upvotes = 42;
      if (merged.home.visitorsNow === undefined) merged.home.visitorsNow = 3;
      if (!merged.currentDistrict) merged.currentDistrict = 'harbor';
      if (!merged.avatarPosition) merged.avatarPosition = { x: 48, y: 64 };
      if (!merged.streetCred) merged.streetCred = 3;
      if (!merged.worldLayer) merged.worldLayer = 'satellite';
      if (!merged.worldMode) merged.worldMode = 'map';
      if (!merged.activeVehicle) merged.activeVehicle = 'v1';
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
      success: 'background:linear-gradient(135deg,rgba(16,185,129,0.9),rgba(5,150,105,0.9));color:#fff;box-shadow:0 8px 32px -4px rgba(16,185,129,0.4);',
      warn: 'background:linear-gradient(135deg,rgba(245,158,11,0.9),rgba(217,119,6,0.9));color:#1c1917;box-shadow:0 8px 32px -4px rgba(245,158,11,0.4);',
      danger: 'background:linear-gradient(135deg,rgba(244,63,94,0.9),rgba(225,29,72,0.9));color:#fff;box-shadow:0 8px 32px -4px rgba(244,63,94,0.4);',
      info: 'background:rgba(8,20,50,0.92);color:#22d3ee;border:1px solid rgba(6,182,212,0.3);box-shadow:0 8px 32px -4px rgba(6,182,212,0.2);'
    };
    root.innerHTML = `<div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:200;max-width:90vw;padding:14px 24px;border-radius:16px;backdrop-filter:blur(16px);font-size:14px;font-weight:700;display:flex;align-items:center;gap:10px;${colors[type]||colors.info}" class="pop"><span style="width:8px;height:8px;border-radius:50%;background:currentColor;opacity:0.6"></span>${esc(text)}</div>`;
    clearTimeout(root._timer);
    root._timer = setTimeout(() => { if (root) root.innerHTML = ''; }, 3000);
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
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="metric-label">${label}</div>
          <div class="metric-value">${value}</div>
          <div class="metric-note">${note}</div>
        </div>
        <div style="width:40px;height:40px;border-radius:12px;background:rgba(6,182,212,0.08);display:grid;place-items:center;font-size:1.25rem;flex-shrink:0">${ic}</div>
      </div>
    </div>`;
  }

  function modal(title, body) {
    playBeep('click');
    if (typeof document === 'undefined') return;
    const host = document.getElementById('modal');
    if (!host) return;
    host.innerHTML = `<div style="position:fixed;inset:0;z-index:120;background:rgba(2,10,24,0.75);backdrop-filter:blur(12px);padding:16px;display:grid;place-items:center" onclick="if(event.target===this)closeModal()">
      <div class="glass-elevated pop" style="width:100%;max-width:640px;max-height:92vh;overflow-y:auto;border-radius:1.75rem;padding:28px">
        <div style="display:flex;align-items:start;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:16px;margin-bottom:20px">
          <div>
            <div class="tag tag-cyan" style="margin-bottom:8px"><span class="live-dot" style="width:6px;height:6px"></span>NEXUS ISLAND · UAE</div>
            <h3 class="heading-md">${title}</h3>
          </div>
          <button type="button" onclick="closeModal()" style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:var(--text-muted);display:grid;place-items:center;cursor:pointer;font-size:14px;font-weight:700;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">✕</button>
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
      <ellipse cx="430" cy="400" rx="40" ry="20" fill="rgba(6,182,212,0.2)" stroke="rgba(6,182,212,0.15)" stroke-width="1.5"/>
    </svg>`;
  }

  /* ═══════════════════════════════════════════════
     NAVIGATION & LAYOUT
     ═══════════════════════════════════════════════ */
  function navItem(label, file, ic) {
    const on = typeof location !== 'undefined' && location.pathname.endsWith(file);
    return `<a href="${file}" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;font-size:13px;font-weight:700;transition:all 0.2s;${on ? 'background:rgba(6,182,212,0.12);color:#22d3ee;border:1px solid rgba(6,182,212,0.2)' : 'color:var(--text-secondary);border:1px solid transparent'}" onmouseover="if(!${on})this.style.background='rgba(255,255,255,0.04)'" onmouseout="if(!${on})this.style.background='transparent'"><span style="font-size:15px">${ic}</span><span>${label}</span></a>`;
  }

  function layout(content) {
    const unread = state.notifications.filter(n => !n.read).length;
    const currPath = typeof location !== 'undefined' ? location.pathname : '';
    const isTab = f => currPath.endsWith(f);

    return `<div style="min-height:100vh;position:relative">
      <!-- TOP NAV BAR -->
      <header class="glass" style="position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(255,255,255,0.04)">
        <div class="container-wide" style="height:var(--nav-height);display:flex;align-items:center;justify-content:space-between;gap:12px">
          <!-- Logo -->
          <a href="dashboard.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0">
            <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#6366f1);display:grid;place-items:center;font-weight:900;color:#fff;font-size:16px;box-shadow:0 4px 12px -2px rgba(6,182,212,0.35)">N</div>
            <div>
              <div style="font-size:15px;font-weight:900;color:var(--text-primary);letter-spacing:-0.02em;line-height:1.1">Nexus Island</div>
              <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:rgba(6,182,212,0.7)">Abu Dhabi · UAE</div>
            </div>
          </a>

          <!-- Center Nav -->
          <nav style="display:none" class="lg-show">
            <div style="display:flex;align-items:center;gap:2px;padding:4px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04)">
              ${[['Home','dashboard.html','⌂'],['World','island.html','🌐'],['Market','marketplace.html','▦'],['Land','land.html','🏝️'],['Social','friends.html','👥'],['Games','games.html','🎮'],['Events','events.html','◷']].map(([l,f,i]) => {
                const active = isTab(f);
                return `<a href="${f}" style="display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700;text-decoration:none;transition:all 0.2s;${active?'background:rgba(6,182,212,0.12);color:#22d3ee':'color:var(--text-muted)'}" onmouseover="if(!${active})this.style.color='var(--text-primary)'" onmouseout="if(!${active})this.style.color='var(--text-muted)'">${i} ${l}</a>`;
              }).join('')}
            </div>
          </nav>

          <!-- Right Actions -->
          <div style="display:flex;align-items:center;gap:8px">
            <button onclick="search()" style="display:none;padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);color:var(--text-muted);font-size:12px;font-weight:700;cursor:pointer;align-items:center;gap:6px" class="md-show-flex">⌕ Search</button>
            <a href="wallet.html" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);font-size:12px;font-weight:800;color:var(--text-primary);text-decoration:none;transition:all 0.2s" onmouseover="this.style.borderColor='rgba(6,182,212,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
              <span style="color:#06b6d4">◈</span>${money(state.wallet)}
            </a>
            <a href="notifications.html" style="position:relative;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:grid;place-items:center;font-size:15px;text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              🔔${unread ? `<span style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#f43f5e;color:#fff;font-size:9px;font-weight:900;display:grid;place-items:center;border:2px solid var(--ocean-deep)">${unread > 9 ? '9+' : unread}</span>` : ''}
            </a>
            <button onclick="nova()" class="btn btn-primary btn-sm" style="padding:6px 14px">✨ <span class="sm-show">NOVA</span></button>
            <button onclick="openMobileMenu()" class="xl-hide" style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);color:var(--text-primary);display:grid;place-items:center;cursor:pointer;font-size:16px;font-weight:700">☰</button>
            <a href="profile.html" class="sm-show" style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:grid;place-items:center;font-size:18px;text-decoration:none">${state.user.avatar}</a>
          </div>
        </div>
      </header>

      <!-- MAIN LAYOUT -->
      <div class="container-wide" style="display:flex;gap:24px">
        <!-- SIDEBAR -->
        <aside class="xl-show" style="width:220px;flex-shrink:0;padding:24px 0">
          <div style="position:sticky;top:88px;display:flex;flex-direction:column;gap:24px">
            <div>
              <div class="metric-label" style="padding:0 12px;margin-bottom:8px">World & Assets</div>
              ${[['Island Map','island.html','🌐'],['Land Parcels','land.html','🏝️'],['Properties','property.html','🏠'],['Enterprises','businesses.html','🏢'],['Marketplace','marketplace.html','▦'],['Vehicles','vehicles.html','🏎️']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
                <span>Viral & Growth</span>
                <span class="badge badge-accent" style="font-size:9px;padding:1px 6px">HOT</span>
              </div>
              ${[['Neighbor Drop','neighbor-drop.html','🤝'],['Flex Card','flex-card.html','💳'],['Treasure Hunt','treasure-hunt.html','🏴‍☠️'],['Guestbook','guestbook.html','📖']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 12px;margin-bottom:8px">Social & Play</div>
              ${[['Friends','friends.html','👥'],['Messages','messages.html','💬'],['Communities','communities.html','◎'],['Events','events.html','◷'],['Games','games.html','🎮']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 12px;margin-bottom:8px">Identity</div>
              ${[['Wallet','wallet.html','◈'],['Profile','profile.html','◉'],['Notifications','notifications.html','🔔'],['Settings','settings.html','⚙']].map(x=>navItem(...x)).join('')}
            </div>
            <div>
              <div class="metric-label" style="padding:0 12px;margin-bottom:8px">Investor</div>
              ${[['Pitch Deck','investor.html','▶'],['Revenue Model','business-model.html','↗'],['Alpha Cohort','alpha.html','⚡'],['Why Nexus','why-nexus.html','✦'],['Roadmap','future.html','∞'],['Admin','admin.html','▤']].map(x=>navItem(...x)).join('')}
            </div>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main style="flex:1;min-width:0;padding:20px 0 120px">${content}</main>
      </div>

      <!-- MOBILE BOTTOM NAV -->
      <nav class="glass xl-hide" style="position:fixed;bottom:0;left:0;right:0;z-index:50;border-top:1px solid rgba(255,255,255,0.04);display:grid;grid-template-columns:repeat(5,1fr);padding:6px" class="safe-bottom">
        ${[
          ['dashboard.html','⌂','Home',isTab('dashboard.html')],
          ['island.html','🌐','World',isTab('island.html')],
          ['marketplace.html','▦','Market',isTab('marketplace.html')],
          ['messages.html','💬','Chat',isTab('messages.html')],
          ['javascript:openMobileMenu()','☰','Menu',false]
        ].map(([href,ic,label,active]) => `
          <a href="${href}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 4px;border-radius:10px;font-size:9px;font-weight:700;text-decoration:none;transition:all 0.2s;${active?'background:rgba(6,182,212,0.12);color:#22d3ee':'color:var(--text-muted)'}">
            <span style="font-size:16px;line-height:1">${ic}</span>
            <span style="margin-top:3px">${label}</span>
          </a>
        `).join('')}
      </nav>

      <!-- Alpha Feedback Pill -->
      <button onclick="openAlphaFeedbackModal()" style="position:fixed;bottom:80px;right:16px;z-index:40;padding:10px 16px;border-radius:16px;background:rgba(8,20,48,0.9);backdrop-filter:blur(12px);border:1px solid rgba(6,182,212,0.25);color:#22d3ee;font-size:12px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px -4px rgba(0,0,0,0.5);transition:all 0.2s" class="xl-bottom-fix" onmouseover="this.style.borderColor='rgba(6,182,212,0.5)'" onmouseout="this.style.borderColor='rgba(6,182,212,0.25)'">
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
        <div style="padding:16px;border-radius:16px;background:linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06));border:1px solid rgba(6,182,212,0.15);display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:28px">${state.user.avatar}</span>
            <div>
              <div style="font-weight:800;font-size:14px">${esc(state.user.name)}</div>
              <div style="font-size:11px;color:#22d3ee;font-weight:600">Level ${state.user.level} · ${money(state.wallet)}</div>
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
                <a href="${f}" onclick="closeModal()" style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--text-secondary);text-decoration:none;transition:all 0.2s" onmouseover="this.style.background='rgba(6,182,212,0.06)';this.style.color='#22d3ee'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='var(--text-secondary)'">${i} ${l}</a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `);
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
          ${[['Citizen Name',esc(entry.name),''],['District',esc(entry.district),'color:#22d3ee'],['Role',esc(entry.role),'color:#fbbf24'],['Issue Date',esc(entry.date),'']].map(([label,val,style]) => `
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
        <div style="padding:16px;border-radius:16px;background:linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06));border:1px solid rgba(6,182,212,0.15);display:flex;align-items:center;justify-content:space-between">
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
          <div style="width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,#06b6d4,#6366f1);display:grid;place-items:center;font-weight:900;color:#fff;font-size:18px;box-shadow:0 4px 16px -2px rgba(6,182,212,0.4)">N</div>
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
            ${[['7','Districts','#22d3ee'],['21','Land Parcels','#34d399'],['12','Revenue Streams','#fbbf24'],
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
        <div class="map-container map-ocean" style="border:1px solid rgba(6,182,212,0.15);position:relative">
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
            ['🌐','Spatial Permanence','Organized around real landmarks and waterfronts. When you return, your home and friends are exactly where you left them.','rgba(6,182,212,0.08)','rgba(6,182,212,0.15)'],
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
        <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:20px">${login ? `New? <a href="register.html" style="color:#22d3ee;font-weight:700">Register</a>` : `Existing? <a href="login.html" style="color:#22d3ee;font-weight:700">Sign In</a>`}</div>
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
        inner = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px">${['🧑‍💻','👩🏻‍🎨','🧑🏽‍🚀','👩🏾‍💼','🧑🏻‍🎮','👨🏽‍💻','👩🏻‍🎤','🧑🏽‍💼'].map(a=>`<button type="button" onclick="window.__selAvatar('${a}')" style="height:64px;border-radius:16px;background:${sel.avatar===a?'rgba(6,182,212,0.15)':'rgba(255,255,255,0.03)'};border:1px solid ${sel.avatar===a?'rgba(6,182,212,0.4)':'rgba(255,255,255,0.06)'};font-size:28px;display:grid;place-items:center;cursor:pointer;transition:all 0.2s">${a}</button>`).join('')}</div>`;
      } else if (step === 1) {
        inner = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">${['Spatial AI','Gaming & Esports','ADGM Startups','Architecture','Creative Arts','Tourism','Fintech','Eco-Tech'].map(it=>`<button type="button" onclick="window.__selInterest('${it}')" style="padding:12px;border-radius:12px;font-weight:700;font-size:13px;text-align:left;border:1px solid ${sel.interests.includes(it)?'rgba(6,182,212,0.4)':'rgba(255,255,255,0.06)'};background:${sel.interests.includes(it)?'rgba(6,182,212,0.12)':'rgba(255,255,255,0.03)'};color:${sel.interests.includes(it)?'#22d3ee':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s">${it}</button>`).join('')}</div>`;
      } else {
        inner = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">${['Live in Coastal Villa','Launch Enterprise','Compete in Esports','Create Digital Art','Network with Investors','Explore the Island'].map(g=>`<button type="button" onclick="window.__selGoal('${g}')" style="padding:12px;border-radius:12px;font-weight:700;font-size:13px;text-align:left;border:1px solid ${sel.goal===g?'rgba(6,182,212,0.4)':'rgba(255,255,255,0.06)'};background:${sel.goal===g?'rgba(6,182,212,0.12)':'rgba(255,255,255,0.03)'};color:${sel.goal===g?'#22d3ee':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s">${g}</button>`).join('')}</div>`;
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
    const next = state.ownedLand.length === 0
      ? ['Claim Your First Island Parcel', 'land.html', 'Own a permanent stake to unlock home construction.', '🏝️']
      : !state.home.built
      ? ['Build Your Residence', 'property.html', 'Construct your personal space and open your interior.', '🏠']
      : state.friends.length < 7
      ? ['Connect with Founders', 'friends.html', 'Expand your resident social graph.', '👥']
      : ['Play a Mini-Game', 'games.html', 'Compete in Yas Sprint or Pearl Sonar.', '🎮'];

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      <!-- Hero Welcome -->
      <div class="glass-card" style="padding:0;overflow:hidden;border-color:rgba(6,182,212,0.1)">
        <div style="position:relative;padding:36px 32px;background:linear-gradient(135deg,rgba(6,182,212,0.06) 0%,rgba(99,102,241,0.04) 50%,rgba(6,182,212,0.02) 100%)">
          <div class="wave-shimmer"></div>
          <div style="position:relative;z-index:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span class="live-dot"></span>
              <span class="metric-label">Abu Dhabi · UAE Digital Society</span>
            </div>
            <h1 class="heading-xl">Marhaba, ${esc(state.user.name.split(' ')[0])}.</h1>
            <p style="font-size:15px;color:var(--text-muted);margin-top:10px;max-width:520px;line-height:1.6">There is always somewhere to go, someone to meet, something to build, and something that belongs to you.</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:24px">
              ${btn('🌐 Island Map', "nav('island.html')", 'primary')}
              ${btn('✨ Ask NOVA', 'nova()', 'ghost')}
              ${btn('▶ Investor Tour', "nav('investor.html')", 'ghost')}
            </div>
          </div>
          <!-- Floating stats -->
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);position:relative;z-index:1">
            ${[['Citizenship',state.membership,''],['Home Status',state.home.built?'Active':'Unbuilt',state.home.built?'color:#34d399':''],['Treasury',money(state.wallet),'color:#22d3ee']].map(([l,v,s]) => `
              <div style="padding:12px 16px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);min-width:140px">
                <div class="metric-label">${l}</div>
                <div style="font-size:14px;font-weight:800;margin-top:4px;${s}">${v}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Identity Card + Quick Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${card(`<div style="padding:24px;display:flex;flex-direction:column;justify-content:space-between;height:100%">
          <div>
            <div style="display:flex;align-items:start;justify-content:space-between;gap:12px">
              <div>
                <div class="metric-label">Resident Identity</div>
                <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
                  <span style="font-size:28px">${state.user.avatar}</span>
                  <div>
                    <div style="font-size:18px;font-weight:900">${esc(state.user.name)}</div>
                    <div style="font-size:11px;color:var(--text-muted);font-weight:600">@${esc(state.user.username)} · ${esc(state.user.country)}</div>
                  </div>
                </div>
              </div>
              <span class="tag tag-cyan">Level ${state.user.level}</span>
            </div>
            <div style="margin-top:20px">
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:6px">
                <span>To Level ${state.user.level+1}</span><span style="color:#22d3ee">${state.user.xp}/${need} XP (${pct}%)</span>
              </div>
              <div style="height:6px;border-radius:9999px;background:rgba(255,255,255,0.06);overflow:hidden">
                <div style="width:${pct}%;height:100%;border-radius:9999px;background:linear-gradient(90deg,#06b6d4,#6366f1);transition:width 0.5s"></div>
              </div>
            </div>
          </div>
        </div>`)}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${metric('Treasury', money(state.wallet), aed(state.wallet), '◈')}
          ${metric('Connections', state.friends.length, 'Resident graph', '👥')}
          ${metric('Communities', state.joined.length, 'Memberships', '◎')}
          ${metric('Reputation', state.user.reputation, 'Trust score', '✦')}
        </div>
      </div>

      <!-- Recommended Action + Activity -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
        ${card(`<div style="padding:24px">
          <div class="metric-label">Recommended Next</div>
          <div style="display:flex;align-items:start;gap:14px;margin-top:12px">
            <div style="width:48px;height:48px;border-radius:14px;background:rgba(6,182,212,0.08);display:grid;place-items:center;font-size:24px;flex-shrink:0">${next[3]}</div>
            <div style="flex:1">
              <div style="font-size:16px;font-weight:900">${next[0]}</div>
              <p style="font-size:12px;color:var(--text-muted);margin-top:4px;line-height:1.5">${next[2]}</p>
              <div style="margin-top:12px">${btn('Complete →', `nav('${next[1]}')`, 'primary')}</div>
            </div>
          </div>
        </div>`)}

        ${card(`<div style="padding:24px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div class="metric-label">Activity Feed</div>
            ${btn('View All', "nav('notifications.html')", 'ghost', 'class="btn btn-ghost btn-sm"')}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${state.activity.slice(0,4).map(a => `
              <div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;align-items:center;font-size:12px">
                <span style="font-weight:600;color:var(--text-secondary)">${esc(a.text)}</span>
                <span style="font-size:10px;color:var(--text-dim);flex-shrink:0;margin-left:8px">${esc(a.time)}</span>
              </div>
            `).join('')}
          </div>
        </div>`)}
      </div>

      <!-- Ecosystem Quick Nav -->
      ${card(`<div style="padding:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div class="metric-label">Core Product Loop</div>
            <div style="font-size:16px;font-weight:900;margin-top:4px">Ecosystem Navigation</div>
          </div>
          <span class="tag tag-emerald">FULL WORKING MVP</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">
          ${[['1. Explore','island.html','🌐'],['2. Meet','friends.html','👥'],['3. Own','land.html','🏝️'],['4. Style','property.html','🏠'],['5. Play','games.html','🎮'],['6. Join','communities.html','◎'],['7. Trade','marketplace.html','▦'],['8. Attend','events.html','◷']].map(([l,f,i]) => `
            <a href="${f}" style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);text-align:center;text-decoration:none;transition:all 0.2s;display:block" onmouseover="this.style.background='rgba(6,182,212,0.06)';this.style.borderColor='rgba(6,182,212,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.02)';this.style.borderColor='rgba(255,255,255,0.05)'">
              <div style="font-size:24px;margin-bottom:6px">${i}</div>
              <div style="font-size:11px;font-weight:800;color:var(--text-primary)">${l}</div>
            </a>
          `).join('')}
        </div>
      </div>`)}

      <!-- Viral & Social Growth Loops -->
      ${card(`<div style="padding:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div class="metric-label" style="display:flex;align-items:center;gap:6px">
              <span class="live-dot" style="background:#f43f5e"></span> Viral Growth Mechanics
            </div>
            <div style="font-size:16px;font-weight:900;margin-top:4px">Social Loops & Viral Sharing</div>
          </div>
          <span class="badge badge-accent">HIGH K-FACTOR</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          ${[
            ['Neighbor Drop', 'neighbor-drop.html', '🤝', 'Invite friends to claim the land right next to yours', 'Invite Neighbors →', 'rgba(6,182,212,0.1)'],
            ['Island Flex Card', 'flex-card.html', '💳', 'Showcase net worth on Instagram & WhatsApp status', 'Generate Card →', 'rgba(245,158,11,0.1)'],
            ['Treasure Hunt', 'treasure-hunt.html', '🏴‍☠️', 'Hide & find reward chests scattered on islands', 'Go Hunting →', 'rgba(244,63,94,0.1)'],
            ['Island Guestbook', 'guestbook.html', '📖', 'Leave verified tips & comments on friends’ homes', 'Sign & Tip →', 'rgba(16,185,129,0.1)']
          ].map(([title, href, ic, desc, cta, bg]) => `
            <div style="padding:16px;border-radius:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;justify-content:space-between;gap:12px;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(6,182,212,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.02)';this.style.borderColor='rgba(255,255,255,0.05)'">
              <div>
                <div style="width:40px;height:40px;border-radius:12px;background:${bg};display:grid;place-items:center;font-size:20px;margin-bottom:10px">${ic}</div>
                <div style="font-size:14px;font-weight:800;color:var(--text-primary)">${title}</div>
                <p style="font-size:11px;color:var(--text-muted);margin-top:4px;line-height:1.4">${desc}</p>
              </div>
              <a href="${href}" class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;text-decoration:none">${cta}</a>
            </div>
          `).join('')}
        </div>
      </div>`)}
    </section>`;
  }

  /* ═══════════════════════════════════════════════════════════════
     WORLD & ASSETS: GOOGLE MAPS + GTA INTERACTIVE ENGINE
     ═══════════════════════════════════════════════════════════════ */
  const WORLD_DATA = {
    width: 2400,
    height: 1800,
    districts: {
      harbor: { id: 'harbor', name: 'Harbor District', icon: '⚓', x: 500, y: 520, radius: 260, color: '#0891b2', landmark: 'Marina Grand Promenade' },
      creator: { id: 'creator', name: 'Creator District', icon: '🎨', x: 1640, y: 440, radius: 280, color: '#ea580c', landmark: 'Louvre Crystal Pavilion' },
      gaming: { id: 'gaming', name: 'Gaming District', icon: '🎮', x: 740, y: 1180, radius: 290, color: '#7c3aed', landmark: 'Yas Cyber Arena & Circuit' },
      downtown: { id: 'downtown', name: 'Downtown Core', icon: '🏢', x: 1720, y: 1020, radius: 280, color: '#0ea5e9', landmark: 'ADGM Apex Tower & Core' },
      residential: { id: 'residential', name: 'Residential District', icon: '🏡', x: 1200, y: 1420, radius: 260, color: '#059669', landmark: 'Palm Sanctuary Lagoon' },
      nature: { id: 'nature', name: 'Nature Zone', icon: '🌿', x: 380, y: 1260, radius: 240, color: '#16a34a', landmark: 'Eastern Mangrove Reserve' },
      future: { id: 'future', name: 'Future Zone', icon: '∞', x: 1960, y: 1440, radius: 250, color: '#6366f1', landmark: 'NOVA Quantum Spire' }
    },
    roads: [
      { id: 'r1', name: 'Corniche Grand Blvd', from: [380, 520], to: [520, 520] },
      { id: 'r2', name: 'Corniche Grand Blvd', from: [520, 520], to: [840, 560] },
      { id: 'r3', name: 'Corniche Grand Blvd', from: [840, 560], to: [1150, 950] },
      { id: 'r4', name: 'Saadiyat Causeway', from: [840, 560], to: [1250, 480], bridge: true },
      { id: 'r5', name: 'Saadiyat Cultural Way', from: [1250, 480], to: [1640, 440] },
      { id: 'r6', name: 'ADGM Tech Spine', from: [1150, 950], to: [1720, 1020] },
      { id: 'r7', name: 'NOVA Quantum Way', from: [1720, 1020], to: [1960, 1440] },
      { id: 'r8', name: 'Palm Sanctuary Drive', from: [1150, 950], to: [1200, 1420] },
      { id: 'r9', name: 'Yas Coastal Highway', from: [1200, 1420], to: [740, 1180] },
      { id: 'r10', name: 'Marina Express Link', from: [520, 520], to: [740, 1180] },
      { id: 'r11', name: 'Mangrove Boardwalk', from: [740, 1180], to: [380, 1260] }
    ],
    yasCircuit: [
      { x: 620, y: 1080 }, { x: 860, y: 1080 }, { x: 920, y: 1180 },
      { x: 880, y: 1280 }, { x: 680, y: 1300 }, { x: 580, y: 1200 }
    ],
    plots: [
      { id: 'L-101', name: 'Marina Edge Plot', district: 'harbor', x: 440, y: 480, w: 70, h: 55, price: 450 },
      { id: 'L-102', name: 'Bluewater Promenade', district: 'harbor', x: 580, y: 470, w: 75, h: 60, price: 670 },
      { id: 'L-103', name: 'Corniche Gateway', district: 'harbor', x: 490, y: 590, w: 80, h: 65, price: 850 },
      { id: 'L-201', name: 'Saadiyat Studio Lane', district: 'creator', x: 1560, y: 400, w: 70, h: 60, price: 670 },
      { id: 'L-202', name: 'Louvre Vista Atelier', district: 'creator', x: 1710, y: 410, w: 80, h: 65, price: 890 },
      { id: 'L-203', name: 'Artisan Plaza Parcel', district: 'creator', x: 1640, y: 510, w: 85, h: 70, price: 1070 },
      { id: 'L-301', name: 'Yas Circuit West', district: 'gaming', x: 660, y: 1120, w: 75, h: 60, price: 890 },
      { id: 'L-302', name: 'Apex Arena Row', district: 'gaming', x: 810, y: 1140, w: 80, h: 65, price: 1110 },
      { id: 'L-303', name: 'Pixel Boulevard', district: 'gaming', x: 740, y: 1250, w: 85, h: 70, price: 1290 },
      { id: 'L-401', name: 'ADGM Global Square', district: 'downtown', x: 1650, y: 960, w: 75, h: 60, price: 1110 },
      { id: 'L-402', name: 'Al Maryah Center', district: 'downtown', x: 1790, y: 980, w: 80, h: 65, price: 1330 },
      { id: 'L-403', name: 'Fintech Tower Parcel', district: 'downtown', x: 1720, y: 1090, w: 85, h: 70, price: 1510 },
      { id: 'L-501', name: 'Palm Grove Haven', district: 'residential', x: 1140, y: 1360, w: 75, h: 60, price: 1330 },
      { id: 'L-502', name: 'Nurai Vista Villa', district: 'residential', x: 1260, y: 1380, w: 80, h: 65, price: 1550 },
      { id: 'L-503', name: 'Coastal Sanctuary', district: 'residential', x: 1200, y: 1490, w: 85, h: 70, price: 1730 },
      { id: 'L-601', name: 'Eastern Mangrove Point', district: 'nature', x: 330, y: 1220, w: 70, h: 60, price: 1550 },
      { id: 'L-602', name: 'Falcon Dune View', district: 'nature', x: 430, y: 1230, w: 75, h: 65, price: 1770 },
      { id: 'L-603', name: 'Flamingo Lagoon', district: 'nature', x: 380, y: 1330, w: 80, h: 70, price: 1950 },
      { id: 'L-701', name: 'Masdar Eco Hub', district: 'future', x: 1900, y: 1390, w: 75, h: 60, price: 1770 },
      { id: 'L-702', name: 'NOVA Quantum Axis', district: 'future', x: 2020, y: 1410, w: 80, h: 65, price: 1990 },
      { id: 'L-703', name: 'Spatial Portal West', district: 'future', x: 1960, y: 1510, w: 85, h: 70, price: 2170 }
    ],
    businesses: [
      { id: 'b1', name: 'Harbor & Co. Roastery', type: 'Artisan Cafe', icon: '☕', x: 570, y: 550, district: 'harbor' },
      { id: 'b2', name: 'Yas Cyber Forge', type: 'Game Studio', icon: '🎮', x: 710, y: 1130, district: 'gaming' },
      { id: 'b3', name: 'Nexus AI Labs', type: 'AI & Tech', icon: '🧪', x: 1690, y: 970, district: 'downtown' },
      { id: 'b4', name: 'Canvas House Saadiyat', type: 'Art Gallery', icon: '🎨', x: 1590, y: 430, district: 'creator' },
      { id: 'b5', name: 'Emirates Gourmet Food', type: 'Fine Dining', icon: '🍽️', x: 470, y: 570, district: 'harbor' },
      { id: 'b6', name: 'ADGM Founders Circle', type: 'Advisory & Law', icon: '🏛️', x: 1760, y: 1040, district: 'downtown' },
      { id: 'b7', name: 'Oceanic Yacht Charters', type: 'Tourism', icon: '🌊', x: 440, y: 490, district: 'harbor' },
      { id: 'b8', name: 'Motion Works VFX', type: 'Digital VFX', icon: '✨', x: 1690, y: 460, district: 'creator' },
      { id: 'b9', name: 'Arena Esports League', type: 'Esports Org', icon: '🏆', x: 790, y: 1210, district: 'gaming' },
      { id: 'b10', name: 'Green Oasis Eco-Tech', type: 'Sustainability', icon: '🌱', x: 420, y: 1240, district: 'nature' }
    ],
    parkedVehicles: [
      { id: 'v1', name: 'Pulse Hyper-GT', icon: '🏎️', type: 'Supercar', x: 610, y: 520, angle: 0 },
      { id: 'v2', name: 'Aero-Hover Superbike', icon: '🏍️', type: 'Hover Bike', x: 800, y: 1130, angle: 1.57 },
      { id: 'v3', name: 'Seaglass Taycan EV', icon: '🚙', type: 'Electric Sedan', x: 1670, y: 1010, angle: -0.8 },
      { id: 'v4', name: 'Gulfstream 42 Speedboat', icon: '🛥️', type: 'Speedboat', x: 410, y: 470, angle: 0.4 }
    ],
    atms: [
      { id: 'atm-1', name: 'Harbor Marina ATM', x: 530, y: 490 },
      { id: 'atm-2', name: 'ADGM Financial ATM', x: 1750, y: 990 },
      { id: 'atm-3', name: 'Yas Arena ATM', x: 720, y: 1200 }
    ],
    stuntRamps: [
      { id: 'stunt-1', name: 'Yas Canal Stunt Ramp', x: 920, y: 1060, angle: -0.6 },
      { id: 'stunt-2', name: 'Saadiyat Causeway Stunt Ramp', x: 1020, y: 540, angle: 0.5 }
    ],
    npcs: [
      { id: 'npc-1', name: 'Omar Al-Zaabi', avatar: '👨🏽‍💻', role: 'Island Pioneer', x: 510, y: 540, mission: 'courier' },
      { id: 'npc-2', name: 'Maya Chen', avatar: '👩🏻‍🎨', role: 'Spatial Creator', x: 1620, y: 460, mission: 'art' },
      { id: 'npc-3', name: 'Noah Williams', avatar: '🧑🏼‍🎮', role: 'Esports Pro', x: 730, y: 1160, mission: 'circuit' }
    ]
  };

  /* World Engine Global Instance */
  const worldEngine = {
    canvas: null,
    ctx: null,
    radarCanvas: null,
    radarCtx: null,
    animId: null,
    mode: 'map', // 'map' or 'drive'
    layer: 'satellite', // 'satellite', 'street', 'cyber', 'deeds'
    camera: { x: 520, y: 520, zoom: 0.75, targetX: 520, targetY: 520, targetZoom: 0.75 },
    player: {
      x: 520, y: 520,
      vx: 0, vy: 0,
      speed: 0,
      maxSpeed: 11,
      accel: 0.35,
      friction: 0.94,
      angle: 0,
      inVehicle: 'v1',
      drifting: false,
      nitro: 100,
      inAir: false
    },
    keys: {},
    skidMarks: [],
    particles: [],
    gpsRoute: null,
    activeMission: null,
    lapTimer: { active: false, startTime: 0, currentTime: 0, bestTime: null, lastCheckpoint: -1 },
    streetCred: 3,
    radioStation: 'Nexus Synth 94.2',
    drag: { isDown: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0 },
    nearestInteract: null,
    wavePhase: 0
  };

  /* ═══════════════════════════════════════════════
     ROUTE: ISLAND MAP (Google Maps meets GTA Engine)
     ═══════════════════════════════════════════════ */
  function island() {
    const layer = state.worldLayer || 'satellite';
    const mode = state.worldMode || 'map';
    const currentD = DISTRICTS.find(d => d.id === state.currentDistrict) || DISTRICTS[0];

    return `<section class="fade" style="display:flex;flex-direction:column;gap:18px">
      <!-- HEADER -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div class="metric-label" style="display:flex;align-items:center;gap:6px">
            <span class="live-dot" style="background:#22d3ee"></span> Persistent Abu Dhabi Archipelago
          </div>
          <h1 class="heading-lg" style="margin-top:4px">Nexus World &amp; Geospatial Engine</h1>
          <p style="font-size:13px;color:var(--text-muted);margin-top:2px">Switch between Google Maps satellite view and GTA-style interactive vehicle free-roam.</p>
        </div>

        <!-- Right Quick Stats & Actions -->
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div class="gta-stars-meter" title="Street Credibility Rating">
            <span style="font-size:11px;font-weight:800;color:var(--text-dim);margin-right:4px">CRED</span>
            ${[1,2,3,4,5].map(s => `<span class="gta-star ${s <= (state.streetCred||3) ? 'filled' : ''}">★</span>`).join('')}
          </div>

          <div style="display:flex;align-items:center;gap:6px">
            <button onclick="toggleWorldMode('map')" class="btn ${mode==='map'?'btn-primary':'btn-ghost'} btn-sm">🧭 Google Maps</button>
            <button onclick="toggleWorldMode('drive')" class="btn ${mode==='drive'?'btn-gold':'btn-ghost'} btn-sm">🏎️ GTA Free-Roam</button>
            ${btn('✨ NOVA Guide', 'nova()', 'ghost', 'class="btn btn-ghost btn-sm"')}
          </div>
        </div>
      </div>

      <!-- MAIN INTERACTIVE WORLD ENGINE FRAME -->
      <div class="world-engine-frame">
        <!-- TOP TOOLBAR & CONTROLS -->
        <div class="map-top-bar">
          <!-- Search POIs & Locations -->
          <div class="map-search-wrap">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none">🔍</span>
            <input type="text" id="mapSearchInput" class="map-search-input" placeholder="Search districts, plots, shops, cars..." oninput="searchWorldPois(this.value)" onfocus="searchWorldPois(this.value)">
            <div id="mapSearchDropdown" class="map-search-dropdown"></div>
          </div>

          <!-- Layer Switcher -->
          <div class="map-layer-pill-group">
            ${[
              ['satellite', '🛰️', 'Satellite'],
              ['street', '🗺️', 'Street'],
              ['cyber', '🌃', 'Cyber'],
              ['deeds', '📐', 'Deeds']
            ].map(([l, ic, txt]) => `
              <button onclick="setWorldLayer('${l}')" class="map-layer-btn ${layer === l ? 'active' : ''}">
                <span>${ic}</span> <span>${txt}</span>
              </button>
            `).join('')}
          </div>

          <!-- Vehicle & Mission Hub -->
          <div style="display:flex;gap:6px">
            <select onchange="spawnVehicleInWorld(this.value);this.selectedIndex=0;" style="padding:6px 12px;border-radius:12px;background:rgba(8,20,42,0.88);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);color:var(--text-primary);font-size:12px;font-weight:700;cursor:pointer;outline:none">
              <option value="">🚗 Spawn Vehicle...</option>
              ${DATA.vehicles.map(v => `<option value="${v.id}">${v.icon} ${v.name}</option>`).join('')}
            </select>
            <button onclick="startWorldMission('courier')" class="btn btn-gold btn-sm" style="box-shadow:0 4px 16px rgba(245,158,11,0.3)">⚡ Courier Sprint</button>
          </div>
        </div>

        <!-- CANVAS VIEWPORT -->
        <div id="worldCanvasContainer" class="world-canvas-container ${mode==='drive'?'free-roam-cursor':''}">
          <canvas id="nexusWorldCanvas"></canvas>
        </div>

        <!-- FLOATING ZOOM & RECENTER CONTROLS -->
        <div class="map-nav-controls">
          <button onclick="zoomWorld(0.2)" class="map-nav-btn" title="Zoom In">+</button>
          <button onclick="zoomWorld(-0.2)" class="map-nav-btn" title="Zoom Out">−</button>
          <button onclick="recenterWorld()" class="map-nav-btn" title="Recenter Camera">⌖</button>
          <button onclick="cycleRadio()" class="map-nav-btn" title="Island Radio">📻</button>
        </div>

        <!-- GTA RADAR MINIMAP (Bottom-Left) -->
        <div class="gta-radar-wrapper">
          <div class="gta-radar-outer">
            <canvas id="nexusRadarCanvas" width="144" height="144"></canvas>
            <div class="gta-radar-heading">N</div>
          </div>
          <div id="gtaLocationBadge" class="gta-location-badge">⚓ Harbor Marina Promenade</div>
        </div>

        <!-- GTA SPEEDOMETER & NITRO GAUGE (Bottom-Right, Drive Mode) -->
        <div id="gtaSpeedometer" class="gta-speedometer" style="display:${mode==='drive'?'block':'none'}">
          <div style="display:flex;align-items:baseline;justify-content:space-between">
            <div id="speedoVal" class="gta-speedo-val">0</div>
            <div style="font-size:10px;font-weight:800;color:var(--text-dim);letter-spacing:0.1em">KM / H</div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
            <span id="vehicleGear" style="font-size:11px;font-weight:900;color:#22d3ee">GEAR D</span>
            <span id="vehicleModelName" style="font-size:10px;font-weight:700;color:var(--text-muted)">Pulse Hyper-GT</span>
          </div>
          <div class="gta-nitro-track">
            <div id="nitroBar" class="gta-nitro-fill" style="width:100%"></div>
          </div>
        </div>

        <!-- CONTEXTUAL GTA PROXIMITY INTERACT PROMPT -->
        <div id="gtaPromptBox" class="gta-prompt-box" style="display:none" onclick="triggerGtaInteract()">
          <div class="gta-key-pill">[E]</div>
          <div id="gtaPromptText" style="font-size:12px;font-weight:800;color:#fff">Enter Harbor &amp; Co. Roastery</div>
        </div>

        <!-- ACTIVE MISSION HUD BANNER -->
        <div id="gtaMissionHud" class="gta-mission-hud" style="display:none">
          <span style="font-size:24px">📦</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#fbbf24">Active Contract</div>
            <div id="missionTitle" style="font-size:12px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Harbor to Saadiyat Express</div>
            <div id="missionCountdown" style="font-size:13px;font-weight:900;color:#22d3ee;font-family:'JetBrains Mono'">Time Left: 45s</div>
          </div>
          <button onclick="cancelWorldMission()" style="background:transparent;border:none;color:var(--text-dim);font-weight:900;cursor:pointer;font-size:14px">✕</button>
        </div>

        <!-- MOBILE ON-SCREEN TOUCH CONTROLS -->
        <div id="gtaTouchControls" class="gta-touch-controls">
          <div class="touch-btn-pad">
            <button class="touch-action-btn" ontouchstart="touchControlPress('gas')" ontouchend="touchControlRelease('gas')">▲ GAS</button>
            <button class="touch-action-btn" ontouchstart="touchControlPress('brake')" ontouchend="touchControlRelease('brake')">▼ BRK</button>
            <button class="touch-action-btn" style="background:rgba(245,158,11,0.3);border-color:#f59e0b" ontouchstart="touchControlPress('nitro')" ontouchend="touchControlRelease('nitro')">⚡</button>
            <button class="touch-action-btn" style="background:rgba(16,185,129,0.3);border-color:#10b981" onclick="triggerGtaInteract()">[E]</button>
          </div>
        </div>
      </div>

      <!-- CURRENT DISTRICT DETAILS -->
      <div id="zoneHost">
        ${renderDistrictDetail(currentD)}
      </div>

      <!-- ALL 7 DISTRICTS CARD GRID -->
      <div>
        <div class="metric-label" style="margin-bottom:12px">All Abu Dhabi Island Districts</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
          ${DISTRICTS.map(d => card(`
            <div style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;height:100%">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.04);display:grid;place-items:center;font-size:20px">${d.icon}</div>
                  <span style="font-size:9px;font-weight:800;text-transform:uppercase;color:${d.color};letter-spacing:0.1em">${d.tagline}</span>
                </div>
                <h3 style="font-size:16px;font-weight:900;margin-top:12px">${d.name}</h3>
                <p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.6">${d.description}</p>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.05)">
                <span style="font-size:11px;font-weight:600;color:var(--text-dim)">${DATA.land.filter(l=>l.district===d.name).length} plots</span>
                ${btn('Travel Here', `zone('${d.id}')`, d.id===state.currentDistrict?'primary':'ghost', 'class="btn btn-sm"')}
              </div>
            </div>
          `)).join('')}
        </div>
      </div>
    </section>`;
  }

  function renderDistrictDetail(d) {
    const nearbyBiz = DATA.businesses.filter(b => b.district === d.name);
    const nearbyPlots = DATA.land.filter(l => l.district === d.name);

    return card(`
      <div style="padding:28px">
        <div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:start">
          <div style="flex:1;min-width:280px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span class="live-dot"></span>
              <span class="metric-label">District Arrival &amp; Fast-Travel Hub</span>
            </div>
            <h2 style="font-size:28px;font-weight:900;display:flex;align-items:center;gap:10px;margin-top:8px">
              <span>${d.icon}</span> ${d.name}
            </h2>
            <p style="font-size:13px;color:var(--text-muted);margin-top:8px;line-height:1.6;max-width:480px">${d.description}</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">
              ${[['Landmark',d.landmark],['Parcels',nearbyPlots.length+' Available'],['Enterprises',nearbyBiz.length+' Active']].map(([l,v]) => `
                <div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)">
                  <div class="metric-label">${l}</div>
                  <div style="font-size:12px;font-weight:800;margin-top:3px">${v}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="width:280px;flex-shrink:0;padding:20px;border-radius:18px;background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.1)">
            <div class="metric-label" style="color:#22d3ee">Fast-Travel Active</div>
            <div style="font-size:16px;font-weight:900;margin-top:4px">Current Sector</div>
            <p style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.5">Launch into free-roam driving from this district or inspect available real estate deeds.</p>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:14px">
              ${btn('🏎️ Drive Here Now', `toggleWorldMode('drive')`, 'gold', 'class="btn btn-gold btn-sm" style="width:100%"')}
              ${btn('🏝️ Browse District Deeds', "nav('land.html')", 'primary', 'class="btn btn-primary btn-sm" style="width:100%"')}
            </div>
          </div>
        </div>

        <!-- Nearby listings -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05)">
          <div>
            <div style="font-size:13px;font-weight:900;margin-bottom:10px">Active Storefronts</div>
            ${nearbyBiz.length ? nearbyBiz.map(b => `
              <div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                  <span style="font-size:20px">${b.icon}</span>
                  <div style="min-width:0"><div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.name)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(b.type)} · ⭐ ${b.rating}</div></div>
                </div>
                ${btn('GPS Route', `selectWorldPoi('${b.id}')`, 'ghost', 'class="btn btn-ghost btn-sm"')}
              </div>
            `).join('') : '<div style="font-size:11px;color:var(--text-dim)">No storefronts yet.</div>'}
          </div>
          <div>
            <div style="font-size:13px;font-weight:900;margin-bottom:10px">Land Parcels</div>
            ${nearbyPlots.slice(0,3).map(l => `
              <div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
                <div><div style="font-size:12px;font-weight:700">${l.id} · ${esc(l.name)}</div><div style="font-size:10px;color:var(--text-dim)">${l.size}</div></div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:12px;font-weight:800;color:#22d3ee">${money(l.price)}</span>
                  ${btn('Inspect', `selectWorldPoi('${l.id}')`, 'primary', 'class="btn btn-primary btn-sm"')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `);
  }

  function setMapTheme(t) { state.settings.mapTheme = t; save(); refresh(); }

  function zone(id) {
    const d = DISTRICTS.find(x => x.id === id) || DISTRICTS[0];
    playBeep('click');
    state.currentDistrict = id;
    save();
    const firstVisit = !state.districtsVisited.includes(id);
    if (firstVisit) { state.districtsVisited.push(id); award(35, 20, `Explored ${d.name}`); }
    else { toast(`Traveled to ${d.name}.`, 'info'); }
    const h = document.getElementById('zoneHost');
    if (h) { h.innerHTML = renderDistrictDetail(d); h.scrollIntoView({ behavior: 'smooth' }); }
    
    // Also smoothly fly the world camera to this district in the interactive engine!
    const targetDistrict = WORLD_DATA.districts[id];
    if (targetDistrict && worldEngine.canvas) {
      worldEngine.camera.targetX = targetDistrict.x;
      worldEngine.camera.targetY = targetDistrict.y;
      worldEngine.camera.targetZoom = 0.9;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     WORLD ENGINE CONTROLLER & GAME LOOP IMPLEMENTATION
     ═══════════════════════════════════════════════════════════════ */
  function setWorldLayer(l) {
    worldEngine.layer = l;
    state.worldLayer = l;
    save();
    document.querySelectorAll('.map-layer-btn').forEach(btn => btn.classList.remove('active'));
    event?.currentTarget?.classList?.add('active');
    playBeep('click');
  }

  function toggleWorldMode(mode) {
    worldEngine.mode = mode;
    state.worldMode = mode;
    save();
    playBeep(mode === 'drive' ? 'engine' : 'click');
    const container = document.getElementById('worldCanvasContainer');
    if (container) {
      if (mode === 'drive') container.classList.add('free-roam-cursor');
      else container.classList.remove('free-roam-cursor');
    }
    const speedo = document.getElementById('gtaSpeedometer');
    if (speedo) speedo.style.display = mode === 'drive' ? 'block' : 'none';

    if (mode === 'drive') {
      worldEngine.camera.targetZoom = 1.6;
      worldEngine.camera.targetX = worldEngine.player.x;
      worldEngine.camera.targetY = worldEngine.player.y;
      toast('🏎️ Free-roam mode: Use WASD / Arrows to drive, Space to drift, Shift for Nitro!', 'info');
    } else {
      worldEngine.camera.targetZoom = 0.75;
      toast('🧭 Google Maps view: Drag to pan, scroll wheel to zoom.', 'info');
    }
  }

  function zoomWorld(delta) {
    worldEngine.camera.targetZoom = Math.max(0.35, Math.min(2.4, worldEngine.camera.targetZoom + delta));
    playBeep('click');
  }

  function recenterWorld() {
    worldEngine.camera.targetX = worldEngine.player.x;
    worldEngine.camera.targetY = worldEngine.player.y;
    worldEngine.camera.targetZoom = worldEngine.mode === 'drive' ? 1.6 : 0.85;
    playBeep('click');
    toast('Camera centered on player.', 'info');
  }

  function searchWorldPois(query) {
    const dropdown = document.getElementById('mapSearchDropdown');
    if (!dropdown) return;
    const q = String(query || '').trim().toLowerCase();
    if (!q) { dropdown.style.display = 'none'; return; }

    const results = [];
    Object.values(WORLD_DATA.districts).forEach(d => {
      if (d.name.toLowerCase().includes(q)) results.push({ id: d.id, name: d.name, type: 'District', icon: d.icon, x: d.x, y: d.y });
    });
    WORLD_DATA.plots.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) results.push({ id: p.id, name: `${p.id} · ${p.name}`, type: 'Land Deed', icon: '🏝️', x: p.x, y: p.y });
    });
    WORLD_DATA.businesses.forEach(b => {
      if (b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q)) results.push({ id: b.id, name: b.name, type: b.type, icon: b.icon, x: b.x, y: b.y });
    });
    WORLD_DATA.parkedVehicles.forEach(v => {
      if (v.name.toLowerCase().includes(q)) results.push({ id: v.id, name: v.name, type: 'Vehicle', icon: v.icon, x: v.x, y: v.y });
    });

    if (results.length === 0) {
      dropdown.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-dim);text-align:center">No locations found.</div>';
    } else {
      dropdown.innerHTML = results.slice(0, 6).map(r => `
        <div onclick="selectWorldPoi('${r.id}')" style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;gap:10px;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background='rgba(6,182,212,0.1)'" onmouseout="this.style.background='transparent'">
          <span style="font-size:18px">${r.icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:800;color:#fff">${r.name}</div>
            <div style="font-size:10px;color:#22d3ee">${r.type}</div>
          </div>
        </div>
      `).join('');
    }
    dropdown.style.display = 'block';
  }

  function selectWorldPoi(id) {
    const dropdown = document.getElementById('mapSearchDropdown');
    if (dropdown) dropdown.style.display = 'none';

    // Find POI
    let target = Object.values(WORLD_DATA.districts).find(d => d.id === id) ||
                 WORLD_DATA.plots.find(p => p.id === id) ||
                 WORLD_DATA.businesses.find(b => b.id === id) ||
                 WORLD_DATA.parkedVehicles.find(v => v.id === id);

    if (!target) return;

    worldEngine.camera.targetX = target.x;
    worldEngine.camera.targetY = target.y;
    worldEngine.camera.targetZoom = 1.35;

    // Set GPS Route
    worldEngine.gpsRoute = [
      { x: worldEngine.player.x, y: worldEngine.player.y },
      { x: (worldEngine.player.x + target.x) / 2, y: (worldEngine.player.y + target.y) / 2 - 40 },
      { x: target.x, y: target.y }
    ];

    playBeep('reward');
    toast(`🧭 GPS destination set: ${target.name || id}!`, 'success');
  }

  function spawnVehicleInWorld(vehId) {
    if (!vehId) return;
    const v = DATA.vehicles.find(x => x.id === vehId);
    if (!v) return;
    worldEngine.player.inVehicle = vehId;
    worldEngine.player.maxSpeed = 8 + (v.speed / 10);
    worldEngine.player.accel = 0.25 + (v.acceleration / 300);
    state.activeVehicle = vehId;
    save();
    playBeep('engine');
    toast(`🏎️ Spawned ${v.name}! You are in the driver seat.`, 'success');
    toggleWorldMode('drive');
  }

  function cycleRadio() {
    const stations = ['Nexus Synth 94.2', 'Abu Dhabi Lo-Fi Beats', 'Desert Cyber Bass', 'Radio Off'];
    const idx = stations.indexOf(worldEngine.radioStation);
    worldEngine.radioStation = stations[(idx + 1) % stations.length];
    playBeep('chat');
    toast(`📻 Island Radio: ${worldEngine.radioStation}`, 'info');
  }

  function startWorldMission(type) {
    if (type === 'courier') {
      worldEngine.activeMission = {
        type: 'courier',
        title: 'Harbor to Saadiyat Express',
        timeLeft: 45,
        targetX: 1640,
        targetY: 440,
        reward: 500,
        xp: 150
      };
      // Set GPS line
      worldEngine.gpsRoute = [
        { x: worldEngine.player.x, y: worldEngine.player.y },
        { x: 840, y: 560 },
        { x: 1250, y: 480 },
        { x: 1640, y: 440 }
      ];
      playBeep('reward');
      toast('📦 Express Contract: Deliver package to Saadiyat Atelier in 45s!', 'gold');
      const hud = document.getElementById('gtaMissionHud');
      if (hud) hud.style.display = 'flex';
      toggleWorldMode('drive');
    }
  }

  function cancelWorldMission() {
    worldEngine.activeMission = null;
    worldEngine.gpsRoute = null;
    const hud = document.getElementById('gtaMissionHud');
    if (hud) hud.style.display = 'none';
    toast('Mission cancelled.', 'info');
  }

  function triggerGtaInteract() {
    if (!worldEngine.nearestInteract) return;
    const item = worldEngine.nearestInteract;
    playBeep('click');

    if (item.type === 'business') {
      enterWorldBusiness(item.ref.id);
    } else if (item.type === 'plot') {
      inspectWorldDeed(item.ref.id);
    } else if (item.type === 'atm') {
      accessWorldAtm(item.ref.id);
    } else if (item.type === 'vehicle') {
      spawnVehicleInWorld(item.ref.id);
    } else if (item.type === 'npc') {
      modal(`Chat with ${item.ref.name}`, `
        <div style="text-align:center;padding:12px">
          <div style="font-size:54px">${item.ref.avatar}</div>
          <h3 style="font-size:16px;font-weight:900;margin-top:8px">${item.ref.name} (${item.ref.role})</h3>
          <p style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.6">"Welcome to Nexus Island! Need fast cash? I have an urgent courier delivery package headed to Saadiyat Atelier. Can you deliver it in 45 seconds?"</p>
          <div style="display:flex;gap:8px;margin-top:20px;justify-content:center">
            ${btn('📦 Accept Delivery Contract (+500 ISL)', 'closeModal();startWorldMission("courier")', 'gold')}
            ${btn('Maybe later', 'closeModal()', 'ghost')}
          </div>
        </div>
      `);
    }
  }

  function enterWorldBusiness(bId) {
    const b = DATA.businesses.find(x => x.id === bId);
    if (!b) return;
    playBeep('reward');
    modal(`${b.name} (${b.type})`, `
      <div style="padding:12px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span style="font-size:42px">${b.icon}</span>
          <div>
            <h3 style="font-size:18px;font-weight:900">${esc(b.name)}</h3>
            <div style="font-size:11px;color:#22d3ee">${b.type} · ⭐ ${b.rating} · ${b.followers} followers</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);line-height:1.5">${esc(b.description)}</p>
        <div style="display:flex;gap:8px;margin-top:20px">
          ${btn('🛒 Browse Menu & Shop', `closeModal();nav('marketplace.html')`, 'primary', 'style="flex:1"')}
          ${btn(state.following.includes(b.id)?'Following':'Follow', `toggleFollow('${b.id}')`, 'ghost')}
        </div>
      </div>
    `);
  }

  function inspectWorldDeed(plotId) {
    const p = DATA.land.find(x => x.id === plotId);
    if (!p) return;
    landDetail(plotId);
  }

  function accessWorldAtm(atmId) {
    playBeep('cash');
    modal('Nexus Central ATM Terminal', `
      <div style="text-align:center;padding:16px">
        <div style="font-size:48px;margin-bottom:8px">🏧</div>
        <div class="metric-label">Autonomous Liquid Reserve</div>
        <div style="font-size:24px;font-weight:900;color:#22d3ee;margin-top:6px">${money(state.wallet)}</div>
        <p style="font-size:11px;color:var(--text-muted);margin-top:4px">Instant demo liquidity for testing island asset transactions.</p>
        <div style="display:flex;gap:8px;margin-top:20px;justify-content:center">
          ${btn('+1,000 ISL Demo Cash', 'closeModal();demoFunds(1000)', 'gold')}
          ${btn('+5,000 ISL Whale Deposit', 'closeModal();demoFunds(5000)', 'primary')}
        </div>
      </div>
    `);
  }

  function touchControlPress(action) {
    if (action === 'gas') worldEngine.keys['ArrowUp'] = true;
    if (action === 'brake') worldEngine.keys['ArrowDown'] = true;
    if (action === 'nitro') worldEngine.keys['ShiftLeft'] = true;
  }

  function touchControlRelease(action) {
    if (action === 'gas') delete worldEngine.keys['ArrowUp'];
    if (action === 'brake') delete worldEngine.keys['ArrowDown'];
    if (action === 'nitro') delete worldEngine.keys['ShiftLeft'];
  }

  /* ═══════════════════════════════════════════════════════════════
     CANVAS INITIALIZATION AND RENDER LOOP
     ═══════════════════════════════════════════════════════════════ */
  function initWorldEngine() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const canvas = document.getElementById('nexusWorldCanvas');
    if (!canvas || !canvas.getContext) return;

    worldEngine.canvas = canvas;
    worldEngine.ctx = canvas.getContext('2d');
    worldEngine.radarCanvas = document.getElementById('nexusRadarCanvas');
    if (worldEngine.radarCanvas && worldEngine.radarCanvas.getContext) {
      worldEngine.radarCtx = worldEngine.radarCanvas.getContext('2d');
    }

    // Set canvas dimensions
    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth || 900;
      canvas.height = canvas.parentElement.clientHeight || 620;
    };
    resize();
    window.addEventListener('resize', resize);

    // Parse URL params for deep-links (?drive=v1, ?inspect=L-101, ?target=b1)
    if (window.location && window.location.search && typeof URLSearchParams !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const driveTarget = params.get('drive');
        const inspectTarget = params.get('inspect') || params.get('target');
        if (driveTarget) {
          spawnVehicleInWorld(driveTarget);
        } else if (inspectTarget) {
          setTimeout(() => selectWorldPoi(inspectTarget), 250);
        }
      } catch {}
    }

    // Bind Mouse Drag & Wheel
    canvas.addEventListener('mousedown', (e) => {
      worldEngine.drag.isDown = true;
      worldEngine.drag.startX = e.clientX;
      worldEngine.drag.startY = e.clientY;
      worldEngine.drag.camStartX = worldEngine.camera.x;
      worldEngine.drag.camStartY = worldEngine.camera.y;
    });

    window.addEventListener('mousemove', (e) => {
      if (!worldEngine.drag.isDown) return;
      const dx = (e.clientX - worldEngine.drag.startX) / worldEngine.camera.zoom;
      const dy = (e.clientY - worldEngine.drag.startY) / worldEngine.camera.zoom;
      worldEngine.camera.targetX = worldEngine.drag.camStartX - dx;
      worldEngine.camera.targetY = worldEngine.drag.camStartY - dy;
    });

    window.addEventListener('mouseup', () => { worldEngine.drag.isDown = false; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      worldEngine.camera.targetZoom = Math.max(0.35, Math.min(2.4, worldEngine.camera.targetZoom * zoomFactor));
    }, { passive: false });

    // Keyboard bindings for GTA Controls
    window.addEventListener('keydown', (e) => {
      worldEngine.keys[e.code] = true;
      worldEngine.keys[e.key] = true;

      if (e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F') {
        triggerGtaInteract();
      }
      if (e.key === 'h' || e.key === 'H') {
        playBeep('horn');
      }
      if (e.key === 'r' || e.key === 'R') {
        cycleRadio();
      }
    });

    window.addEventListener('keyup', (e) => {
      delete worldEngine.keys[e.code];
      delete worldEngine.keys[e.key];
    });

    // Touch support detection
    if ('ontouchstart' in window) {
      const touchHud = document.getElementById('gtaTouchControls');
      if (touchHud) touchHud.classList.add('mobile-active');
    }

    // Start Animation Loop
    if (worldEngine.animId) cancelAnimationFrame(worldEngine.animId);
    let lastTime = performance.now();

    function loop(now) {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;
      updateWorldPhysics(dt);
      renderWorldCanvas();
      renderRadarMinimap();
      worldEngine.animId = requestAnimationFrame(loop);
    }
    worldEngine.animId = requestAnimationFrame(loop);
  }

  function updateWorldPhysics(dt) {
    const p = worldEngine.player;
    const keys = worldEngine.keys;
    const isDrive = worldEngine.mode === 'drive';

    // Player Movement (Driving or Walking)
    const forward = keys['KeyW'] || keys['ArrowUp'];
    const backward = keys['KeyS'] || keys['ArrowDown'];
    const left = keys['KeyA'] || keys['ArrowLeft'];
    const right = keys['KeyD'] || keys['ArrowRight'];
    const drift = keys['Space'];
    const nitro = (keys['ShiftLeft'] || keys['ShiftRight']) && isDrive;

    if (isDrive) {
      // Vehicle Dynamics
      const maxSpd = nitro ? p.maxSpeed * 1.6 : p.maxSpeed;
      if (forward) {
        p.speed = Math.min(maxSpd, p.speed + (p.accel * (nitro ? 2.0 : 1.0)));
        if (Math.random() < 0.2) playBeep('engine');
      } else if (backward) {
        p.speed = Math.max(-p.maxSpeed * 0.4, p.speed - p.accel * 0.8);
      } else {
        p.speed *= p.friction;
      }

      // Steering
      const turnAmt = 0.05 * (p.speed / p.maxSpeed);
      if (left) p.angle -= turnAmt;
      if (right) p.angle += turnAmt;

      // Drift Skid Marks
      if (drift && Math.abs(p.speed) > 3) {
        p.drifting = true;
        p.speed *= 0.97;
        worldEngine.skidMarks.push({ x: p.x, y: p.y, angle: p.angle, alpha: 0.8 });
        if (Math.random() < 0.3) playBeep('drift');
      } else {
        p.drifting = false;
      }

      // Velocity vectors
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      p.x += p.vx;
      p.y += p.vy;

      // Bounds clamping
      p.x = Math.max(150, Math.min(WORLD_DATA.width - 150, p.x));
      p.y = Math.max(150, Math.min(WORLD_DATA.height - 150, p.y));

      // Nitro Depletion & Refill
      if (nitro && p.speed > 4) {
        p.nitro = Math.max(0, p.nitro - 0.4);
        worldEngine.particles.push({ x: p.x - Math.cos(p.angle)*25, y: p.y - Math.sin(p.angle)*25, color: '#06b6d4', size: 6, alpha: 1 });
      } else {
        p.nitro = Math.min(100, p.nitro + 0.15);
      }

      // Camera Follows Player
      worldEngine.camera.targetX = p.x;
      worldEngine.camera.targetY = p.y;
    } else {
      // Walking mode
      let mx = 0, my = 0;
      if (forward) my -= 1;
      if (backward) my += 1;
      if (left) mx -= 1;
      if (right) mx += 1;
      const len = Math.hypot(mx, my);
      if (len > 0) {
        const walkSpeed = (keys['ShiftLeft'] || keys['ShiftRight']) ? 6.5 : 3.8;
        p.x += (mx / len) * walkSpeed;
        p.y += (my / len) * walkSpeed;
        p.angle = Math.atan2(my, mx);
      }
    }

    // Camera smoothing
    const c = worldEngine.camera;
    c.x += (c.targetX - c.x) * 0.12;
    c.y += (c.targetY - c.y) * 0.12;
    c.zoom += (c.targetZoom - c.zoom) * 0.12;

    // Fade skidmarks and particles
    for (let i = worldEngine.skidMarks.length - 1; i >= 0; i--) {
      worldEngine.skidMarks[i].alpha -= 0.003;
      if (worldEngine.skidMarks[i].alpha <= 0) worldEngine.skidMarks.splice(i, 1);
    }
    for (let i = worldEngine.particles.length - 1; i >= 0; i--) {
      worldEngine.particles[i].alpha -= 0.04;
      worldEngine.particles[i].size *= 0.95;
      if (worldEngine.particles[i].alpha <= 0) worldEngine.particles.splice(i, 1);
    }

    // Proximity Detection
    detectNearestInteraction();

    // Mission Countdown Timer
    if (worldEngine.activeMission) {
      worldEngine.activeMission.timeLeft -= dt;
      const countEl = document.getElementById('missionCountdown');
      if (countEl) countEl.innerText = `Time Left: ${Math.max(0, Math.ceil(worldEngine.activeMission.timeLeft))}s`;

      // Check destination arrival
      const distToTarget = Math.hypot(p.x - worldEngine.activeMission.targetX, p.y - worldEngine.activeMission.targetY);
      if (distToTarget < 90) {
        // Mission Completed!
        const rew = worldEngine.activeMission.reward;
        state.wallet += rew;
        state.streetCred = Math.min(5, (state.streetCred || 3) + 1);
        worldEngine.streetCred = state.streetCred;
        award(100, 50, 'Completed Express Courier Contract');
        playBeep('cash');
        toast(`🎉 Mission Success! Earned +${money(rew)} &amp; +1 Street Cred Star!`, 'success');
        cancelWorldMission();
      } else if (worldEngine.activeMission.timeLeft <= 0) {
        toast('⏳ Time expired! Contract failed.', 'warn');
        cancelWorldMission();
      }
    }

    // DOM HUD Updates
    const speedo = document.getElementById('speedoVal');
    if (speedo) speedo.innerText = Math.round(Math.abs(p.speed) * 18);
    const nitroBar = document.getElementById('nitroBar');
    if (nitroBar) nitroBar.style.width = `${p.nitro}%`;

    // Detect Current Location
    updateLocationBadge();
  }

  function detectNearestInteraction() {
    const p = worldEngine.player;
    let closest = null;
    let minD = 75;

    // Check businesses
    WORLD_DATA.businesses.forEach(b => {
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d < minD) { minD = d; closest = { type: 'business', ref: b, label: `Enter ${b.name}` }; }
    });
    // Check plots
    WORLD_DATA.plots.forEach(l => {
      const d = Math.hypot(p.x - (l.x + l.w/2), p.y - (l.y + l.h/2));
      if (d < minD) { minD = d; closest = { type: 'plot', ref: l, label: `Inspect Deed ${l.id} (${l.name})` }; }
    });
    // Check ATMs
    WORLD_DATA.atms.forEach(a => {
      const d = Math.hypot(p.x - a.x, p.y - a.y);
      if (d < minD) { minD = d; closest = { type: 'atm', ref: a, label: `Access ${a.name}` }; }
    });
    // Check Parked Cars
    WORLD_DATA.parkedVehicles.forEach(v => {
      const d = Math.hypot(p.x - v.x, p.y - v.y);
      if (d < minD) { minD = d; closest = { type: 'vehicle', ref: v, label: `Drive ${v.name}` }; }
    });
    // Check NPCs
    WORLD_DATA.npcs.forEach(n => {
      const d = Math.hypot(p.x - n.x, p.y - n.y);
      if (d < minD) { minD = d; closest = { type: 'npc', ref: n, label: `Talk to ${n.name}` }; }
    });

    worldEngine.nearestInteract = closest;
    const prompt = document.getElementById('gtaPromptBox');
    const promptText = document.getElementById('gtaPromptText');
    if (prompt && promptText) {
      if (closest) {
        promptText.innerText = closest.label;
        prompt.style.display = 'flex';
      } else {
        prompt.style.display = 'none';
      }
    }
  }

  function updateLocationBadge() {
    const p = worldEngine.player;
    let nearestDistrict = Object.values(WORLD_DATA.districts)[0];
    let minD = 99999;
    Object.values(WORLD_DATA.districts).forEach(d => {
      const dist = Math.hypot(p.x - d.x, p.y - d.y);
      if (dist < minD) { minD = dist; nearestDistrict = d; }
    });
    const badge = document.getElementById('gtaLocationBadge');
    if (badge) badge.innerText = `${nearestDistrict.icon} ${nearestDistrict.name}`;
  }

  /* ═══════════════════════════════════════════════════════════════
     CANVAS RENDERING: GOOGLE MAPS + GTA SCENE
     ═══════════════════════════════════════════════════════════════ */
  function renderWorldCanvas() {
    const ctx = worldEngine.ctx;
    const canvas = worldEngine.canvas;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const cam = worldEngine.camera;
    const layer = worldEngine.layer;

    ctx.clearRect(0, 0, w, h);

    // Camera Transform Matrix
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    // 1. OCEAN BACKGROUND & WATER RIPPLES
    worldEngine.wavePhase += 0.02;
    const oceanGrad = ctx.createRadialGradient(cam.x, cam.y, 100, cam.x, cam.y, 1600);
    if (layer === 'cyber') {
      oceanGrad.addColorStop(0, '#020713');
      oceanGrad.addColorStop(1, '#010309');
    } else {
      oceanGrad.addColorStop(0, '#083344');
      oceanGrad.addColorStop(0.5, '#042238');
      oceanGrad.addColorStop(1, '#021324');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(-800, -800, WORLD_DATA.width + 1600, WORLD_DATA.height + 1600);

    // Water rings
    ctx.strokeStyle = layer === 'cyber' ? 'rgba(99,102,241,0.1)' : 'rgba(34,211,238,0.15)';
    ctx.lineWidth = 2;
    for (let r = 0; r < 4; r++) {
      const rad = 250 + ((r * 120 + worldEngine.wavePhase * 50) % 600);
      ctx.beginPath();
      ctx.arc(520, 520, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. ISLAND ARCHIPELAGO MAIN LANDMASS
    Object.values(WORLD_DATA.districts).forEach(d => {
      // Sand Beach Buffer Ring
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius + 30, 0, Math.PI * 2);
      ctx.fillStyle = layer === 'cyber' ? 'rgba(99,102,241,0.06)' : 'rgba(251,191,36,0.25)';
      ctx.fill();

      // Landmass Body
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      if (layer === 'cyber') {
        ctx.fillStyle = '#061325';
        ctx.strokeStyle = 'rgba(6,182,212,0.4)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else if (layer === 'street') {
        ctx.fillStyle = '#0c233c';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
      } else {
        // Satellite Photorealistic Greens & Terrain
        const landGrad = ctx.createRadialGradient(d.x - 30, d.y - 30, 20, d.x, d.y, d.radius);
        landGrad.addColorStop(0, d.color + '55');
        landGrad.addColorStop(0.7, '#064e3b');
        landGrad.addColorStop(1, '#065f46');
        ctx.fillStyle = landGrad;
        ctx.fill();
      }

      // District Center Pulse Beacon
      ctx.beginPath();
      ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    });

    // 3. YAS GRAND PRIX CIRCUIT ROAD
    ctx.beginPath();
    const pts = WORLD_DATA.yasCircuit;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.lineWidth = 32;
    ctx.strokeStyle = layer === 'cyber' ? '#1e1b4b' : '#1e293b';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Circuit Neon Curbs
    ctx.lineWidth = 4;
    ctx.strokeStyle = layer === 'cyber' ? '#a855f7' : '#f43f5e';
    ctx.stroke();

    // 4. ROAD NETWORK & BRIDGES
    WORLD_DATA.roads.forEach(r => {
      // Under-shadow / bridge deck
      ctx.beginPath();
      ctx.moveTo(r.from[0], r.from[1]);
      ctx.lineTo(r.to[0], r.to[1]);
      ctx.lineWidth = r.bridge ? 36 : 28;
      ctx.strokeStyle = layer === 'cyber' ? '#040d1a' : r.bridge ? '#334155' : '#1e293b';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Road Surface
      ctx.beginPath();
      ctx.moveTo(r.from[0], r.from[1]);
      ctx.lineTo(r.to[0], r.to[1]);
      ctx.lineWidth = r.bridge ? 28 : 22;
      ctx.strokeStyle = layer === 'cyber' ? '#061a33' : '#334155';
      ctx.stroke();

      // Road Center Divider
      ctx.beginPath();
      ctx.moveTo(r.from[0], r.from[1]);
      ctx.lineTo(r.to[0], r.to[1]);
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = layer === 'cyber' ? '#22d3ee' : '#fbbf24';
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 5. LAND PARCELS & DEEDS (When in Deeds or Map Mode)
    WORLD_DATA.plots.forEach(plot => {
      ctx.beginPath();
      ctx.rect(plot.x, plot.y, plot.w, plot.h);
      if (layer === 'deeds') {
        ctx.fillStyle = 'rgba(6,182,212,0.12)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
      }
      ctx.fill();
      ctx.stroke();

      // Plot ID label
      ctx.fillStyle = layer === 'deeds' ? '#22d3ee' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(plot.id, plot.x + 8, plot.y + 18);
    });

    // 6. TIRE SKID MARKS
    worldEngine.skidMarks.forEach(sm => {
      ctx.save();
      ctx.translate(sm.x, sm.y);
      ctx.rotate(sm.angle);
      ctx.fillStyle = `rgba(15, 23, 42, ${sm.alpha})`;
      ctx.fillRect(-6, -6, 12, 4);
      ctx.fillRect(-6, 4, 12, 4);
      ctx.restore();
    });

    // 7. GPS WAYPOINT LINE (When Active)
    if (worldEngine.gpsRoute && worldEngine.gpsRoute.length > 1) {
      ctx.beginPath();
      ctx.moveTo(worldEngine.gpsRoute[0].x, worldEngine.gpsRoute[0].y);
      for (let i = 1; i < worldEngine.gpsRoute.length; i++) {
        ctx.lineTo(worldEngine.gpsRoute[i].x, worldEngine.gpsRoute[i].y);
      }
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#fbbf24';
      ctx.setLineDash([14, 8]);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 8. STOREFRONTS & ENTERPRISES
    WORLD_DATA.businesses.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8,20,42,0.9)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.icon, b.x, b.y);

      // Name Label in Map Mode
      if (cam.zoom > 0.8) {
        ctx.font = 'bold 9px Plus Jakarta Sans';
        ctx.fillStyle = '#fff';
        ctx.fillText(b.name, b.x, b.y + 24);
      }
    });

    // 9. PARKED VEHICLES & ATMS
    WORLD_DATA.parkedVehicles.forEach(v => {
      if (v.id === worldEngine.player.inVehicle && worldEngine.mode === 'drive') return;
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate(v.angle);
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(v.icon, 0, 0);
      ctx.restore();
    });

    WORLD_DATA.atms.forEach(a => {
      ctx.beginPath();
      ctx.arc(a.x, a.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏧', a.x, a.y);
    });

    // 10. STUNT RAMPS
    WORLD_DATA.stuntRamps.forEach(sr => {
      ctx.save();
      ctx.translate(sr.x, sr.y);
      ctx.rotate(sr.angle);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-14, -8, 28, 16);
      ctx.fillStyle = '#000';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲▲', 0, 0);
      ctx.restore();
    });

    // 11. NPC RESIDENTS
    WORLD_DATA.npcs.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,158,11,0.2)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.avatar, n.x, n.y);
    });

    // 12. EXHAUST & NITRO PARTICLES
    worldEngine.particles.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // 13. PLAYER AVATAR & ACTIVE DRIVEN VEHICLE
    const p = worldEngine.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (worldEngine.mode === 'drive') {
      // Vehicle Chassis
      const veh = DATA.vehicles.find(v => v.id === p.inVehicle) || DATA.vehicles[0];
      // Car Body
      ctx.fillStyle = '#0ea5e9';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillRect(-22, -12, 44, 24);
      ctx.shadowBlur = 0;

      // Windshield & Roof
      ctx.fillStyle = '#041428';
      ctx.fillRect(-8, -9, 20, 18);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(20, -11, 4, 6);
      ctx.fillRect(20, 5, 4, 6);

      // Taillights
      ctx.fillStyle = p.speed < 0 ? '#fff' : '#f43f5e';
      ctx.fillRect(-24, -10, 3, 5);
      ctx.fillRect(-24, 5, 3, 5);
    } else {
      // Avatar Walking Circle
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.user?.avatar || '👤', 0, 0);
    }
    ctx.restore();

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════════
     GTA CIRCULAR RADAR MINIMAP RENDERER
     ═══════════════════════════════════════════════════════════════ */
  function renderRadarMinimap() {
    const rctx = worldEngine.radarCtx;
    const rcan = worldEngine.radarCanvas;
    if (!rctx || !rcan) return;

    const rw = rcan.width;
    const rh = rcan.height;
    const p = worldEngine.player;

    rctx.clearRect(0, 0, rw, rh);

    // Circular clip
    rctx.save();
    rctx.beginPath();
    rctx.arc(rw / 2, rh / 2, rw / 2, 0, Math.PI * 2);
    rctx.clip();

    // Radar Dark Oceanic Background
    rctx.fillStyle = '#040d1a';
    rctx.fillRect(0, 0, rw, rh);

    // Radar Transform centered on player
    rctx.translate(rw / 2, rh / 2);
    const rScale = 0.22;
    rctx.scale(rScale, rScale);
    rctx.translate(-p.x, -p.y);

    // Roads on radar
    rctx.strokeStyle = 'rgba(255,255,255,0.2)';
    rctx.lineWidth = 18;
    rctx.lineCap = 'round';
    WORLD_DATA.roads.forEach(r => {
      rctx.beginPath();
      rctx.moveTo(r.from[0], r.from[1]);
      rctx.lineTo(r.to[0], r.to[1]);
      rctx.stroke();
    });

    // POI Blips
    WORLD_DATA.businesses.forEach(b => {
      rctx.beginPath();
      rctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
      rctx.fillStyle = '#06b6d4';
      rctx.fill();
    });

    WORLD_DATA.npcs.forEach(n => {
      rctx.beginPath();
      rctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
      rctx.fillStyle = '#f59e0b';
      rctx.fill();
    });

    // GPS route on radar
    if (worldEngine.gpsRoute && worldEngine.gpsRoute.length > 1) {
      rctx.beginPath();
      rctx.moveTo(worldEngine.gpsRoute[0].x, worldEngine.gpsRoute[0].y);
      for (let i = 1; i < worldEngine.gpsRoute.length; i++) {
        rctx.lineTo(worldEngine.gpsRoute[i].x, worldEngine.gpsRoute[i].y);
      }
      rctx.lineWidth = 14;
      rctx.strokeStyle = '#fbbf24';
      rctx.stroke();
    }

    rctx.restore();

    // Player Heading Arrow in Center of Radar
    rctx.save();
    rctx.translate(rw / 2, rh / 2);
    rctx.rotate(p.angle);
    rctx.beginPath();
    rctx.moveTo(10, 0);
    rctx.lineTo(-8, -7);
    rctx.lineTo(-4, 0);
    rctx.lineTo(-8, 7);
    rctx.closePath();
    rctx.fillStyle = '#22d3ee';
    rctx.shadowColor = '#22d3ee';
    rctx.shadowBlur = 8;
    rctx.fill();
    rctx.restore();
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
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Utility Ownership','Land Marketplace & Deeds','Own permanent plots to build residences, studios, or businesses.',btn('Build Home','buildHome()','primary')+btn('Guide','nova()','ghost'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
        ${DATA.land.map(l => card(`
          <div style="padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div><span class="tag tag-cyan">${l.id}</span><h3 style="font-size:15px;font-weight:900;margin-top:8px">${esc(l.name)}</h3><div style="font-size:11px;color:var(--text-muted);margin-top:4px">${l.district} · ${l.size}</div></div>
              <div style="text-align:right"><div style="font-size:16px;font-weight:900;color:#22d3ee">${money(l.price)}</div><div style="font-size:10px;color:var(--text-dim)">${aed(l.price)}</div></div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
              <span style="font-size:10px;padding:4px 8px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);font-weight:600;color:var(--text-muted)">${l.zoning}</span>
              <span style="font-size:10px;padding:4px 8px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);font-weight:600;color:var(--text-muted)">${l.potential}</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.05)">
              ${btn('📍 Map View',`nav('island.html?inspect=${l.id}')`,'ghost','class="btn btn-ghost btn-sm"')}
              ${btn('View Deed',`landDetail('${l.id}')`,'ghost','class="btn btn-ghost btn-sm"')}
              ${l.available?btn('Acquire',`buyLand('${l.id}')`,'primary','class="btn btn-primary btn-sm"'):'<span class="tag tag-rose">Sold</span>'}
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function landDetail(id) {
    const l = DATA.land.find(x=>x.id===id);
    if (!l) return;
    modal(`Title Deed: ${l.id}`, `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${[['Plot ID',l.id],['District',l.district],['Size',l.size],['Zoning',l.zoning],['Nearby',l.nearby],['Potential',l.potential]].map(([k,v])=>`<div style="padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05)"><div class="metric-label">${k}</div><div style="font-size:13px;font-weight:700;margin-top:4px">${esc(v)}</div></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
          <div><div style="font-size:20px;font-weight:900;color:#22d3ee">${money(l.price)}</div><div style="font-size:11px;color:var(--text-dim)">${aed(l.price)}</div></div>
          ${l.available?btn('Acquire Parcel',`closeModal();buyLand('${l.id}')`,'gold'):'<span class="tag tag-rose">Not Available</span>'}
        </div>
      </div>
    `);
  }

  function filterLand() { /* maintained for backward compat */ }

  function wish(id) { if (!state.wishlist.includes(id)) { state.wishlist.push(id); save(); toast('Added to wishlist.','success'); } }

  function buyLand(id) {
    const l = DATA.land.find(x=>x.id===id);
    if (!l) return;
    if (state.wallet < l.price) return toast('Insufficient ISL balance.','warn');
    modal(`Confirm: Acquire ${l.id}`, `
      <p style="font-size:13px;color:var(--text-secondary)">Acquire <b>${esc(l.name)}</b> (${l.size}) in ${l.district} for <b style="color:#22d3ee">${money(l.price)}</b>?</p>
      <div style="display:flex;gap:8px;margin-top:20px;justify-content:end">
        ${btn('Cancel','closeModal()','ghost')}
        ${btn('Confirm Purchase',`confirmLand('${l.id}')`,'gold')}
      </div>
    `);
  }

  function confirmLand(id) {
    const l = DATA.land.find(x=>x.id===id);
    if (!l || state.wallet < l.price) return toast('Cannot complete.','warn');
    state.wallet -= l.price;
    state.ownedLand.push(id);
    l.available = false;
    state.transactions.unshift({id:uid('tx'),description:`Acquired ${l.name} (${l.id})`,amount:-l.price,type:'Purchase',date:'Just now',status:'Settled'});
    award(50, 0, `Acquired land ${l.id}`);
    closeModal();
    toast(`🏝️ Title deed for ${l.id} is yours!`, 'success');
    refresh();
  }

  function buildHome() {
    if (state.home.built) return toast('Home already built!','info');
    modal('Build Starter Home',`<p style="font-size:13px;color:var(--text-secondary)">Construct your personal coastal residence?</p><div style="margin-top:16px;display:flex;gap:8px;justify-content:end">${btn('Cancel','closeModal()','ghost')}${btn('Build Now','confirmHomeBuild()','gold')}</div>`);
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
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Digital Real Estate','Properties & Rooms','Browse, acquire, and customize your private spaces.',btn('My Interior','openRoomDesigner()','primary'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${DATA.properties.map(p => itemCard(p.icon, p.name, `${p.type} · ${p.district}`, `<div style="font-size:14px;font-weight:800;color:#22d3ee">${money(p.price)} <span style="font-size:10px;color:var(--text-dim)">${aed(p.price)}</span></div>`, btn('📍 Map',`nav('island.html?target=${p.id}')`,'ghost','class="btn btn-ghost btn-sm"') + btn('View','propertyDetail("'+p.id+'")','primary','class="btn btn-primary btn-sm"'))).join('')}
      </div>
    </section>`;
  }

  function propertyDetail(id) {
    const p = DATA.properties.find(x=>x.id===id);
    if (!p) return;
    modal(p.name,`<p style="font-size:13px;color:var(--text-muted)">${esc(p.description)}</p><div style="margin-top:16px;display:flex;justify-content:between;align-items:center"><div style="font-size:20px;font-weight:900;color:#22d3ee">${money(p.price)}</div><div style="margin-left:auto">${btn('Acquire',`buyProperty('${p.id}')`,'gold')}</div></div>`);
  }

  function buyProperty(id) {
    const p = DATA.properties.find(x=>x.id===id);
    if (!p) return;
    if (state.wallet < p.price) return toast('Insufficient ISL.','warn');
    state.wallet -= p.price; state.ownedProperties.push(id);
    state.transactions.unshift({id:uid('tx'),description:`Acquired ${p.name}`,amount:-p.price,type:'Purchase',date:'Just now',status:'Settled'});
    award(60,0,`Acquired ${p.name}`);
    closeModal(); toast(`🏠 ${p.name} is yours!`,'success'); refresh();
  }

  function openRoomDesigner() {
    if (!state.home.built) return toast('Build your home first!','warn');
    const ambiance = state.home.ambiance || 'sunset';
    const ambianceStyles = { sunset:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(244,63,94,0.04))', cyber:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.04))', daylight:'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.04))' };
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
            ${['sunset','cyber','daylight'].map(a=>`<button onclick="setRoomAmbiance('${a}')" style="padding:4px 10px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid ${ambiance===a?'rgba(6,182,212,0.4)':'rgba(255,255,255,0.06)'};background:${ambiance===a?'rgba(6,182,212,0.12)':'transparent'};color:${ambiance===a?'#22d3ee':'var(--text-muted)'}">${a}</button>`).join('')}
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
              <div><div style="font-size:15px;font-weight:900;color:#22d3ee">${money(p.price)}</div><div style="font-size:10px;color:var(--text-dim)">${p.stock} in stock</div></div>
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
  function productDetail(id) { const p=DATA.products.find(x=>x.id===id); if(!p)return; modal(p.name,`<div style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;align-items:center;gap:12px"><span style="font-size:40px">${p.icon}</span><div><div style="font-size:18px;font-weight:900">${esc(p.name)}</div><div style="font-size:11px;color:var(--text-dim)">${p.category} · ${p.rarity} · ${p.stock} left</div></div></div><p style="font-size:13px;color:var(--text-muted);line-height:1.6">${esc(p.description)}</p><div style="display:flex;justify-content:between;align-items:center"><div style="font-size:22px;font-weight:900;color:#22d3ee">${money(p.price)}</div><div style="margin-left:auto;display:flex;gap:8px">${btn('Add to Cart',`closeModal();addCart('${p.id}')`,'primary')}${btn('Buy Now',`closeModal();addCart('${p.id}');checkout()`,'gold')}</div></div></div>`); }

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
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Virtual Economy','Enterprises & Services','Discover or create businesses operating on the island.',btn('Start Business','createBusiness()','primary'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">
        ${DATA.businesses.map(b => card(`
          <div style="padding:20px">
            <div style="display:flex;align-items:start;gap:12px">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.04);display:grid;place-items:center;font-size:24px;flex-shrink:0">${b.icon}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:14px;font-weight:800">${esc(b.name)}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${b.type} · ${b.district}</div>
                <p style="font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.5">${esc(b.description)}</p>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
              <div style="font-size:11px;color:var(--text-dim)">⭐ ${b.rating} · ${b.followers} followers</div>
              <div style="display:flex;gap:6px">
                ${btn('🧭 Drive Here',`nav('island.html?target=${b.id}')`,'ghost','class="btn btn-ghost btn-sm"')}
                ${btn(state.following.includes(b.id)?'Following':'Follow',`toggleFollow('${b.id}')`,state.following.includes(b.id)?'primary':'ghost','class="btn btn-sm"')}
              </div>
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function createBusiness() { modal('Launch Enterprise',`<p style="font-size:13px;color:var(--text-muted)">Create a virtual business on Nexus Island.</p><div style="margin-top:16px">${btn('Coming Soon','closeModal()','ghost')}</div>`); }
  function createBusinessSave() {}
  function toggleFollow(id) { if(state.following.includes(id)){state.following=state.following.filter(x=>x!==id);toast('Unfollowed.','info');} else {state.following.push(id);toast('Following!','success');} save(); refresh(); }

  /* VEHICLES */
  function vehicles() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Mobility','Vehicles & Garages','Acquire high-performance vehicles for island transit.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${DATA.vehicles.map(v => card(`
          <div style="padding:20px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <span style="font-size:32px">${v.icon}</span>
              <div><div style="font-size:14px;font-weight:800">${esc(v.name)}</div><div style="font-size:11px;color:var(--text-muted)">${v.type}</div></div>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:14px">
              ${[['SPD',v.speed],['HDL',v.handling],['ACC',v.acceleration]].map(([l,v2])=>`<div style="flex:1;padding:6px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);text-align:center"><div style="font-size:9px;font-weight:700;color:var(--text-dim)">${l}</div><div style="font-size:13px;font-weight:900;color:#22d3ee">${v2}</div></div>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
              <div style="font-size:15px;font-weight:900;color:#22d3ee">${money(v.price)}</div>
              <div style="display:flex;gap:6px">
                ${btn('🏎️ Test Drive',`driveVehicle('${v.id}')`,'gold','class="btn btn-gold btn-sm"')}
                ${state.ownedVehicles.includes(v.id)?'<span class="badge badge-emerald" style="padding:4px 8px;font-size:10px">In Garage</span>':btn('Acquire',`buyVehicle('${v.id}')`,'primary','class="btn btn-primary btn-sm"')}
              </div>
            </div>
          </div>
        `)).join('')}
      </div>
    </section>`;
  }

  function vehicleDetail(id) {
    const v = DATA.vehicles.find(x => x.id === id);
    if (!v) return;
    modal(`${v.name} (${v.type})`, `
      <div style="text-align:center;padding:12px">
        <div style="font-size:64px;margin-bottom:12px">${v.icon}</div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          ${[['Top Speed', v.speed + ' KM/H'], ['Handling', v.handling + '/100'], ['Acceleration', v.acceleration + '/100']].map(([l, val]) => `
            <div style="flex:1;padding:10px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);text-align:center">
              <div class="metric-label">${l}</div>
              <div style="font-size:16px;font-weight:900;color:#22d3ee;margin-top:2px">${val}</div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px">
          ${btn('🏎️ Spawn & Drive on Island', `closeModal();driveVehicle('${v.id}')`, 'gold', 'style="flex:1"')}
          ${btn('Close', 'closeModal()', 'ghost')}
        </div>
      </div>
    `);
  }
  function buyVehicle(id) {
    const v = DATA.vehicles.find(x => x.id === id);
    if (!v) return;
    if (state.wallet < v.price) return toast('Insufficient ISL.','warn');
    state.wallet -= v.price;
    if (!state.ownedVehicles.includes(id)) state.ownedVehicles.push(id);
    state.activeVehicle = id;
    state.transactions.unshift({id:uid('tx'),description:`Acquired ${v.name}`,amount:-v.price,type:'Purchase',date:'Just now',status:'Settled'});
    award(50, 25, `Acquired ${v.name}`);
    toast(`🏎️ ${v.name} added to your garage!`, 'success');
    save();
    refresh();
  }
  function driveVehicle(id) {
    const vId = id || state.activeVehicle || 'v1';
    state.activeVehicle = vId;
    state.worldMode = 'drive';
    if (!state.ownedVehicles.includes(vId)) state.ownedVehicles.push(vId);
    save();
    playBeep('engine');
    toast(`🏎️ Driving ${DATA.vehicles.find(v=>v.id===vId)?.name || 'vehicle'} in free-roam mode!`, 'success');
    nav(`island.html?drive=${vId}`);
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
            <button onclick="selectConversation('${c.user.id}')" style="width:100%;padding:14px;display:flex;align-items:center;gap:10px;border:none;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;transition:all 0.2s;background:${c.user.id===sel?'rgba(6,182,212,0.06)':'transparent'};text-align:left" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='${c.user.id===sel?'rgba(6,182,212,0.06)':'transparent'}'">
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
                  <div style="max-width:70%;padding:10px 14px;border-radius:14px;font-size:12px;font-weight:600;${m.mine?'background:rgba(6,182,212,0.12);color:#22d3ee;border-bottom-right-radius:4px':'background:rgba(255,255,255,0.05);color:var(--text-secondary);border-bottom-left-radius:4px'}">${esc(m.text)}</div>
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
              <div style="flex:1;padding:8px;border-radius:10px;background:rgba(255,255,255,0.03);text-align:center"><div class="metric-label">Best</div><div style="font-size:16px;font-weight:900;margin-top:2px;color:#22d3ee">${stats.best}</div></div>
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
          <div style="font-size:48px;font-weight:900;color:#22d3ee;margin:20px 0">${score}</div>
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
          ${Array.from({length:12},(_,i)=>`<button onclick="pearlPing(${i})" id="pearl-${i}" style="width:60px;height:60px;border-radius:14px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.15);font-size:24px;cursor:pointer;transition:all 0.2s">🌊</button>`).join('')}
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
        modal('🧠 Results',`<div style="text-align:center"><div style="font-size:36px;font-weight:900;color:#22d3ee">${correct}/${qs.length}</div><p style="color:var(--text-muted);margin:12px 0">Questions answered correctly.</p>${btn('Close','closeModal()','primary')}</div>`);
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
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Treasury','Wallet & Transactions','Manage your ISL balance and transaction history.',btn('+ Demo Funds','demoFunds(2500)','gold'))}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
        ${metric('Balance', money(state.wallet), aed(state.wallet), '◈')}
        ${metric('Transactions', state.transactions.length, 'All-time ledger', '📜')}
        ${metric('Membership', state.membership, 'Active tier', '🎖️')}
      </div>
      ${card(`<div style="padding:20px"><div style="font-size:14px;font-weight:900;margin-bottom:14px">Transaction Ledger</div><div style="display:flex;flex-direction:column;gap:6px">${state.transactions.slice(0,12).map(t=>`<div style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;align-items:center;font-size:12px"><div><div style="font-weight:700">${esc(t.description)}</div><div style="font-size:10px;color:var(--text-dim);margin-top:2px">${t.date} · ${t.type}</div></div><div style="font-weight:800;color:${t.amount>=0?'#34d399':'#fb7185'}">${t.amount>=0?'+':''}${money(t.amount)}</div></div>`).join('')}</div></div>`)}
    </section>`;
  }

  /* PROFILE */
  function profile() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Identity','Resident Profile','Your public identity on Nexus Island.',btn('Edit Profile','editProfile()','ghost'))}
      ${card(`<div style="padding:28px">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,rgba(6,182,212,0.12),rgba(99,102,241,0.08));display:grid;place-items:center;font-size:40px;border:2px solid rgba(6,182,212,0.2)">${state.user.avatar}</div>
          <div>
            <div style="font-size:22px;font-weight:900">${esc(state.user.name)}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">@${esc(state.user.username)} · ${esc(state.user.country)}</div>
            <div style="font-size:11px;color:#22d3ee;font-weight:700;margin-top:4px">${esc(state.user.title)} · Level ${state.user.level}</div>
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
          <div style="padding:12px 16px;border-radius:14px;background:${n.read?'rgba(255,255,255,0.01)':'rgba(6,182,212,0.04)'};border:1px solid ${n.read?'rgba(255,255,255,0.04)':'rgba(6,182,212,0.1)'};display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;transition:all 0.2s" onclick="readOne('${n.id}')" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='${n.read?'rgba(255,255,255,0.01)':'rgba(6,182,212,0.04)'}'">
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
      ${pageHeader('Financial Engine','12 Revenue Streams & Unit Economics','Interactive model showing how Nexus Island monetizes.')}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
        ${[['Citizen Memberships','$9.99/mo premium tier','👤'],['Creator Take-Rate','5% marketplace commission','🎨'],['Land Title Leases','Commercial ground rent','🏝️'],['Enterprise Branches','$2,500/mo virtual flagships','🏢'],['Event Hosting','Premium staged broadcasts','🎭'],['Advertising','Non-intrusive brand integration','📢'],['AI Services','NOVA premium features','🧠'],['Vehicle Economy','Transit & racing fees','🏎️'],['Education','Interactive courses','📚'],['Custom Worlds','Private realm hosting','🌐'],['Developer API','Platform access fees','⚙️'],['Licensing','White-label technology','📋']].map(([name,desc,ic])=>
          card(`<div style="padding:18px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:36px;height:36px;border-radius:10px;background:rgba(6,182,212,0.08);display:grid;place-items:center;font-size:18px">${ic}</div><div style="font-size:13px;font-weight:800">${name}</div></div><p style="font-size:11px;color:var(--text-muted)">${desc}</p></div>`)
        ).join('')}
      </div>
      ${card(`<div style="padding:24px">
        <div style="font-size:15px;font-weight:900;margin-bottom:16px">Interactive Unit Economics</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div><div class="metric-label" style="margin-bottom:6px">Monthly Active Users</div><input type="range" min="10000" max="500000" value="100000" oninput="unitCalc()" id="mauSlider" style="width:100%;accent-color:#06b6d4"><div style="font-size:14px;font-weight:800;margin-top:4px" id="mauLabel">100,000 MAU</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px" id="unitResults">
            <div class="metric-card"><div class="metric-label">MRR</div><div class="metric-value" style="color:#22d3ee">$125K</div></div>
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
      <div class="metric-card"><div class="metric-label">MRR</div><div class="metric-value" style="color:#22d3ee">$${(mrr/1000).toFixed(0)}K</div></div>
      <div class="metric-card"><div class="metric-label">ARR</div><div class="metric-value" style="color:#34d399">$${(arr/1000000).toFixed(1)}M</div></div>
      <div class="metric-card"><div class="metric-label">Gross Margin</div><div class="metric-value" style="color:#fbbf24">82%</div></div>
    `;
  }

  /* FUTURE / WHY NEXUS / ALPHA / ADMIN — Compact Implementations */
  function future() {
    return `<section class="fade" style="display:flex;flex-direction:column;gap:16px">
      ${pageHeader('Vision','Spatial Roadmap','The long-term evolution from browser-first to fully immersive.')}
      ${[['Q4 2026','Closed Alpha → Open Beta with 5,000 users + WebGL 3D district views'],['Q1 2027','Mobile companion app + Creator SDK + 50 registered creators'],['Q2 2027','Enterprise virtual branches + Government pilot programs'],['Q3 2027','Series A raise + VR/AR spatial extension + International expansion'],['2028+','Programmable world + 100K+ MAU + Full spatial computing integration']].map(([period,desc])=>
        card(`<div style="padding:18px;display:flex;align-items:start;gap:14px"><div style="width:10px;height:10px;border-radius:50%;background:#06b6d4;margin-top:5px;flex-shrink:0;box-shadow:0 0 8px rgba(6,182,212,0.4)"></div><div><div style="font-size:13px;font-weight:800">${period}</div><p style="font-size:12px;color:var(--text-muted);margin-top:4px;line-height:1.5">${desc}</p></div></div>`)
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
        <div style="padding:14px;border-radius:14px;background:linear-gradient(135deg,rgba(6,182,212,0.06),rgba(99,102,241,0.04));border:1px solid rgba(6,182,212,0.12)">
          <div style="font-size:12px;font-weight:800;color:#22d3ee;margin-bottom:6px">Context-Aware Recommendations</div>
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

  // Plaza-related stubs for backward compat
  function walkToPlazaPoint() {}
  function submitDistrictSay() {}
  function sendDistrictEmote() {}
  function waveAtPeer() {}
  function inspectPeer() {}
  function tipPeer() {}

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
        ${[['1. Choose Plot','Select the vacant land next to yours','🏝️','rgba(6,182,212,0.08)'],
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
                <div style="font-size:14px;font-weight:900;color:#22d3ee">${money(l.price)}</div>
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
    const netWorth = state.wallet + state.ownedLand.length * 800 + state.ownedProperties.length * 1200 + state.ownedVehicles.length * 600 + state.inventory.length * 50;
    const totalVisitors = state.home.visitorsNow * 47 + state.home.upvotes * 12;
    const assetCount = state.ownedLand.length + state.ownedProperties.length + state.ownedVehicles.length + state.inventory.length;
    const tier = netWorth >= 10000 ? 'Platinum' : netWorth >= 5000 ? 'Gold' : netWorth >= 2000 ? 'Silver' : 'Bronze';
    const tierColors = { Platinum:'linear-gradient(135deg,#e2e8f0,#94a3b8,#64748b)', Gold:'linear-gradient(135deg,#fbbf24,#d97706,#92400e)', Silver:'linear-gradient(135deg,#94a3b8,#64748b,#475569)', Bronze:'linear-gradient(135deg,#d97706,#92400e,#78350f)' };

    return `<section class="fade" style="display:flex;flex-direction:column;gap:20px">
      ${pageHeader('Social Sharing','Island Flex Card','Generate a stunning status card to share on Instagram, WhatsApp & social media.',btn('📲 Share Now','shareFlexCard()','gold'))}

      <!-- Preview Card -->
      <div style="max-width:500px;margin:0 auto;width:100%">
        <div id="flexCardPreview" style="aspect-ratio:1.586;border-radius:20px;padding:32px;position:relative;overflow:hidden;background:${tierColors[tier]};box-shadow:0 20px 60px -10px rgba(0,0,0,0.5),0 0 40px -10px rgba(245,158,11,0.2)">
          <!-- Card Pattern Overlay -->
          <div style="position:absolute;inset:0;opacity:0.08;background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.1) 20px,rgba(255,255,255,0.1) 21px)"></div>

          <!-- Card Content -->
          <div style="position:relative;z-index:1;height:100%;display:flex;flex-direction:column;justify-content:space-between;color:#fff">
            <!-- Top Row -->
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;opacity:0.8;font-weight:700">Nexus Island · Abu Dhabi</div>
                <div style="font-size:22px;font-weight:900;margin-top:4px;letter-spacing:-0.02em">${esc(state.user.name)}</div>
                <div style="font-size:11px;opacity:0.7;font-weight:600;margin-top:2px">@${esc(state.user.username)} · Level ${state.user.level}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:32px">${state.user.avatar}</div>
                <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.2)">${tier}</div>
              </div>
            </div>

            <!-- Center Stats -->
            <div style="display:flex;gap:16px;justify-content:center;margin:auto 0">
              ${[['Net Worth',money(netWorth)],['Assets',assetCount],['Visitors',totalVisitors.toLocaleString()],['Rep',state.user.reputation]].map(([l,v]) => `
                <div style="text-align:center">
                  <div style="font-size:18px;font-weight:900;letter-spacing:-0.02em">${v}</div>
                  <div style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.6;margin-top:2px">${l}</div>
                </div>
              `).join('')}
            </div>

            <!-- Bottom Row -->
            <div style="display:flex;justify-content:space-between;align-items:end">
              <div style="font-size:9px;opacity:0.5;font-family:'JetBrains Mono',monospace">NX-${state.user.id.slice(0,8).toUpperCase()}</div>
              <div style="font-size:9px;opacity:0.5">${new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'})}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Style Selector -->
      <div style="display:flex;justify-content:center;gap:8px;margin-top:-8px">
        ${[['black','⬛'],['gold','🟡'],['ocean','🔵'],['sunset','🟠']].map(([style,ic]) => `
          <button onclick="setFlexStyle('${style}')" style="width:40px;height:40px;border-radius:12px;border:2px solid ${state.flexCardStyle===style?'#22d3ee':'rgba(255,255,255,0.1)'};background:rgba(255,255,255,0.04);font-size:18px;display:grid;place-items:center;cursor:pointer;transition:all 0.2s">${ic}</button>
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
              <div style="width:40px;height:40px;border-radius:12px;background:rgba(6,182,212,0.08);display:grid;place-items:center;font-size:20px;flex-shrink:0">
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
  initWorldEngine();

  /* ─── GLOBAL BINDINGS ─── */
  if (typeof window !== 'undefined') {
    window.S=state; window.DATA=DATA; window.save=save; window.nav=nav; window.demo=demo; window.login=login; window.register=register; window.forgot=forgot; window.onboard=onboard; window.nova=nova; window.askNOVA=askNOVA; window.search=search; window.searchResults=searchResults; window.closeModal=closeModal; window.toast=toast; window.zone=zone; window.setMapTheme=setMapTheme; window.landDetail=landDetail; window.filterLand=filterLand; window.wish=wish; window.buyLand=buyLand; window.confirmLand=confirmLand; window.demoFunds=demoFunds; window.propertyDetail=propertyDetail; window.buyProperty=buyProperty; window.buildHome=buildHome; window.confirmHomeBuild=confirmHomeBuild; window.openRoomDesigner=openRoomDesigner; window.placeDecor=placeDecor; window.editHome=editHome; window.saveHomeDetails=saveHomeDetails; window.filterMarket=filterMarket; window.showInventory=showInventory; window.productDetail=productDetail; window.addCart=addCart; window.changeQty=changeQty; window.cart=cart; window.checkout=checkout; window.openCreatorStudio=openCreatorStudio; window.publishCreatorAsset=publishCreatorAsset; window.createBusiness=createBusiness; window.createBusinessSave=createBusinessSave; window.toggleFollow=toggleFollow; window.vehicleDetail=vehicleDetail; window.buyVehicle=buyVehicle; window.driveVehicle=driveVehicle; window.openPeople=openPeople; window.sendRequest=sendRequest; window.acceptRequest=acceptRequest; window.declineRequest=declineRequest; window.person=person; window.blockUser=blockUser; window.selectConversation=selectConversation; window.msg=msg; window.sendMessage=sendMessage; window.toggleCommunity=toggleCommunity; window.toggleRsvp=toggleRsvp; window.enterLiveStage=enterLiveStage; window.playGame=playGame; window.droneTap=droneTap; window.pearlPing=pearlPing; window.answerTycoon=answerTycoon; window.editProfile=editProfile; window.saveProfile=saveProfile; window.readOne=readOne; window.readAll=readAll; window.clearRead=clearRead; window.toggleSetting=toggleSetting; window.setSetting=setSetting; window.confirmReset=confirmReset; window.resetDemo=resetDemo; window.signOut=signOut; window.tour=tour; window.openPitchDeck=openPitchDeck; window.openMobileMenu=openMobileMenu; window.unitCalc=unitCalc; window.getWaitlist=getWaitlist; window.submitWaitlist=submitWaitlist; window.copyWaitlistRef=copyWaitlistRef; window.exportWaitlistCSV=exportWaitlistCSV; window.openAlphaJoinModal=openAlphaJoinModal; window.submitAlphaJoin=submitAlphaJoin; window.openAlphaFeedbackModal=openAlphaFeedbackModal; window.setAlphaStar=setAlphaStar; window.submitAlphaFeedback=submitAlphaFeedback; window.openAlphaInviteModal=openAlphaInviteModal; window.exportAlphaTelemetryCSV=exportAlphaTelemetryCSV; window.simulateAlphaSession=simulateAlphaSession; window.getAlphaTelemetry=getAlphaTelemetry; window.setRoomAmbiance=setRoomAmbiance; window.upvoteMyRoom=upvoteMyRoom; window.toggleRoomOpenHouse=toggleRoomOpenHouse; window.equipRoomSlot=equipRoomSlot; window.tryInRoom=tryInRoom; window.buyAndPlaceInRoom=buyAndPlaceInRoom; window.openShareRoomModal=openShareRoomModal; window.openSignGuestbookModal=openSignGuestbookModal; window.submitGuestbookEntry=submitGuestbookEntry; window.inspectCommunityRoom=inspectCommunityRoom; window.shopRoomBundle=shopRoomBundle; window.walkToPlazaPoint=walkToPlazaPoint; window.submitDistrictSay=submitDistrictSay; window.sendDistrictEmote=sendDistrictEmote; window.waveAtPeer=waveAtPeer; window.inspectPeer=inspectPeer; window.tipPeer=tipPeer; window.launchMultiplayerDemo=launchMultiplayerDemo; window.openNeighborInviteModal=openNeighborInviteModal; window.submitNeighborInvite=submitNeighborInvite; window.sendNeighborInvite=sendNeighborInvite; window.showNeighborInvites=showNeighborInvites; window.viewMyNeighborhood=viewMyNeighborhood; window.setFlexStyle=setFlexStyle; window.copyFlexCard=copyFlexCard; window.shareFlexCard=shareFlexCard; window.shareFlexWhatsApp=shareFlexWhatsApp; window.shareFlexInstagram=shareFlexInstagram; window.shareFlexTwitter=shareFlexTwitter; window.openHideTreasureModal=openHideTreasureModal; window.submitHideTreasure=submitHideTreasure; window.attemptTreasure=attemptTreasure; window.openTreasureMap=openTreasureMap; window.shareGuestbook=shareGuestbook; window.setWorldLayer=setWorldLayer; window.toggleWorldMode=toggleWorldMode; window.zoomWorld=zoomWorld; window.recenterWorld=recenterWorld; window.searchWorldPois=searchWorldPois; window.selectWorldPoi=selectWorldPoi; window.spawnVehicleInWorld=spawnVehicleInWorld; window.cycleRadio=cycleRadio; window.startWorldMission=startWorldMission; window.cancelWorldMission=cancelWorldMission; window.triggerGtaInteract=triggerGtaInteract; window.enterWorldBusiness=enterWorldBusiness; window.inspectWorldDeed=inspectWorldDeed; window.accessWorldAtm=accessWorldAtm; window.touchControlPress=touchControlPress; window.touchControlRelease=touchControlRelease;
  }
})();
