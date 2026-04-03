// tips-data.js — Static safety tips data
// Global TIPS_DATA array consumed by TipsModule

const TIPS_DATA = [
  // ── Situational Awareness ──
  {
    id: 'sa-1',
    title: 'Trust Your Instincts',
    description: 'If a situation feels wrong, it probably is. Your gut reaction is a powerful early-warning system — act on it without waiting for proof.',
    category: 'situational-awareness',
    icon: 'fa-solid fa-eye'
  },
  {
    id: 'sa-2',
    title: 'Stay Off Your Phone in Public',
    description: 'Walking with your head down in your phone signals distraction and vulnerability. Keep your phone pocketed and stay aware of your surroundings.',
    category: 'situational-awareness',
    icon: 'fa-solid fa-mobile-screen-button'
  },
  {
    id: 'sa-3',
    title: 'Know Your Exits',
    description: 'When entering any building, venue, or vehicle, identify at least two exit routes. This habit takes seconds and can save your life.',
    category: 'situational-awareness',
    icon: 'fa-solid fa-door-open'
  },
  {
    id: 'sa-4',
    title: 'Vary Your Routine',
    description: 'Predictable patterns make you easier to target. Change your routes, timing, and habits regularly so your movements are harder to anticipate.',
    category: 'situational-awareness',
    icon: 'fa-solid fa-shuffle'
  },

  // ── Digital Safety ──
  {
    id: 'ds-1',
    title: 'Audit Your Location Sharing',
    description: 'Review which apps have access to your location. Revoke background location access for any app that does not genuinely need it.',
    category: 'digital-safety',
    icon: 'fa-solid fa-location-dot'
  },
  {
    id: 'ds-2',
    title: 'Use Strong, Unique Passwords',
    description: 'A compromised account can expose your address, schedule, and contacts. Use a password manager and enable two-factor authentication on every important account.',
    category: 'digital-safety',
    icon: 'fa-solid fa-lock'
  },
  {
    id: 'ds-3',
    title: 'Be Careful What You Post',
    description: 'Avoid posting real-time location check-ins or photos that reveal your home address, workplace, or daily schedule on public social media.',
    category: 'digital-safety',
    icon: 'fa-solid fa-shield-halved'
  },
  {
    id: 'ds-4',
    title: 'Recognize Stalkerware Signs',
    description: 'Unusual battery drain, unexpected data usage, or a phone that feels warm when idle can indicate monitoring software. Factory reset if you suspect it.',
    category: 'digital-safety',
    icon: 'fa-solid fa-bug'
  },

  // ── Travel Safety ──
  {
    id: 'ts-1',
    title: 'Share Your Itinerary',
    description: 'Before any trip, send your full itinerary — transport details, accommodation, and expected check-in times — to at least one trusted person.',
    category: 'travel-safety',
    icon: 'fa-solid fa-map'
  },
  {
    id: 'ts-2',
    title: 'Verify Rideshare Details',
    description: 'Before getting in, confirm the driver name, photo, and license plate match the app. Never get into a car that approaches you unprompted.',
    category: 'travel-safety',
    icon: 'fa-solid fa-car'
  },
  {
    id: 'ts-3',
    title: 'Keep Emergency Numbers Saved Offline',
    description: 'Save local emergency numbers (police, ambulance, embassy) in your phone before you travel. Do not rely on internet access in a crisis.',
    category: 'travel-safety',
    icon: 'fa-solid fa-phone'
  },
  {
    id: 'ts-4',
    title: 'Stay in Well-Lit, Populated Areas',
    description: 'When walking at night, stick to busy, well-lit streets. If you feel followed, walk into the nearest open shop or public building.',
    category: 'travel-safety',
    icon: 'fa-solid fa-lightbulb'
  },

  // ── Self-Defense ──
  {
    id: 'sd-1',
    title: 'Use Your Voice First',
    description: 'A loud, confident "STOP" or "FIRE" draws attention and can deter an attacker. Your voice is your first and most accessible self-defense tool.',
    category: 'self-defense',
    icon: 'fa-solid fa-bullhorn'
  },
  {
    id: 'sd-2',
    title: 'Target Vulnerable Points',
    description: 'If physical defense is necessary, strike the eyes, nose, throat, or groin — areas where even a small impact can create enough time to escape.',
    category: 'self-defense',
    icon: 'fa-solid fa-hand-fist'
  },
  {
    id: 'sd-3',
    title: 'Consider a Self-Defense Class',
    description: 'Even a single weekend course in basic self-defense builds muscle memory and confidence. Look for women-only classes in your area.',
    category: 'self-defense',
    icon: 'fa-solid fa-person-running'
  }
];
