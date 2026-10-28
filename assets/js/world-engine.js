/* ═══════════════════════════════════════════════════════════════
   NEXUS ISLAND — 3D Spatial World Engine v2.0
   True 3D Isometric / Perspective Open-World UAE Archipelago
   3D Extruded Islands · 3D Skyscrapers & Villas · 3D Suspension Bridges
   GTA-Style Driving & Walking · Zero External Dependencies
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ─── CONFIGURATION ─── */
  const WORLD_W = 2000;
  const WORLD_H = 1500;
  const CAM_LERP = 0.09;
  const PLAYER_SPEED = 2.8;
  const SPRINT_MULT = 1.85;
  const INTERACT_RANGE = 60;
  const NPC_PER_DISTRICT = 3;
  const ZOOM_MIN = 0.35;
  const ZOOM_MAX = 3.0;
  const ZOOM_STEP = 0.12;
  const ISLAND_ELEVATION = 16;
  const BRIDGE_ELEVATION = 22;

  /* ─── ISLAND SHAPE DATA (World Coordinates — 5 Active UAE Islands + Islands 6–10 Expansion) ─── */
  const ISLANDS = [
    {
      id: 'nexus-main', name: 'Island 1: ADGM, Hub71 & Harbor Main',
      desc: 'Primary UAE sovereign hub — ADGM Financial Core, Hub71 Campus, Harbor Marina & International Skyport.',
      cx: 600, cy: 450, radius: 240, biome: 'tropical-urban',
      fillColors: ['#86efac', '#4ade80', '#22c55e', '#15803d'],
      cliffColor: '#334155',
      shape: [
        {x:450,y:315},{x:480,y:290},{x:540,y:270},{x:600,y:281},{x:660,y:270},{x:720,y:290},
        {x:765,y:315},{x:800,y:355},{x:825,y:390},{x:818,y:435},{x:833,y:480},{x:810,y:525},
        {x:780,y:555},{x:740,y:580},{x:705,y:600},{x:660,y:608},{x:600,y:623},{x:570,y:615},
        {x:525,y:608},{x:480,y:593},{x:450,y:563},{x:420,y:533},{x:390,y:495},{x:383,y:450},
        {x:375,y:405},{x:398,y:360},{x:420,y:338},{x:439,y:321}
      ]
    },
    {
      id: 'nurai-cove', name: 'Island 2: Emaar Palm & Nurai Villas',
      desc: 'Luxury residential district — Emaar villa developments, beachfront plots, private yacht berths & majlis estates.',
      cx: 1100, cy: 280, radius: 95, biome: 'luxury-resort', unlockLevel: 0,
      fillColors: ['#fde68a', '#fbbf24', '#f59e0b', '#b45309'],
      cliffColor: '#78350f',
      shape: [
        {x:1030,y:250},{x:1055,y:225},{x:1090,y:210},{x:1130,y:215},{x:1160,y:235},
        {x:1175,y:265},{x:1180,y:300},{x:1170,y:330},{x:1145,y:350},{x:1110,y:355},
        {x:1075,y:345},{x:1045,y:320},{x:1030,y:290},{x:1025,y:265}
      ]
    },
    {
      id: 'yas-arena', name: 'Island 3: Yas Motorsport & Auto Hub',
      desc: 'GTA motorsport & dealership district — Prestige Supercar Showroom, Grand Prix circuit & esports stadium.',
      cx: 250, cy: 750, radius: 110, biome: 'neon-entertainment', unlockLevel: 0,
      fillColors: ['#c4b5fd', '#a78bfa', '#8b5cf6', '#6d28d9'],
      cliffColor: '#3b0764',
      shape: [
        {x:170,y:710},{x:200,y:680},{x:240,y:665},{x:285,y:670},{x:320,y:690},
        {x:345,y:720},{x:355,y:760},{x:345,y:800},{x:320,y:825},{x:280,y:835},
        {x:240,y:830},{x:200,y:810},{x:175,y:780},{x:165,y:745}
      ]
    },
    {
      id: 'masdar-atoll', name: 'Island 4: Masdar AI & Saadiyat Arts',
      desc: 'Clean-tech & cultural district — NOVA AI Quantum Spire, Louvre Crystal Pavilion & creator studios.',
      cx: 1350, cy: 650, radius: 80, biome: 'sci-fi-futuristic', unlockLevel: 0,
      fillColors: ['#67e8f9', '#22d3ee', '#06b6d4', '#0891b2'],
      cliffColor: '#164e63',
      shape: [
        {x:1290,y:620},{x:1315,y:598},{x:1350,y:590},{x:1385,y:598},{x:1410,y:620},
        {x:1420,y:650},{x:1415,y:680},{x:1395,y:705},{x:1365,y:715},{x:1335,y:715},
        {x:1305,y:705},{x:1285,y:680},{x:1280,y:650}
      ]
    },
    {
      id: 'mangrove-sanctuary', name: 'Island 5: LuLu Mall & Mangrove Eco',
      desc: 'Retail & eco-sanctuary district — LuLu Virtual Hypermarket, Galleria Shopping Mall & mangrove boardwalks.',
      cx: 850, cy: 900, radius: 100, biome: 'nature-reserve', unlockLevel: 0,
      fillColors: ['#86efac', '#34d399', '#10b981', '#047857'],
      cliffColor: '#064e3b',
      shape: [
        {x:775,y:860},{x:805,y:835},{x:845,y:825},{x:890,y:830},{x:925,y:850},
        {x:945,y:885},{x:950,y:920},{x:935,y:955},{x:905,y:975},{x:865,y:980},
        {x:825,y:970},{x:790,y:945},{x:770,y:910},{x:770,y:880}
      ]
    }
  ];

  /* ─── INTER-ISLAND GTA CAUSEWAY BRIDGES (Drivable 3D Suspension Highway Links) ─── */
  const BRIDGES = [
    { id: 'bridge-emaar', name: 'Emaar Palm Causeway', from: {x:765, y:350}, to: {x:1045, y:295}, width: 32, color: '#38bdf8' },
    { id: 'bridge-yas', name: 'Yas Grand Prix Highway Bridge', from: {x:445, y:525}, to: {x:315, y:705}, width: 32, color: '#a855f7' },
    { id: 'bridge-masdar', name: 'Masdar Quantum Causeway', from: {x:805, y:505}, to: {x:1300, y:645}, width: 32, color: '#22d3ee' },
    { id: 'bridge-lulu', name: 'LuLu Marina Causeway', from: {x:670, y:595}, to: {x:835, y:845}, width: 32, color: '#34d399' },
    { id: 'bridge-east-ring', name: 'Saadiyat-Nurai Skybridge', from: {x:1145, y:340}, to: {x:1340, y:600}, width: 26, color: '#fbbf24' }
  ];

  /* ─── FUTURE EXPANSION ISLANDS (Islands 6–10+ 3D Holographic Reclamation Cylinders) ─── */
  const EXPANSION_ISLANDS = [
    { id: 'exp-dubai-burj', name: 'Island 6: Dubai Burj Frontier (Expansion)', x: 1580, y: 240, radius: 75, phase: 'Wave 2' },
    { id: 'exp-al-maryah', name: 'Island 7: Al Maryah Banking Atoll (Expansion)', x: 300, y: 210, radius: 70, phase: 'Wave 2' },
    { id: 'exp-saadiyat-north', name: 'Island 8: Saadiyat Couture Isle (Expansion)', x: 1650, y: 920, radius: 75, phase: 'Wave 3' },
    { id: 'exp-jebel-ali', name: 'Island 9: Jebel Ali Trade Port (Expansion)', x: 240, y: 1120, radius: 80, phase: 'Wave 3' },
    { id: 'exp-al-ain-oasis', name: 'Island 10: Al Ain Oasis Sanctuary (Expansion)', x: 1220, y: 1150, radius: 75, phase: 'Wave 4' }
  ];

  /* ─── DISTRICT WORLD POSITIONS ─── */
  const DISTRICT_POS = {
    harbor:      { x: 476, y: 376, island: 'nexus-main' },
    creator:     { x: 686, y: 355, island: 'nexus-main' },
    gaming:      { x: 522, y: 499, island: 'nexus-main' },
    downtown:    { x: 705, y: 468, island: 'nexus-main' },
    residential: { x: 604, y: 545, island: 'nexus-main' },
    nature:      { x: 448, y: 524, island: 'nexus-main' },
    future:      { x: 741, y: 552, island: 'nexus-main' }
  };

  /* ─── 3D ARCHITECTURAL SKYLINE & BUILDINGS (Extruded 3D Meshes) ─── */
  const BUILDINGS_3D = [
    // Island 1: ADGM Financial Core & Hub71 Skyscrapers
    { id: 'adgm-hq', name: 'ADGM Sovereign Tower', x: 705, y: 450, w: 34, d: 34, h: 135, top: '#38bdf8', left: '#0284c7', right: '#0369a1', roof: 'spire', neon: '#22d3ee', windows: true },
    { id: 'adgm-north', name: 'Al Maryah Exchange', x: 670, y: 438, w: 26, d: 26, h: 95, top: '#60a5fa', left: '#2563eb', right: '#1d4ed8', roof: 'helipad', neon: '#38bdf8', windows: true },
    { id: 'adgm-south', name: ' Sovereign Escrow Vault', x: 735, y: 432, w: 24, d: 24, h: 82, top: '#93c5fd', left: '#3b82f6', right: '#1e40af', roof: 'flat', neon: '#60a5fa', windows: true },
    { id: 'hub71-campus', name: 'Hub71 Tech Ecosystem HQ', x: 735, y: 485, w: 38, d: 30, h: 72, top: '#818cf8', left: '#4f46e5', right: '#3730a3', roof: 'helipad', neon: '#a5b4fc', windows: true },
    { id: 'skyport-term', name: 'UAE International Skyport', x: 580, y: 305, w: 54, d: 26, h: 46, top: '#f8fafc', left: '#94a3b8', right: '#64748b', roof: 'spire', neon: '#fbbf24', windows: true },
    { id: 'harbor-marina-1', name: 'Marina Yacht Club', x: 460, y: 360, w: 30, d: 22, h: 44, top: '#2dd4bf', left: '#0d9488', right: '#115e59', roof: 'flat', neon: '#5eead4', windows: true },
    { id: 'harbor-marina-2', name: 'Corniche Pearl Tower', x: 495, y: 395, w: 24, d: 24, h: 78, top: '#38bdf8', left: '#0369a1', right: '#0c4a6e', roof: 'spire', neon: '#22d3ee', windows: true },
    { id: 'creator-atelier', name: 'Saadiyat Creator Pavilion', x: 686, y: 355, w: 36, d: 36, h: 52, top: '#f472b6', left: '#db2777', right: '#9d174d', roof: 'dome', neon: '#f9a8d4', windows: false },
    { id: 'gaming-nexus', name: 'Nexus Cyber Colosseum', x: 522, y: 499, w: 40, d: 40, h: 56, top: '#c084fc', left: '#7e22ce', right: '#581c87', roof: 'dome', neon: '#d8b4fe', windows: true },
    { id: 'res-villa-main', name: 'Citizen Coastal Villa L-101', x: 604, y: 545, w: 30, d: 26, h: 34, top: '#fde047', left: '#ca8a04', right: '#854d0e', roof: 'villa', neon: '#fef08a', windows: false },
    { id: 'future-lab', name: 'Masdar Quantum Node', x: 741, y: 552, w: 28, d: 28, h: 88, top: '#22d3ee', left: '#0891b2', right: '#155e75', roof: 'spire', neon: '#67e8f9', windows: true },

    // Island 2: Emaar Palm & Nurai Villas
    { id: 'emaar-pavilion', name: 'Emaar Developments HQ', x: 1105, y: 270, w: 38, d: 32, h: 76, top: '#fbbf24', left: '#d97706', right: '#92400e', roof: 'spire', neon: '#fde68a', windows: true },
    { id: 'emaar-villa-1', name: 'Emaar Signature Beach Villa', x: 1060, y: 295, w: 26, d: 22, h: 28, top: '#fef3c7', left: '#d97706', right: '#92400e', roof: 'villa', neon: '#fbbf24', windows: false },
    { id: 'emaar-villa-2', name: 'Nurai Royal Overwater Villa', x: 1140, y: 305, w: 26, d: 22, h: 30, top: '#fef3c7', left: '#b45309', right: '#78350f', roof: 'villa', neon: '#fbbf24', windows: false },
    { id: 'emaar-villa-3', name: 'Palm Crown Penthouse', x: 1100, y: 232, w: 28, d: 24, h: 54, top: '#fde68a', left: '#ca8a04', right: '#854d0e', roof: 'helipad', neon: '#fef08a', windows: true },

    // Island 3: Yas Motorsport & Auto Hub
    { id: 'prestige-motors', name: 'Prestige Supercar Showroom', x: 255, y: 740, w: 44, d: 32, h: 52, top: '#a855f7', left: '#7e22ce', right: '#4c1d95', roof: 'helipad', neon: '#e879f9', windows: true },
    { id: 'yas-stadium', name: 'Yas Grand Prix & Esports Arena', x: 215, y: 785, w: 46, d: 36, h: 48, top: '#f43f5e', left: '#be123c', right: '#881337', roof: 'dome', neon: '#fda4af', windows: true },
    { id: 'yas-control', name: 'Yas Telemetry Tower', x: 295, y: 710, w: 22, d: 22, h: 92, top: '#c084fc', left: '#6b21a8', right: '#3b0764', roof: 'spire', neon: '#d8b4fe', windows: true },

    // Island 4: Masdar AI & Saadiyat Arts
    { id: 'nova-ai-spire', name: 'NOVA AI Quantum Spire', x: 1350, y: 645, w: 30, d: 30, h: 155, top: '#22d3ee', left: '#0891b2', right: '#164e63', roof: 'spire', neon: '#67e8f9', windows: true },
    { id: 'louvre-dome', name: 'Louvre Saadiyat Crystal Dome', x: 1315, y: 678, w: 38, d: 38, h: 42, top: '#e2e8f0', left: '#64748b', right: '#334155', roof: 'dome', neon: '#38bdf8', windows: false },

    // Island 5: LuLu Hypermarket & Galleria Mall
    { id: 'lulu-hypermarket', name: 'LuLu Virtual Hypermarket HQ', x: 855, y: 890, w: 50, d: 36, h: 54, top: '#34d399', left: '#059669', right: '#064e3b', roof: 'helipad', neon: '#6ee7b7', windows: true },
    { id: 'galleria-mall', name: 'The Galleria Luxury Mall', x: 890, y: 930, w: 44, d: 32, h: 48, top: '#fbbf24', left: '#d97706', right: '#78350f', roof: 'dome', neon: '#fde68a', windows: true }
  ];

  /* ─── 3D PALM TREES & YACHTS ─── */
  const TREES_3D = [
    {x:435,y:395},{x:445,y:470},{x:430,y:515},{x:465,y:545},{x:580,y:575},{x:635,y:570},
    {x:1045,y:265},{x:1080,y:325},{x:1150,y:260},{x:1130,y:330},
    {x:800,y:875},{x:825,y:935},{x:915,y:875},{x:865,y:955},
    {x:1380,y:625},{x:1385,y:685},{x:200,y:730},{x:315,y:780}
  ];

  /* ─── ROAD NETWORK ─── */
  const ROADS = [
    // Main island ring road
    { from: {x:476,y:376}, to: {x:580,y:340}, width: 4 },
    { from: {x:580,y:340}, to: {x:686,y:355}, width: 4 },
    { from: {x:686,y:355}, to: {x:705,y:468}, width: 4 },
    { from: {x:705,y:468}, to: {x:741,y:552}, width: 3 },
    { from: {x:741,y:552}, to: {x:604,y:545}, width: 3 },
    { from: {x:604,y:545}, to: {x:522,y:499}, width: 4 },
    { from: {x:522,y:499}, to: {x:448,y:524}, width: 3 },
    { from: {x:448,y:524}, to: {x:420,y:440}, width: 3 },
    { from: {x:420,y:440}, to: {x:476,y:376}, width: 4 },
    // Cross roads
    { from: {x:522,y:499}, to: {x:705,y:468}, width: 3 },
    { from: {x:604,y:545}, to: {x:705,y:468}, width: 3 },
    { from: {x:476,y:376}, to: {x:522,y:499}, width: 3 },
    { from: {x:580,y:340}, to: {x:604,y:450}, width: 2 },
    { from: {x:604,y:450}, to: {x:604,y:545}, width: 2 }
  ];

  /* ─── NPC DIALOGUES ─── */
  const NPC_SPEECH = [
    'The 3D skyline of Al Maryah looks incredible! 🌆',
    'Just drove across the Emaar Palm Causeway! 🏎️',
    'The Grand Prix starts soon on Island 3! 🏁',
    'ADGM just verified my property escrow deed! 🏛️',
    'Claimed my 15% LuLu Hypermarket voucher! 🛒',
    'Built an Emaar Beach Villa on my plot! 🏗️',
    'The NOVA AI Quantum Spire is glowing tonight ⚡',
    'Upgraded to the 10-Year UAE Golden Visa! 🛂',
    'Anyone up for racing to Yas Island? 🎮',
    'Hub71 just approved our 500 ISL startup grant! 🚀'
  ];

  /* ─── ENGINE STATE ─── */
  let engine = null;
  const keys = {};
  let lastFrameTime = 0;
  let animTime = 0;

  /* ─── PLAYER STATE ─── */
  const player = {
    x: 604, y: 500,       // World position
    z: ISLAND_ELEVATION,  // 3D Elevation
    vx: 0, vy: 0,
    dir: 'south',
    moving: false,
    sprinting: false,
    inVehicle: null,
    vehicleAngle: 0,
    vehicleSpeed: 0,
    stepTimer: 0
  };

  /* ─── NPC ENTITIES & POI REGISTRY ─── */
  let npcs = [];
  let pois = [];
  let nearestPOI = null;

  /* ═══════════════════════════════════════════════
     3D MAP ENGINE CLASS
     ═══════════════════════════════════════════════ */
  class MapEngine {
    constructor(canvas) {
      console.log('[NexusEngine] Constructing 3D MapEngine...');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.minimapCanvas = document.getElementById('nexus-minimap');
      this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // 3D Mode enabled by default!
      this.is3D = true;
      this.cam = { x: 640, y: 470, zoom: 0.92, pitch: 0.54, yaw: -0.32 };
      this.camTarget = { x: 640, y: 470, zoom: 0.92, pitch: 0.54, yaw: -0.32 };

      this.W = 0;
      this.H = 0;

      // Input state
      this.dragging = false;
      this.orbiting = false;
      this.dragMoved = false;
      this.dragStart = { x: 0, y: 0 };
      this.camDragStart = { x: 0, y: 0, yaw: 0, pitch: 0 };
      this.pinchDist = 0;
      this.mouseWorld = { x: 0, y: 0 };

      // Day/Night
      this.timeOfDay = 0;

      // Animation
      this.running = false;
      this.frameId = null;
      this.waveOffset = 0;

      this.resize();
      this.setupInput();

      try { this.buildPOIs(); } catch (e) { console.warn('[NexusEngine] buildPOIs error:', e); }
      try { this.spawnNPCs(); } catch (e) { console.warn('[NexusEngine] spawnNPCs error:', e); }

      const st = window.S;
      if (st && st.currentDistrict && DISTRICT_POS[st.currentDistrict]) {
        const dp = DISTRICT_POS[st.currentDistrict];
        player.x = dp.x;
        player.y = dp.y;
      }
      this.camTarget.x = player.x;
      this.camTarget.y = player.y;
      this.cam.x = player.x;
      this.cam.y = player.y;

      const theme = st?.settings?.mapTheme || 'day';
      if (theme === 'sunset') this.timeOfDay = 0.33;
      else if (theme === 'night') this.timeOfDay = 0.66;
      else this.timeOfDay = 0;
    }

    resize() {
      const wrap = this.canvas.parentElement;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(rect.width * this.dpr);
      this.canvas.height = Math.round(rect.height * this.dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.W = rect.width;
      this.H = rect.height;
    }

    /* ─── 3D COORDINATE TRANSFORMS ─── */
    worldToScreen(wx, wy, wz = 0) {
      const dx = wx - this.cam.x;
      const dy = wy - this.cam.y;
      const cosY = Math.cos(this.cam.yaw);
      const sinY = Math.sin(this.cam.yaw);
      const rx = dx * cosY - dy * sinY;
      const ry = dx * sinY + dy * cosY;

      const pitch = this.cam.pitch;
      const zFactor = Math.sqrt(Math.max(0, 1 - pitch * pitch)) * 1.15;
      const horizonShift = (1 - pitch) * (this.H * 0.14);

      return {
        x: this.W / 2 + rx * this.cam.zoom,
        y: this.H / 2 + horizonShift + ry * this.cam.zoom * pitch - wz * this.cam.zoom * zFactor,
        depth: ry
      };
    }

    screenToWorld(sx, sy, wz = ISLAND_ELEVATION) {
      const pitch = Math.max(0.25, this.cam.pitch);
      const zFactor = Math.sqrt(Math.max(0, 1 - pitch * pitch)) * 1.15;
      const horizonShift = (1 - pitch) * (this.H * 0.14);

      const rx = (sx - this.W / 2) / this.cam.zoom;
      const ry = (sy - this.H / 2 - horizonShift + wz * this.cam.zoom * zFactor) / (this.cam.zoom * pitch);

      const cosY = Math.cos(-this.cam.yaw);
      const sinY = Math.sin(-this.cam.yaw);
      return {
        x: this.cam.x + rx * cosY - ry * sinY,
        y: this.cam.y + rx * sinY + ry * cosY
      };
    }

    /* ─── INPUT SETUP (Pan, 3D Orbit, Zoom, Keyboard) ─── */
    setupInput() {
      const c = this.canvas;

      c.addEventListener('contextmenu', e => e.preventDefault());

      c.addEventListener('mousedown', e => {
        this.dragMoved = false;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.camDragStart = {
          x: this.camTarget.x,
          y: this.camTarget.y,
          yaw: this.camTarget.yaw,
          pitch: this.camTarget.pitch
        };
        if (e.button === 2 || (e.button === 0 && e.altKey)) {
          // Right-click or Alt+Click orbits 3D camera
          this.orbiting = true;
          c.style.cursor = 'move';
        } else if (e.button === 0) {
          this.dragging = true;
          c.style.cursor = 'grabbing';
        }
      });

      window.addEventListener('mousemove', e => {
        const rect = c.getBoundingClientRect();
        this.mouseWorld = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        const moveDist = Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y);
        if (moveDist > 4) this.dragMoved = true;

        if (this.orbiting) {
          const dx = e.clientX - this.dragStart.x;
          const dy = e.clientY - this.dragStart.y;
          this.is3D = true;
          this.camTarget.yaw = this.camDragStart.yaw + dx * 0.007;
          this.camTarget.pitch = Math.max(0.35, Math.min(0.95, this.camDragStart.pitch + dy * 0.004));
          this.sync3DButtonUI();
        } else if (this.dragging) {
          const pitch = Math.max(0.25, this.cam.pitch);
          const rx = (e.clientX - this.dragStart.x) / this.cam.zoom;
          const ry = (e.clientY - this.dragStart.y) / (this.cam.zoom * pitch);
          const cosY = Math.cos(-this.cam.yaw);
          const sinY = Math.sin(-this.cam.yaw);
          this.camTarget.x = this.camDragStart.x - (rx * cosY - ry * sinY);
          this.camTarget.y = this.camDragStart.y - (rx * sinY + ry * cosY);
        }
      });

      window.addEventListener('mouseup', () => {
        this.dragging = false;
        this.orbiting = false;
        c.style.cursor = 'grab';
      });

      c.addEventListener('wheel', e => {
        e.preventDefault();
        const dir = e.deltaY < 0 ? 1 : -1;
        this.camTarget.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX,
          this.camTarget.zoom + dir * ZOOM_STEP * this.camTarget.zoom));
      }, { passive: false });

      c.addEventListener('dblclick', e => {
        const rect = c.getBoundingClientRect();
        const wp = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        this.camTarget.x = wp.x;
        this.camTarget.y = wp.y;
        this.camTarget.zoom = Math.min(this.camTarget.zoom * 1.35, ZOOM_MAX);
      });

      c.addEventListener('click', e => {
        if (this.dragMoved) return;
        const rect = c.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        // Check screen-space proximity to POIs (accounts for 3D elevation)
        const clickedPOI = this.findPOIAtScreen(sx, sy, 36);
        if (clickedPOI) {
          this.interactWithPOI(clickedPOI);
          return;
        }
      });

      // Touch support
      c.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          this.dragging = true;
          this.dragMoved = false;
          this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          this.camDragStart = { x: this.camTarget.x, y: this.camTarget.y, yaw: this.camTarget.yaw, pitch: this.camTarget.pitch };
        } else if (e.touches.length === 2) {
          this.dragging = false;
          this.pinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      c.addEventListener('touchmove', e => {
        e.preventDefault();
        if (e.touches.length === 1 && this.dragging) {
          const pitch = Math.max(0.25, this.cam.pitch);
          const rx = (e.touches[0].clientX - this.dragStart.x) / this.cam.zoom;
          const ry = (e.touches[0].clientY - this.dragStart.y) / (this.cam.zoom * pitch);
          const cosY = Math.cos(-this.cam.yaw);
          const sinY = Math.sin(-this.cam.yaw);
          this.camTarget.x = this.camDragStart.x - (rx * cosY - ry * sinY);
          this.camTarget.y = this.camDragStart.y - (rx * sinY + ry * cosY);
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const scale = dist / (this.pinchDist || dist);
          this.camTarget.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.cam.zoom * scale));
          this.pinchDist = dist;
        }
      }, { passive: false });

      c.addEventListener('touchend', () => { this.dragging = false; });

      const ro = new ResizeObserver(() => this.resize());
      ro.observe(c.parentElement);

      window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        keys[key] = true;

        if (key === 'e' && nearestPOI) {
          e.preventDefault();
          this.interactWithPOI(nearestPOI);
        }
        if (key === 'f') {
          e.preventDefault();
          if (player.inVehicle) {
            this.exitVehicle();
          } else if (nearestPOI && nearestPOI.type === 'vehicle-spawn') {
            this.enterVehicle(nearestPOI.vehicleId);
          }
        }
        if (key === 'q') {
          this.camTarget.yaw -= 0.25;
        }
        if (key === 'r') {
          this.camTarget.yaw += 0.25;
        }
        if (key === 'v') {
          this.toggle3D();
        }
        if (key === 'm') {
          e.preventDefault();
          this.camTarget.zoom = this.camTarget.zoom < 0.6 ? 1.0 : 0.42;
        }
        if (key === 'tab') {
          e.preventDefault();
          if (typeof window.showInventory === 'function') window.showInventory();
        }
      });
      window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    }

    toggle3D(forceState) {
      this.is3D = typeof forceState === 'boolean' ? forceState : !this.is3D;
      if (this.is3D) {
        this.camTarget.pitch = 0.54;
        if (Math.abs(this.camTarget.yaw) < 0.05) this.camTarget.yaw = -0.32;
      } else {
        this.camTarget.pitch = 1.0;
        this.camTarget.yaw = 0;
      }
      this.sync3DButtonUI();
      if (typeof window.toast === 'function') {
        window.toast(this.is3D ? '🧊 Switched to 3D Spatial Perspective View' : '🗺️ Switched to 2D Top-Down Map View', 'info');
      }
    }

    sync3DButtonUI() {
      const btn3d = document.getElementById('btn-toggle-3d');
      if (btn3d) {
        btn3d.textContent = this.is3D ? '🧊 3D Active' : '🗺️ 2D View';
        btn3d.style.background = this.is3D ? 'var(--accent-soft)' : 'rgba(255,255,255,0.06)';
        btn3d.style.color = this.is3D ? 'var(--accent-text)' : 'var(--text-secondary)';
        btn3d.style.borderColor = this.is3D ? 'var(--border-accent)' : 'transparent';
      }
    }

    /* ─── BUILD POI REGISTRY ─── */
    buildPOIs() {
      pois = [];
      const data = window.DATA;

      Object.entries(DISTRICT_POS).forEach(([id, pos]) => {
        pois.push({
          type: 'district', id, x: pos.x, y: pos.y, z: 65,
          icon: { harbor:'⚓', creator:'🎨', gaming:'🎮', downtown:'🏛️', residential:'🏡', nature:'🌿', future:'∞' }[id] || '📍',
          label: { harbor:'Harbor', creator:'Creator', gaming:'Gaming', downtown:'ADGM Downtown', residential:'Residential', nature:'Nature', future:'Future Spire' }[id] || id,
          action: () => { if (typeof window.zone === 'function') window.zone(id); }
        });
      });

      const bizCoords = {
        b1: { x: 1105, y: 270, z: 84 }, // Emaar on Island 2
        b2: { x: 855, y: 890, z: 62 },  // LuLu Hypermarket on Island 5
        b3: { x: 255, y: 740, z: 60 },  // Prestige Auto Showroom on Island 3
        b4: { x: 705, y: 450, z: 145 }, // ADGM Authority on Island 1
        b5: { x: 735, y: 485, z: 80 },  // Hub71 Campus on Island 1
        b6: { x: 890, y: 930, z: 56 }   // Galleria Mall on Island 5
      };
      if (data?.businesses) {
        data.businesses.forEach((b, i) => {
          const custom = bizCoords[b.id];
          const dId = Object.keys(DISTRICT_POS).find(k =>
            DISTRICT_POS[k] && b.district && b.district.toLowerCase().includes(k)
          );
          const dp = DISTRICT_POS[dId || 'harbor'];
          pois.push({
            type: 'business', id: b.id,
            x: custom ? custom.x : dp.x + ((i % 3) - 1) * 30 + Math.sin(i * 1.7) * 15,
            y: custom ? custom.y : dp.y + (Math.floor(i / 3) % 2 === 0 ? -25 : 25) + Math.cos(i * 2.1) * 10,
            z: custom ? custom.z : 48,
            icon: b.icon, label: b.name,
            action: () => {
              if (typeof window.enterBusinessStorefront === 'function') window.enterBusinessStorefront(b.id);
              else if (typeof window.toast === 'function') window.toast(`📍 ${b.name} — ${b.type}`, 'info');
            }
          });
        });
      }

      // International Skyport
      pois.push({
        type: 'skyport', id: 'uae-skyport',
        x: 580, y: 305, z: 64,
        icon: '✈️', label: 'UAE Skyport (4-Country Visa Terminal)',
        action: () => {
          if (typeof window.openVisaCenterModal === 'function') window.openVisaCenterModal();
        }
      });

      if (data?.properties) {
        data.properties.forEach((p, i) => {
          const dId = Object.keys(DISTRICT_POS).find(k =>
            p.district && p.district.toLowerCase().includes(k)
          );
          const dp = DISTRICT_POS[dId || 'harbor'];
          pois.push({
            type: 'property', id: p.id,
            x: dp.x + Math.sin(i * 2.3 + 1) * 40,
            y: dp.y + Math.cos(i * 1.9 + 2) * 35,
            z: 38,
            icon: p.icon, label: p.name,
            action: () => { if (typeof window.propertyDetail === 'function') window.propertyDetail(p.id); }
          });
        });
      }

      if (data?.vehicles) {
        data.vehicles.forEach((v, i) => {
          const distKeys = Object.keys(DISTRICT_POS);
          const dId = distKeys[i % distKeys.length];
          const dp = DISTRICT_POS[dId];
          pois.push({
            type: 'vehicle-spawn', id: 'vs-' + v.id, vehicleId: v.id,
            x: dp.x + 45 + Math.sin(i) * 20,
            y: dp.y - 15 + Math.cos(i) * 20,
            z: ISLAND_ELEVATION + 6,
            icon: v.icon, label: v.name + ' 🅿️',
            action: () => { this.enterVehicle(v.id); }
          });
        });
      }

      ISLANDS.filter(i => i.id !== 'nexus-main').forEach(island => {
        pois.push({
          type: 'island-marker', id: island.id,
          x: island.cx, y: island.cy, z: 65,
          icon: { 'nurai-cove':'🏖️', 'yas-arena':'🏎️', 'masdar-atoll':'🔬', 'mangrove-sanctuary':'🛒' }[island.id] || '🏝️',
          label: island.name,
          action: () => {
            this.camTarget.x = island.cx;
            this.camTarget.y = island.cy;
            this.camTarget.zoom = 1.15;
            player.x = island.cx;
            player.y = island.cy;
            if (typeof window.toast === 'function') window.toast(`🗺️ Traveled to ${island.name}!`, 'success');
          }
        });
      });

      EXPANSION_ISLANDS.forEach(exp => {
        pois.push({
          type: 'island-marker', id: exp.id,
          x: exp.x, y: exp.y, z: 45,
          icon: '🏗️',
          label: exp.name,
          action: () => {
            if (typeof window.openExpansionIslandModal === 'function') window.openExpansionIslandModal(exp.id);
          }
        });
      });
    }

    findPOIAtScreen(sx, sy, maxDist = 36) {
      let nearest = null;
      let minDist = maxDist;
      pois.forEach(p => {
        const sp = this.worldToScreen(p.x, p.y, p.z || ISLAND_ELEVATION);
        const d = Math.hypot(sp.x - sx, sp.y - sy);
        if (d < minDist) {
          minDist = d;
          nearest = p;
        }
      });
      return nearest;
    }

    interactWithPOI(poi) {
      if (poi.action) poi.action();
      if (typeof window.playBeep === 'function') window.playBeep('click');
    }

    spawnNPCs() {
      npcs = [];
      const data = window.DATA;
      if (!data?.users) return;

      Object.entries(DISTRICT_POS).forEach(([dId, dp]) => {
        for (let i = 0; i < NPC_PER_DISTRICT; i++) {
          const userIdx = (Object.keys(DISTRICT_POS).indexOf(dId) * NPC_PER_DISTRICT + i) % data.users.length;
          const user = data.users[userIdx];
          const angle = Math.random() * Math.PI * 2;
          const dist = 20 + Math.random() * 55;
          npcs.push({
            data: user,
            x: dp.x + Math.cos(angle) * dist,
            y: dp.y + Math.sin(angle) * dist,
            targetX: dp.x + Math.cos(angle + 1) * dist,
            targetY: dp.y + Math.sin(angle + 1) * dist,
            homeX: dp.x, homeY: dp.y,
            speed: 0.3 + Math.random() * 0.4,
            speech: null,
            speechTimer: 150 + Math.floor(Math.random() * 400),
            pauseTimer: 0,
            districtId: dId
          });
        }
      });
    }

    enterVehicle(vehicleId) {
      const data = window.DATA;
      const st = window.S;
      if (!data?.vehicles) return;
      const v = data.vehicles.find(x => x.id === vehicleId);
      if (!v) return;

      const owned = st?.ownedVehicles?.includes(vehicleId);
      if (!owned && typeof window.toast === 'function') {
        window.toast(`🏎️ Test-driving ${v.name} in 3D!`, 'info');
      }

      player.inVehicle = {
        id: v.id, name: v.name, icon: v.icon, type: v.type,
        maxSpeed: 3 + (v.speed - 75) * 0.15,
        accel: 0.04 + (v.acceleration - 80) * 0.002,
        turnRate: 0.03 + (v.handling - 70) * 0.001,
        friction: 0.97,
        brakeForce: 0.08
      };
      player.vehicleAngle = -Math.PI / 2;
      player.vehicleSpeed = 0;

      const hud = document.getElementById('driving-hud');
      if (hud) hud.style.display = 'flex';
      const badge = document.getElementById('vehicle-badge');
      if (badge) badge.innerHTML = `${v.icon} <strong>${v.name}</strong> <span style="opacity:0.6">· ${v.type}</span>`;
      const hints = document.getElementById('control-hints');
      if (hints) hints.innerHTML = '<b>W/S</b> Drive · <b>A/D</b> Steer · <b>Shift</b> Nitro · <b>Q/R</b> Rotate 3D · <b>F</b> Exit';

      if (typeof window.playBeep === 'function') window.playBeep('wave');
    }

    exitVehicle() {
      player.inVehicle = null;
      player.vehicleSpeed = 0;
      player.vx = 0;
      player.vy = 0;

      const hud = document.getElementById('driving-hud');
      if (hud) hud.style.display = 'none';
      const hints = document.getElementById('control-hints');
      if (hints) hints.innerHTML = '<b>WASD</b> Move · <b>Q/R</b> Rotate 3D · <b>Right-Drag</b> Orbit · <b>E</b> Interact · <b>F</b> Drive';

      if (typeof window.toast === 'function') window.toast('Exited vehicle.', 'info');
    }

    /* ═══════════════════════════════════════════════
       UPDATE LOOP
       ═══════════════════════════════════════════════ */
    update(dt) {
      animTime += dt;
      this.waveOffset += dt * 0.5;

      // Smooth 3D camera lerp
      this.cam.x += (this.camTarget.x - this.cam.x) * CAM_LERP;
      this.cam.y += (this.camTarget.y - this.cam.y) * CAM_LERP;
      this.cam.zoom += (this.camTarget.zoom - this.cam.zoom) * CAM_LERP;
      this.cam.pitch += (this.camTarget.pitch - this.cam.pitch) * CAM_LERP;
      this.cam.yaw += (this.camTarget.yaw - this.cam.yaw) * CAM_LERP;

      if (player.inVehicle) {
        this.updateVehicle(dt);
      } else {
        this.updatePlayer(dt);
      }

      // Compute player 3D elevation (higher on highway bridges)
      player.z = this.isOnBridge(player.x, player.y) ? BRIDGE_ELEVATION : ISLAND_ELEVATION;

      if (!this.dragging && !this.orbiting && (player.moving || Math.abs(player.vehicleSpeed) > 0.05)) {
        this.camTarget.x = player.x;
        this.camTarget.y = player.y;
      }

      this.updateNPCs(dt);
      this.checkProximity();
      this.updateHUD();
    }

    updatePlayer(dt) {
      let sx = 0, sy = 0;
      if (keys['w'] || keys['arrowup']) sy -= 1;
      if (keys['s'] || keys['arrowdown']) sy += 1;
      if (keys['a'] || keys['arrowleft']) sx -= 1;
      if (keys['d'] || keys['arrowright']) sx += 1;

      if (sx !== 0 && sy !== 0) { sx *= 0.707; sy *= 0.707; }

      // Rotate WASD input by camera yaw so W always moves "forward" into the 3D view!
      const cosY = Math.cos(-this.cam.yaw);
      const sinY = Math.sin(-this.cam.yaw);
      const dx = sx * cosY - sy * sinY;
      const dy = sx * sinY + sy * cosY;

      player.sprinting = !!keys['shift'];
      const speed = PLAYER_SPEED * (player.sprinting ? SPRINT_MULT : 1);
      player.moving = sx !== 0 || sy !== 0;

      if (player.moving) {
        player.vx = dx * speed;
        player.vy = dy * speed;

        if (Math.abs(sx) > Math.abs(sy)) player.dir = sx > 0 ? 'east' : 'west';
        else player.dir = sy > 0 ? 'south' : 'north';

        player.stepTimer -= dt;
        if (player.stepTimer <= 0) {
          player.stepTimer = player.sprinting ? 0.25 : 0.4;
          if (typeof window.playBeep === 'function') window.playBeep('step');
        }
      } else {
        player.vx *= 0.8;
        player.vy *= 0.8;
        if (Math.abs(player.vx) < 0.01) player.vx = 0;
        if (Math.abs(player.vy) < 0.01) player.vy = 0;
      }

      const nextX = player.x + player.vx;
      const nextY = player.y + player.vy;

      if (this.isOnLand(nextX, nextY)) {
        player.x = nextX;
        player.y = nextY;
      } else if (this.isOnLand(nextX, player.y)) {
        player.x = nextX;
        player.vy = 0;
      } else if (this.isOnLand(player.x, nextY)) {
        player.y = nextY;
        player.vx = 0;
      }
    }

    updateVehicle(dt) {
      const v = player.inVehicle;
      if (!v) return;

      if (keys['w'] || keys['arrowup']) {
        const boost = keys['shift'] ? 1.4 : 1.0;
        player.vehicleSpeed = Math.min(player.vehicleSpeed + v.accel * boost, v.maxSpeed * boost);
      } else if (keys['s'] || keys['arrowdown']) {
        player.vehicleSpeed = Math.max(player.vehicleSpeed - v.brakeForce, -v.maxSpeed * 0.3);
      } else {
        player.vehicleSpeed *= v.friction;
        if (Math.abs(player.vehicleSpeed) < 0.01) player.vehicleSpeed = 0;
      }

      const steerFactor = Math.min(1, Math.abs(player.vehicleSpeed) / 1.5);
      if (keys['a'] || keys['arrowleft']) player.vehicleAngle -= v.turnRate * steerFactor;
      if (keys['d'] || keys['arrowright']) player.vehicleAngle += v.turnRate * steerFactor;

      if (keys['h']) {
        keys['h'] = false;
        if (typeof window.playBeep === 'function') window.playBeep('wave');
      }

      const nextX = player.x + Math.cos(player.vehicleAngle) * player.vehicleSpeed;
      const nextY = player.y + Math.sin(player.vehicleAngle) * player.vehicleSpeed;

      const isAir = v.type.includes('Air') || v.type.includes('Flight') || v.type.includes('eVTOL') || v.type.includes('Sky');
      const isWater = v.type.includes('Speedboat') || v.type.includes('Jet') || v.type.includes('Yacht');

      if (isAir || isWater || this.isOnLand(nextX, nextY)) {
        player.x = nextX;
        player.y = nextY;
      } else {
        player.vehicleSpeed *= 0.5;
      }

      player.x = Math.max(20, Math.min(WORLD_W - 20, player.x));
      player.y = Math.max(20, Math.min(WORLD_H - 20, player.y));
    }

    updateNPCs(dt) {
      npcs.forEach(npc => {
        if (npc.pauseTimer > 0) {
          npc.pauseTimer -= dt;
          return;
        }
        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
          const angle = Math.random() * Math.PI * 2;
          const r = 20 + Math.random() * 65;
          npc.targetX = npc.homeX + Math.cos(angle) * r;
          npc.targetY = npc.homeY + Math.sin(angle) * r;
          npc.pauseTimer = 1 + Math.random() * 3;
        } else {
          npc.x += (dx / dist) * npc.speed;
          npc.y += (dy / dist) * npc.speed;
        }

        npc.speechTimer -= dt;
        if (npc.speechTimer <= 0) {
          npc.speech = NPC_SPEECH[Math.floor(Math.random() * NPC_SPEECH.length)];
          npc.speechTimer = 14 + Math.random() * 22;
          setTimeout(() => { npc.speech = null; }, 4000);
        }
      });
    }

    checkProximity() {
      nearestPOI = null;
      let minDist = INTERACT_RANGE;

      pois.forEach(p => {
        const d = Math.hypot(p.x - player.x, p.y - player.y);
        if (d < minDist) {
          minDist = d;
          nearestPOI = p;
        }
      });

      const promptEl = document.getElementById('proximity-prompt');
      if (promptEl) {
        if (nearestPOI) {
          const sp = this.worldToScreen(nearestPOI.x, nearestPOI.y, nearestPOI.z || ISLAND_ELEVATION);
          promptEl.style.display = 'flex';
          promptEl.style.left = sp.x + 'px';
          promptEl.style.top = Math.max(20, sp.y - 44) + 'px';
          const key = nearestPOI.type === 'vehicle-spawn' ? 'F' : 'E';
          const verb = nearestPOI.type === 'vehicle-spawn' ? 'Drive' :
                       nearestPOI.type === 'business' ? 'Enter' :
                       nearestPOI.type === 'property' ? 'View' :
                       nearestPOI.type === 'district' ? 'Travel' : 'Interact';
          promptEl.innerHTML = `<span class="prx-key">${key}</span> ${verb} · ${nearestPOI.label}`;
        } else {
          promptEl.style.display = 'none';
        }
      }
    }

    isOnBridge(wx, wy) {
      for (const b of BRIDGES) {
        if (this.distToSegment(wx, wy, b.from.x, b.from.y, b.to.x, b.to.y) <= (b.width || 32)) return true;
      }
      return false;
    }

    isOnLand(wx, wy) {
      for (const island of ISLANDS) {
        if (this.pointInPolygon(wx, wy, island.shape)) return true;
      }
      return this.isOnBridge(wx, wy);
    }

    distToSegment(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    pointInPolygon(px, py, poly) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    }

    updateHUD() {
      const bc = document.getElementById('map-breadcrumb');
      if (bc) {
        const island = ISLANDS.find(i => this.pointInPolygon(player.x, player.y, i.shape));
        const distEntry = Object.entries(DISTRICT_POS).reduce((best, [id, pos]) => {
          const d = Math.hypot(pos.x - player.x, pos.y - player.y);
          return d < best.dist ? { id, dist: d } : best;
        }, { id: 'harbor', dist: Infinity });
        const distLabel = { harbor:'Harbor District', creator:'Creator District', gaming:'Gaming District', downtown:'ADGM Downtown', residential:'Residential District', nature:'Nature Zone', future:'Future Spire' };
        bc.textContent = `${island?.name || 'Highway Causeway'} › ${distLabel[distEntry.id] || 'UAE Sector'}`;
      }

      const coords = document.getElementById('map-coords');
      if (coords) {
        const deg = Math.round((this.cam.yaw * 180 / Math.PI) % 360);
        const pitchDeg = Math.round(Math.acos(Math.min(1, this.cam.pitch)) * 180 / Math.PI);
        coords.textContent = `${Math.round(player.x)}, ${Math.round(player.y)} · ${this.is3D ? `3D (${pitchDeg}° tilt, ${deg}°)` : '2D'}`;
      }

      if (player.inVehicle) {
        const speedEl = document.getElementById('speed-value');
        const speedNum = Math.abs(Math.round(player.vehicleSpeed * 40));
        if (speedEl) speedEl.textContent = speedNum;
        this.renderSpeedometer(speedNum, player.inVehicle.maxSpeed * 40);
      }
    }

    /* ═══════════════════════════════════════════════
       3D RENDER PIPELINE
       ═══════════════════════════════════════════════ */
    render() {
      if (this.W < 1 || this.H < 1) {
        this.resize();
        if (this.W < 1 || this.H < 1) return;
      }
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.W, this.H);

      try {
        this.renderSkyAndOcean(ctx);
        this.renderIslands3D(ctx);
        this.renderBridgesAndRoads3D(ctx);
        this.render3DSceneObjects(ctx);
        this.renderPOIMarkers3D(ctx);
      } catch (e) {
        console.error('[NexusEngine] 3D Render error:', e);
      }

      try { this.renderMinimap(); } catch (e) { /* silent */ }
    }

    /* ─── 1. 3D SKY HORIZON & PERSPECTIVE OCEAN ─── */
    renderSkyAndOcean(ctx) {
      const t = this.timeOfDay;
      const pitch = this.cam.pitch;
      const horizonY = Math.max(0, (1 - pitch) * (this.H * 0.34));

      let skyTop, skyHorizon, seaTop, seaBottom;
      if (t < 0.2) { // Day
        skyTop = '#021024'; skyHorizon = '#0ea5e9';
        seaTop = '#0c4a82'; seaBottom = '#04182e';
      } else if (t < 0.5) { // Sunset
        skyTop = '#1e1b4b'; skyHorizon = '#f97316';
        seaTop = '#7c2d12'; seaBottom = '#0f172a';
      } else { // Night
        skyTop = '#020617'; skyHorizon = '#1e293b';
        seaTop = '#09152b'; seaBottom = '#020617';
      }

      // Draw 3D Atmospheric Sky Band when tilted
      if (horizonY > 4) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 30);
        skyGrad.addColorStop(0, skyTop);
        skyGrad.addColorStop(1, skyHorizon);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.W, horizonY + 30);

        // Sun / Moon orb near horizon
        const sunX = this.W * 0.5 - Math.sin(this.cam.yaw) * (this.W * 0.25);
        const sunY = horizonY * 0.55;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 75);
        sunGrad.addColorStop(0, t < 0.5 ? 'rgba(253, 224, 71, 0.9)' : 'rgba(56, 189, 248, 0.85)');
        sunGrad.addColorStop(0.35, t < 0.5 ? 'rgba(251, 146, 60, 0.35)' : 'rgba(14, 165, 233, 0.25)');
        sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Deep Arabian Gulf Ocean Gradient
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, this.H);
      seaGrad.addColorStop(0, seaTop);
      seaGrad.addColorStop(0.35, '#072a4f');
      seaGrad.addColorStop(1, seaBottom);
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizonY, this.W, this.H - horizonY);

      // Horizon Atmospheric Glow Line
      if (horizonY > 4) {
        ctx.fillStyle = t < 0.5 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(34, 211, 238, 0.22)';
        ctx.fillRect(0, horizonY - 1, this.W, 3);
      }

      // 3D Perspective Sea Floor Grid & Animated Waves
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.055)';
      ctx.lineWidth = 1;
      const step = 200;
      for (let gx = 0; gx <= WORLD_W; gx += step) {
        const p1 = this.worldToScreen(gx, 0, 0);
        const p2 = this.worldToScreen(gx, WORLD_H, 0);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let gy = 0; gy <= WORLD_H; gy += step) {
        const p1 = this.worldToScreen(0, gy, 0);
        const p2 = this.worldToScreen(WORLD_W, gy, 0);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    /* ─── 2. 3D EXTRUDED ISLAND TERRAIN & CLIFFS ─── */
    renderIslands3D(ctx) {
      // Sort islands back-to-front by camera depth so closer islands overlap farther ones
      const sortedIslands = [...ISLANDS].sort((a, b) => {
        const da = this.worldToScreen(a.cx, a.cy, 0).depth;
        const db = this.worldToScreen(b.cx, b.cy, 0).depth;
        return da - db;
      });

      sortedIslands.forEach(island => {
        const basePts = island.shape.map(p => this.worldToScreen(p.x, p.y, 0));
        const topPts = island.shape.map(p => this.worldToScreen(p.x, p.y, ISLAND_ELEVATION));
        if (topPts.length < 3) return;

        // 1. Shallow Lagoon Reef Halo at Sea Level (wz = 0)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(basePts[0].x, basePts[0].y);
        for (let i = 1; i < basePts.length; i++) ctx.lineTo(basePts[i].x, basePts[i].y);
        ctx.closePath();
        ctx.lineWidth = Math.max(10, 22 * this.cam.zoom);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.16)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
        ctx.fill();
        ctx.restore();

        // 2. 3D Extruded Coastal Cliff / Sea-Wall Faces (wz = 0 -> wz = ISLAND_ELEVATION)
        if (this.cam.pitch < 0.99) {
          for (let i = 0; i < topPts.length; i++) {
            const next = (i + 1) % topPts.length;
            const b1 = basePts[i], b2 = basePts[next];
            const t1 = topPts[i], t2 = topPts[next];

            ctx.beginPath();
            ctx.moveTo(b1.x, b1.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.lineTo(t1.x, t1.y);
            ctx.closePath();

            // Directional sunlight shading based on edge orientation
            const edgeDx = b2.x - b1.x;
            ctx.fillStyle = edgeDx > 0 ? (island.cliffColor || '#334155') : '#1e293b';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // 3. Golden Sandy Beach Rim at Top Surface
        ctx.beginPath();
        ctx.moveTo(topPts[0].x, topPts[0].y);
        for (let i = 1; i < topPts.length; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
        ctx.closePath();
        ctx.lineWidth = Math.max(5, 9 * this.cam.zoom);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.42)';
        ctx.stroke();

        // 4. Lush Top Terrain Plateau Fill
        const center = this.worldToScreen(island.cx, island.cy, ISLAND_ELEVATION);
        const r = Math.max(20, island.radius * this.cam.zoom);
        const grad = ctx.createRadialGradient(center.x, center.y - r * 0.15, 2, center.x, center.y, r);
        grad.addColorStop(0, island.fillColors[0] + 'ee');
        grad.addColorStop(0.45, island.fillColors[1] + 'dd');
        grad.addColorStop(0.8, island.fillColors[2] + 'cc');
        grad.addColorStop(1, island.fillColors[3] + 'bb');
        ctx.fillStyle = grad;
        ctx.fill();

        // Topographic 3D Elevation Ring Highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = Math.max(1, 1.8 * this.cam.zoom);
        ctx.stroke();
      });

      // 5. Render Expansion Islands 6–10+ as 3D Holographic Reclamation Cylinders
      EXPANSION_ISLANDS.forEach(exp => {
        const base = this.worldToScreen(exp.x, exp.y, 0);
        const top = this.worldToScreen(exp.x, exp.y, 24);
        const rx = exp.radius * this.cam.zoom;
        const ry = rx * this.cam.pitch;
        if (base.x < -200 || base.x > this.W + 200 || base.y < -200 || base.y > this.H + 200) return;

        ctx.save();
        // Base sea ring
        ctx.beginPath();
        ctx.ellipse(base.x, base.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Elevated holographic platform ring
        ctx.beginPath();
        ctx.ellipse(top.x, top.y, rx * 0.85, ry * 0.85, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.stroke();
        ctx.restore();
      });
    }

    /* ─── 3. 3D SUSPENSION CAUSEWAY BRIDGES & ROADWAYS ─── */
    renderBridgesAndRoads3D(ctx) {
      const zoom = this.cam.zoom;

      BRIDGES.forEach(b => {
        const seaFrom = this.worldToScreen(b.from.x, b.from.y, 0);
        const seaTo = this.worldToScreen(b.to.x, b.to.y, 0);
        const deckFrom = this.worldToScreen(b.from.x, b.from.y, BRIDGE_ELEVATION);
        const deckTo = this.worldToScreen(b.to.x, b.to.y, BRIDGE_ELEVATION);
        const roadW = Math.max(7, 15 * zoom);

        // 1. Bridge shadow on water
        ctx.beginPath();
        ctx.moveTo(seaFrom.x, seaFrom.y);
        ctx.lineTo(seaTo.x, seaTo.y);
        ctx.lineWidth = roadW;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.stroke();

        // 2. 3D Concrete Support Pillars from Ocean (wz=0) to Bridge Deck (wz=22)
        const steps = 5;
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const wx = b.from.x + (b.to.x - b.from.x) * t;
          const wy = b.from.y + (b.to.y - b.from.y) * t;
          const pSea = this.worldToScreen(wx, wy, 0);
          const pDeck = this.worldToScreen(wx, wy, BRIDGE_ELEVATION);

          ctx.beginPath();
          ctx.moveTo(pSea.x, pSea.y);
          ctx.lineTo(pDeck.x, pDeck.y);
          ctx.lineWidth = Math.max(3, 6 * zoom);
          ctx.strokeStyle = '#64748b';
          ctx.stroke();

          // Water ripple around pillar base
          ctx.beginPath();
          ctx.ellipse(pSea.x, pSea.y, Math.max(4, 8 * zoom), Math.max(2, 4 * zoom * this.cam.pitch), 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 3. Elevated 3D Bridge Side Girder & Guardrail
        ctx.beginPath();
        ctx.moveTo(deckFrom.x, deckFrom.y + 3 * zoom);
        ctx.lineTo(deckTo.x, deckTo.y + 3 * zoom);
        ctx.lineWidth = roadW + 4;
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(deckFrom.x, deckFrom.y);
        ctx.lineTo(deckTo.x, deckTo.y);
        ctx.lineWidth = roadW + 3;
        ctx.strokeStyle = b.color || 'rgba(56, 189, 248, 0.6)';
        ctx.stroke();

        // 4. Elevated Asphalt Highway Surface
        ctx.beginPath();
        ctx.moveTo(deckFrom.x, deckFrom.y);
        ctx.lineTo(deckTo.x, deckTo.y);
        ctx.lineWidth = roadW;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // 5. Golden Highway Centerline
        ctx.save();
        ctx.setLineDash([Math.max(4, 8 * zoom), Math.max(4, 6 * zoom)]);
        ctx.beginPath();
        ctx.moveTo(deckFrom.x, deckFrom.y);
        ctx.lineTo(deckTo.x, deckTo.y);
        ctx.lineWidth = Math.max(1, 2 * zoom);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.stroke();
        ctx.restore();

        // 6. 3D Suspension Bridge Pylon Towers & Cables
        if (this.cam.pitch < 0.96) {
          [0.3, 0.7].forEach(t => {
            const wx = b.from.x + (b.to.x - b.from.x) * t;
            const wy = b.from.y + (b.to.y - b.from.y) * t;
            const pBase = this.worldToScreen(wx, wy, BRIDGE_ELEVATION);
            const pTop = this.worldToScreen(wx, wy, BRIDGE_ELEVATION + 42);

            // Suspension cables
            ctx.beginPath();
            ctx.moveTo(deckFrom.x, deckFrom.y);
            ctx.lineTo(pTop.x, pTop.y);
            ctx.lineTo(deckTo.x, deckTo.y);
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.32)';
            ctx.lineWidth = Math.max(1, 1.3 * zoom);
            ctx.stroke();

            // Pylon tower
            ctx.beginPath();
            ctx.moveTo(pBase.x, pBase.y);
            ctx.lineTo(pTop.x, pTop.y);
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = Math.max(2.5, 4.5 * zoom);
            ctx.stroke();

            // Beacon light on pylon top
            ctx.beginPath();
            ctx.arc(pTop.x, pTop.y, Math.max(2, 3 * zoom), 0, Math.PI * 2);
            ctx.fillStyle = b.color || '#38bdf8';
            ctx.fill();
          });
        }
      });

      // Main Island Surface Roads (at ISLAND_ELEVATION)
      ROADS.forEach(road => {
        const from = this.worldToScreen(road.from.x, road.from.y, ISLAND_ELEVATION + 0.5);
        const to = this.worldToScreen(road.to.x, road.to.y, ISLAND_ELEVATION + 0.5);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.lineWidth = Math.max(4, (road.width * 2.5) * zoom);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.stroke();

        ctx.save();
        ctx.setLineDash([Math.max(3, 6 * zoom), Math.max(3, 5 * zoom)]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.lineWidth = Math.max(1, 1.3 * zoom);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.stroke();
        ctx.restore();
      });
    }

    /* ─── 4. PAINTER'S ALGORITHM: 3D BUILDINGS, TREES, NPCS & PLAYER ─── */
    render3DSceneObjects(ctx) {
      const renderList = [];

      // Queue 3D Buildings
      BUILDINGS_3D.forEach(b => {
        const sp = this.worldToScreen(b.x, b.y, ISLAND_ELEVATION);
        if (sp.x < -150 || sp.x > this.W + 150 || sp.y < -150 || sp.y > this.H + 200) return;
        renderList.push({ type: 'building', depth: sp.depth, data: b });
      });

      // Queue 3D Palm Trees
      TREES_3D.forEach(t => {
        const sp = this.worldToScreen(t.x, t.y, ISLAND_ELEVATION);
        if (sp.x < -60 || sp.x > this.W + 60 || sp.y < -60 || sp.y > this.H + 60) return;
        renderList.push({ type: 'tree', depth: sp.depth, data: t });
      });

      // Queue NPCs
      if (this.cam.zoom >= 0.45) {
        npcs.forEach(npc => {
          const sp = this.worldToScreen(npc.x, npc.y, ISLAND_ELEVATION);
          if (sp.x < -50 || sp.x > this.W + 50 || sp.y < -50 || sp.y > this.H + 50) return;
          renderList.push({ type: 'npc', depth: sp.depth, data: npc });
        });
      }

      // Queue Player / Active 3D Vehicle
      const pSp = this.worldToScreen(player.x, player.y, player.z);
      renderList.push({ type: 'player', depth: pSp.depth + 2 });

      // Sort back-to-front by 3D depth
      renderList.sort((a, b) => a.depth - b.depth);

      // Execute draw calls in depth order
      renderList.forEach(item => {
        if (item.type === 'building') this.draw3DBuilding(ctx, item.data);
        else if (item.type === 'tree') this.draw3DTree(ctx, item.data);
        else if (item.type === 'npc') this.draw3DNPC(ctx, item.data);
        else if (item.type === 'player') this.draw3DPlayer(ctx);
      });
    }

    draw3DBuilding(ctx, b) {
      const zoom = this.cam.zoom;
      const hw = b.w / 2;
      const hd = b.d / 2;
      const z0 = ISLAND_ELEVATION;
      const z1 = ISLAND_ELEVATION + b.h;

      // 4 footprint corners in world space
      const corners = [
        { x: b.x - hw, y: b.y - hd },
        { x: b.x + hw, y: b.y - hd },
        { x: b.x + hw, y: b.y + hd },
        { x: b.x - hw, y: b.y + hd }
      ];

      const basePts = corners.map(c => this.worldToScreen(c.x, c.y, z0));
      const roofPts = corners.map(c => this.worldToScreen(c.x, c.y, z1));

      // Ground drop shadow
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(basePts[0].x + 6 * zoom, basePts[0].y + 4 * zoom);
      for (let i = 1; i < 4; i++) ctx.lineTo(basePts[i].x + 6 * zoom, basePts[i].y + 4 * zoom);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.fill();
      ctx.restore();

      // Draw the 4 vertical walls (back faces first, front faces second based on midpoint depth)
      const faces = [0, 1, 2, 3].map(i => {
        const next = (i + 1) % 4;
        const midX = (corners[i].x + corners[next].x) / 2;
        const midY = (corners[i].y + corners[next].y) / 2;
        const midSp = this.worldToScreen(midX, midY, z0);
        return { i, next, depth: midSp.depth };
      }).sort((a, bFace) => a.depth - bFace.depth);

      // Render front-most 2 faces
      faces.slice(2).forEach((f, idx) => {
        const b1 = basePts[f.i], b2 = basePts[f.next];
        const r1 = roofPts[f.i], r2 = roofPts[f.next];

        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(r2.x, r2.y);
        ctx.lineTo(r1.x, r1.y);
        ctx.closePath();
        ctx.fillStyle = idx === 0 ? b.left : b.right;
        ctx.fill();
        ctx.strokeStyle = b.neon || 'rgba(255,255,255,0.22)';
        ctx.lineWidth = Math.max(0.6, 1 * zoom);
        ctx.stroke();

        // Glowing 3D Window Floors on Skyscrapers
        if (b.windows && zoom > 0.5 && this.cam.pitch < 0.95) {
          const floors = Math.min(8, Math.floor(b.h / 16));
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.35)';
          ctx.lineWidth = Math.max(0.8, 1.2 * zoom);
          for (let fl = 1; fl <= floors; fl++) {
            const frac = fl / (floors + 1);
            const lx1 = b1.x + (r1.x - b1.x) * frac;
            const ly1 = b1.y + (r1.y - b1.y) * frac;
            const lx2 = b2.x + (r2.x - b2.x) * frac;
            const ly2 = b2.y + (r2.y - b2.y) * frac;
            ctx.beginPath();
            ctx.moveTo(lx1 + (lx2 - lx1) * 0.15, ly1 + (ly2 - ly1) * 0.15);
            ctx.lineTo(lx1 + (lx2 - lx1) * 0.85, ly1 + (ly2 - ly1) * 0.85);
            ctx.stroke();
          }
        }
      });

      // Roof Polygon at z1
      ctx.beginPath();
      ctx.moveTo(roofPts[0].x, roofPts[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(roofPts[i].x, roofPts[i].y);
      ctx.closePath();
      ctx.fillStyle = b.top;
      ctx.fill();
      ctx.strokeStyle = '#ffffff55';
      ctx.lineWidth = Math.max(0.8, 1.2 * zoom);
      ctx.stroke();

      // Special 3D Roof Features (Spire, Dome, Helipad, Villa Pool)
      const roofCenter = this.worldToScreen(b.x, b.y, z1);
      if (b.roof === 'spire') {
        const spireTop = this.worldToScreen(b.x, b.y, z1 + 34);
        ctx.beginPath();
        ctx.moveTo(roofCenter.x, roofCenter.y);
        ctx.lineTo(spireTop.x, spireTop.y);
        ctx.strokeStyle = b.neon || '#38bdf8';
        ctx.lineWidth = Math.max(1.5, 2.5 * zoom);
        ctx.stroke();

        // Pulsing aviation/quantum beacon at spire tip
        const pulse = (Math.sin(animTime * 5 + b.x) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(spireTop.x, spireTop.y, Math.max(2.5, (3.5 + pulse * 2) * zoom), 0, Math.PI * 2);
        ctx.fillStyle = b.neon || '#22d3ee';
        ctx.fill();
      } else if (b.roof === 'dome') {
        const domeR = Math.max(6, (b.w * 0.36) * zoom);
        ctx.beginPath();
        ctx.arc(roofCenter.x, roofCenter.y - domeR * 0.25, domeR, Math.PI, 0, false);
        ctx.closePath();
        ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
        ctx.fill();
        ctx.strokeStyle = b.neon || '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (b.roof === 'helipad' && zoom > 0.55) {
        const padR = Math.max(4, (b.w * 0.25) * zoom);
        ctx.beginPath();
        ctx.ellipse(roofCenter.x, roofCenter.y, padR, padR * this.cam.pitch, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (b.roof === 'villa') {
        // Luxury turquoise swimming pool beside villa
        const poolSp = this.worldToScreen(b.x + hw + 10, b.y, z0 + 1);
        ctx.beginPath();
        ctx.ellipse(poolSp.x, poolSp.y, Math.max(4, 9 * zoom), Math.max(2.5, 6 * zoom * this.cam.pitch), 0, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
        ctx.strokeStyle = '#cffafe';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    draw3DTree(ctx, t) {
      const zoom = this.cam.zoom;
      if (zoom < 0.45) return;
      const base = this.worldToScreen(t.x, t.y, ISLAND_ELEVATION);
      const top = this.worldToScreen(t.x, t.y, ISLAND_ELEVATION + 18);

      // Trunk
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = Math.max(1.5, 2.5 * zoom);
      ctx.stroke();

      // 3D Palm Canopy
      ctx.beginPath();
      ctx.arc(top.x, top.y, Math.max(3.5, 6.5 * zoom), 0, Math.PI * 2);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(top.x - 1.5 * zoom, top.y - 1.5 * zoom, Math.max(2, 4 * zoom), 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fill();
    }

    draw3DNPC(ctx, npc) {
      const zoom = this.cam.zoom;
      const base = this.worldToScreen(npc.x, npc.y, ISLAND_ELEVATION);
      const head = this.worldToScreen(npc.x, npc.y, ISLAND_ELEVATION + 12);
      const size = Math.max(14, 22 * zoom);

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(base.x, base.y, size * 0.35, size * 0.16 * this.cam.pitch, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D Standing Pillar/Body
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(head.x, head.y);
      ctx.strokeStyle = npc.data.online ? '#10b981' : '#64748b';
      ctx.lineWidth = Math.max(3, 5 * zoom);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Avatar head
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.data.avatar, head.x, head.y - size * 0.2);

      // Speech bubble
      if (npc.speech && zoom > 0.6) {
        ctx.font = `600 ${Math.max(8, 10 * zoom)}px 'Inter', -apple-system, sans-serif`;
        const bw = ctx.measureText(npc.speech).width + 16;
        const bh = 22;
        const bx = head.x - bw / 2;
        const by = head.y - size - bh - 6;

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 1;
        roundRect(ctx, bx, by, bw, bh, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e0f7ff';
        ctx.fillText(npc.speech, head.x, by + bh / 2);
      }
    }

    draw3DPlayer(ctx) {
      const zoom = this.cam.zoom;
      const base = this.worldToScreen(player.x, player.y, player.z);
      const top = this.worldToScreen(player.x, player.y, player.z + (player.inVehicle ? 10 : 16));
      const size = player.inVehicle ? Math.max(24, 34 * zoom) : Math.max(20, 28 * zoom);

      // Pulsing 3D Ground Target Ring
      const pulse = (Math.sin(animTime * 4) + 1) * 0.5;
      ctx.beginPath();
      ctx.ellipse(base.x, base.y, (size * 0.65) + pulse * 4, ((size * 0.65) + pulse * 4) * this.cam.pitch, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.fill();
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.55 + pulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // If driving a vehicle, render a 3D angled chassis platform under the vehicle icon
      if (player.inVehicle) {
        const cosA = Math.cos(player.vehicleAngle);
        const sinA = Math.sin(player.vehicleAngle);
        const front = this.worldToScreen(player.x + cosA * 14, player.y + sinA * 14, player.z + 4);
        const back = this.worldToScreen(player.x - cosA * 14, player.y - sinA * 14, player.z + 4);

        ctx.beginPath();
        ctx.moveTo(back.x, back.y);
        ctx.lineTo(front.x, front.y);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = Math.max(8, 14 * zoom);
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        // 3D Avatar Pedestal
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(top.x, top.y);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = Math.max(4, 6 * zoom);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      const icon = player.inVehicle ? player.inVehicle.icon : (window.S?.user?.avatar || '🧑‍💻');
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, top.x, top.y - size * 0.15);

      // Player Name Tag
      ctx.font = `800 ${Math.max(9, 11 * zoom)}px 'Inter', -apple-system, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillText(window.S?.user?.name || 'Citizen', base.x + 1, base.y + 9);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(window.S?.user?.name || 'Citizen', base.x, base.y + 8);
    }

    /* ─── 5. FLOATING 3D POI SKY-PINS & LASER STEMS ─── */
    renderPOIMarkers3D(ctx) {
      const zoom = this.cam.zoom;

      pois.forEach(poi => {
        if (zoom < 0.52 && poi.type !== 'district' && poi.type !== 'island-marker' && poi.type !== 'skyport') return;

        const groundSp = this.worldToScreen(poi.x, poi.y, ISLAND_ELEVATION);
        const floatZ = (poi.z || 45) + Math.sin(animTime * 2.5 + poi.x * 0.05) * 3;
        const pinSp = this.worldToScreen(poi.x, poi.y, floatZ);

        if (pinSp.x < -60 || pinSp.x > this.W + 60 || pinSp.y < -60 || pinSp.y > this.H + 60) return;

        const isDistrict = poi.type === 'district';
        const isActive = window.S?.currentDistrict === poi.id;
        const size = isDistrict ? Math.max(17, 25 * zoom) : Math.max(12, 17 * zoom);

        // 3D Vertical Laser Stem connecting ground/roof to floating 3D badge
        if (this.cam.pitch < 0.96) {
          ctx.beginPath();
          ctx.moveTo(groundSp.x, groundSp.y);
          ctx.lineTo(pinSp.x, pinSp.y);
          ctx.strokeStyle = isActive && isDistrict ? 'rgba(34, 211, 238, 0.65)' : 'rgba(148, 163, 184, 0.32)';
          ctx.lineWidth = isDistrict ? 1.8 : 1;
          ctx.stroke();
        }

        // Pin Disc
        ctx.beginPath();
        ctx.arc(pinSp.x, pinSp.y, size / 2 + 4, 0, Math.PI * 2);
        if (isActive && isDistrict) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.32)';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(9, 14, 26, 0.84)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 1.2;
        }
        ctx.fill();
        ctx.stroke();

        // Emoji Icon
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(poi.icon, pinSp.x, pinSp.y);

        // Label
        if (zoom > 0.62 || isDistrict || poi.type === 'island-marker') {
          const fontSize = Math.max(8, Math.min(12, 10.5 * zoom));
          ctx.font = `800 ${fontSize}px 'Inter', -apple-system, sans-serif`;
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(0,0,0,0.82)';
          ctx.fillText(poi.label, pinSp.x + 1, pinSp.y + size / 2 + 5);
          ctx.fillStyle = isActive && isDistrict ? '#22d3ee' : '#f8fafc';
          ctx.fillText(poi.label, pinSp.x, pinSp.y + size / 2 + 4);
        }
      });
    }

    /* ─── MINIMAP ─── */
    renderMinimap() {
      if (!this.minimapCtx) return;
      const mc = this.minimapCanvas;
      const mctx = this.minimapCtx;
      const scaleX = mc.width / WORLD_W;
      const scaleY = mc.height / WORLD_H;

      mctx.fillStyle = '#041428';
      mctx.fillRect(0, 0, mc.width, mc.height);

      // Bridges on minimap
      BRIDGES.forEach(b => {
        mctx.beginPath();
        mctx.moveTo(b.from.x * scaleX, b.from.y * scaleY);
        mctx.lineTo(b.to.x * scaleX, b.to.y * scaleY);
        mctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        mctx.lineWidth = 2;
        mctx.stroke();
      });

      ISLANDS.forEach(island => {
        mctx.beginPath();
        const pts = island.shape;
        mctx.moveTo(pts[0].x * scaleX, pts[0].y * scaleY);
        for (let i = 1; i < pts.length; i++) {
          mctx.lineTo(pts[i].x * scaleX, pts[i].y * scaleY);
        }
        mctx.closePath();
        mctx.fillStyle = island.fillColors[1] + '99';
        mctx.fill();
        mctx.strokeStyle = 'rgba(255,255,255,0.25)';
        mctx.lineWidth = 0.5;
        mctx.stroke();
      });

      // Player blip
      mctx.beginPath();
      mctx.arc(player.x * scaleX, player.y * scaleY, 3.5, 0, Math.PI * 2);
      mctx.fillStyle = '#22d3ee';
      mctx.fill();
      mctx.strokeStyle = '#fff';
      mctx.lineWidth = 1;
      mctx.stroke();
    }

    /* ─── SPEEDOMETER ─── */
    renderSpeedometer(speed, maxSpeed) {
      const canvas = document.getElementById('speedometer-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = w * 0.38;

      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 6;
      ctx.stroke();

      const speedFrac = Math.min(1, speed / (maxSpeed || 200));
      const endAngle = Math.PI * 0.75 + speedFrac * Math.PI * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.75, endAngle);
      const grad = ctx.createLinearGradient(0, h, w, 0);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.6, '#22d3ee');
      grad.addColorStop(1, speedFrac > 0.8 ? '#f43f5e' : '#34d399');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      const needleAngle = Math.PI * 0.75 + speedFrac * Math.PI * 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(needleAngle) * (r - 5), cy + Math.sin(needleAngle) * (r - 5));
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    gameLoop(timestamp) {
      if (!this.running) return;
      const dt = Math.min(0.05, (timestamp - lastFrameTime) / 1000);
      lastFrameTime = timestamp;

      try {
        this.update(dt);
        this.render();
      } catch (e) {
        console.error('[NexusEngine] GameLoop error:', e);
      }

      this.frameId = requestAnimationFrame(ts => this.gameLoop(ts));
    }

    start() {
      this.running = true;
      lastFrameTime = performance.now();
      this.resize();
      this.sync3DButtonUI();
      this.gameLoop(lastFrameTime);
    }

    stop() {
      this.running = false;
      if (this.frameId) cancelAnimationFrame(this.frameId);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ═══════════════════════════════════════════════
     GLOBAL API — Called from app.js & 3D HUD
     ═══════════════════════════════════════════════ */
  window.initWorldEngine = function () {
    const canvas = document.getElementById('nexus-map-canvas');
    if (!canvas) return;
    if (engine) {
      engine.stop();
      engine = null;
    }
    try {
      engine = new MapEngine(canvas);
      engine.start();
    } catch (e) {
      console.error('[NexusEngine] Failed to start 3D engine:', e);
    }
  };

  window.destroyWorldEngine = function () {
    if (engine) {
      engine.stop();
      engine = null;
    }
  };

  window.engineToggle3D = function () {
    if (engine) engine.toggle3D();
  };

  window.engineRotateCamera = function (deltaYaw) {
    if (!engine) return;
    engine.is3D = true;
    engine.camTarget.yaw += (deltaYaw || 0.35);
    engine.sync3DButtonUI();
  };

  window.engineTiltCamera = function (deltaPitch) {
    if (!engine) return;
    engine.is3D = true;
    engine.camTarget.pitch = Math.max(0.36, Math.min(0.95, engine.camTarget.pitch + (deltaPitch || -0.1)));
    engine.sync3DButtonUI();
  };

  window.engineResetCamera = function () {
    if (!engine) return;
    engine.is3D = true;
    engine.camTarget.pitch = 0.54;
    engine.camTarget.yaw = -0.32;
    engine.camTarget.zoom = 0.92;
    engine.camTarget.x = player.x;
    engine.camTarget.y = player.y;
    engine.sync3DButtonUI();
  };

  window.engineFocusDistrict = function (districtId) {
    if (!engine) return;
    const dp = DISTRICT_POS[districtId];
    if (!dp) return;
    player.x = dp.x;
    player.y = dp.y;
    engine.camTarget.x = dp.x;
    engine.camTarget.y = dp.y;
    engine.camTarget.zoom = 1.25;
  };

  window.engineFocusIsland = function (islandId) {
    if (!engine) return;
    const isl = ISLANDS.find(i => i.id === islandId) || EXPANSION_ISLANDS.find(e => e.id === islandId);
    if (!isl) return;
    const tx = isl.cx !== undefined ? isl.cx : isl.x;
    const ty = isl.cy !== undefined ? isl.cy : isl.y;
    if (isl.cx !== undefined) {
      player.x = tx;
      player.y = ty;
    }
    engine.camTarget.x = tx;
    engine.camTarget.y = ty;
    engine.camTarget.zoom = 1.15;
  };

  window.engineTeleportTo = function (wx, wy) {
    if (!engine) return;
    player.x = wx;
    player.y = wy;
    engine.camTarget.x = wx;
    engine.camTarget.y = wy;
  };

  window.engineEnterVehicle = function (vehicleId) {
    if (engine) engine.enterVehicle(vehicleId);
  };

  window.engineExitVehicle = function () {
    if (engine) engine.exitVehicle();
  };

  window.engineZoomIn = function () {
    if (!engine) return;
    engine.camTarget.zoom = Math.min(ZOOM_MAX, engine.camTarget.zoom + ZOOM_STEP * 2);
  };

  window.engineZoomOut = function () {
    if (!engine) return;
    engine.camTarget.zoom = Math.max(ZOOM_MIN, engine.camTarget.zoom - ZOOM_STEP * 2);
  };

  window.engineSetTheme = function (theme) {
    if (!engine) return;
    if (theme === 'sunset') engine.timeOfDay = 0.33;
    else if (theme === 'night') engine.timeOfDay = 0.66;
    else engine.timeOfDay = 0;
  };

  window.engineGetPlayer = function () { return player; };
  window.engineGetIslands = function () { return ISLANDS; };

  setTimeout(function () {
    if (!engine && document.getElementById('nexus-map-canvas')) {
      window.initWorldEngine();
    }
  }, 100);

})();
