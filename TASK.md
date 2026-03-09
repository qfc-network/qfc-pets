# QFC AI Pets — AI-Powered On-Chain Virtual Pets

## Overview
CryptoKitties meets AI. Virtual pets with AI-generated personalities, behaviors, and evolution. Pets can talk, learn, breed, battle, and live in the QFC Virtual Office. All state on-chain (simulated via local JSON for MVP).

## MVP Scope (v0.1)

### Pet System
- **5 species**: Dragon 🐉, Phoenix 🦅, Wolf 🐺, Cat 🐱, Rabbit 🐰
- **Pet attributes**: 
  - name (AI-generated or user-chosen)
  - species, element (fire/water/earth/lightning/shadow)
  - level (1-50), xp
  - stats: hp, attack, defense, speed, charm
  - personality: trait1, trait2 (e.g., "brave", "lazy", "curious", "mischievous", "calm")
  - mood: happy/neutral/hungry/sleepy/excited
  - hunger (0-100), energy (0-100), happiness (0-100)
  - appearance: color (hex), pattern (solid/striped/spotted/gradient), size (small/medium/large)
  - generation (gen0 = starter, gen1+ = bred)

### Core Mechanics

#### 1. Adopt (Mint)
- User gets 1 free starter pet (gen0)
- Pet generated with random species, element, stats, personality, appearance
- Each pet is unique — no two identical

#### 2. Feed & Care
- Pets get hungry over time (hunger decreases ~5/hour)
- Feed → restores hunger, slight happiness boost
- Play → restores happiness, costs energy
- Sleep → restores energy (pet unavailable during sleep, 1 min real time)
- Neglected pets get sad → stats decrease

#### 3. Talk (AI Chat)
- Chat with your pet! Pet responds based on personality + mood
- Pre-written response templates with personality modifiers
- Example: Brave Dragon when happy: "Rawr! Let's go on an adventure! 🔥"
- Example: Lazy Cat when sleepy: "Mmm... five more minutes... zzz 😴"
- Pets remember last 5 interactions (stored in state)

#### 4. Train & Level Up
- Train pet in different areas: attack, defense, speed, charm
- Training costs energy, gives XP
- Level up every 100 XP → stats increase based on species
- Unlock new responses/behaviors at certain levels

#### 5. Breed
- Two pets can breed → create new gen(N+1) pet
- Child inherits mixed traits from parents
- Stats = average of parents + random mutation (±10%)
- Personality = random pick from either parent + small chance of new trait
- Appearance = blend (color mix, pattern from either parent)
- Cooldown: 1 minute per parent after breeding
- Both parents must be level 5+ and not hungry

#### 6. Battle (Simple)
- 1v1 auto-battle based on stats
- Turn order by speed
- Each turn: attacker rolls damage = attack × (0.8-1.2) - defender.defense × 0.5
- Element advantage = +20% damage
- Winner gets XP, loser gets consolation XP
- No permadeath — just HP reduction (recovers over time)

### Web UI
- **Tech**: Vite + TypeScript + HTML/CSS (no canvas needed, DOM-based)
- **Layout**:
  - **Home**: Pet collection grid (show all your pets)
  - **Pet Detail**: Large pet display, stats, mood, actions (Feed/Play/Sleep/Train/Talk)
  - **Chat**: Chat bubble interface with pet
  - **Breed**: Select 2 pets → preview child → confirm
  - **Battle**: Select pet → match vs random pet or AI pet → auto-battle animation
  - **Marketplace** (future): Buy/sell/trade pets

### Pet Display (Programmatic)
- No images — CSS/emoji based
- Pet body: Large emoji (🐉🦅🐺🐱🐰) with colored background circle
- Stats bars (HP, hunger, energy, happiness)
- Mood indicator emoji overlay
- Level badge
- Personality tags
- Idle animation: CSS bounce/wobble

### Server
- Express on port 3230
- REST API (no WebSocket needed for MVP)
- State stored in `~/.qfc-pets/state.json`

### Data Model
```typescript
interface Pet {
  id: string;
  name: string;
  species: "dragon" | "phoenix" | "wolf" | "cat" | "rabbit";
  element: "fire" | "water" | "earth" | "lightning" | "shadow";
  level: number;
  xp: number;
  stats: { hp: number; attack: number; defense: number; speed: number; charm: number; };
  personality: [string, string];
  mood: "happy" | "neutral" | "hungry" | "sleepy" | "excited";
  hunger: number;     // 0-100
  energy: number;     // 0-100
  happiness: number;  // 0-100
  appearance: { color: string; pattern: string; size: string; };
  generation: number;
  parentIds: [string, string] | null;
  owner: string;
  bornAt: number;
  lastFed: number;
  lastPlayed: number;
  memory: string[];  // last 5 chat messages
}

interface User {
  name: string;
  pets: string[];  // pet IDs
  battles: { wins: number; losses: number; };
}

interface GameState {
  users: Record<string, User>;
  pets: Record<string, Pet>;
  battleLog: BattleResult[];
}
```

## File Structure
```
qfc-pets/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── client/
│   ├── main.ts           # Entry, routing
│   ├── PetCard.ts         # Pet display component
│   ├── PetDetail.ts       # Detail view with actions
│   ├── ChatView.ts        # Chat with pet
│   ├── BreedView.ts       # Breeding interface
│   ├── BattleView.ts      # Battle animation
│   ├── api.ts             # REST client
│   └── types.ts           # Shared types
├── server/
│   ├── index.ts           # Express server
│   ├── pets.ts            # Pet generation, stats, evolution
│   ├── chat.ts            # Pet chat responses
│   ├── battle.ts          # Battle logic
│   ├── breed.ts           # Breeding logic
│   └── types.ts           # Shared types
└── README.md
```

## Pet Personality Responses (Examples)

### Dragon 🐉
- brave+happy: "I could take on a whole army right now! 💪🔥"
- brave+hungry: "A warrior needs food to fight! Feed me! 🍖"
- lazy+sleepy: "Even dragons need beauty sleep... 💤"

### Cat 🐱  
- curious+happy: "What's that over there? *pounces* 🐾"
- mischievous+neutral: "I knocked something off the table. You're welcome. 😼"
- calm+sleepy: "Purrrrrr... zzz... 😴"

### Wolf 🐺
- brave+excited: "AWOOOO! Let's hunt! 🌙"
- loyal+happy: "You're the best pack leader ever! 🐾"

## Species Base Stats
| Species | HP | ATK | DEF | SPD | CHM |
|---------|-----|-----|-----|-----|-----|
| Dragon  | 120 | 14  | 12  | 8   | 6   |
| Phoenix | 100 | 12  | 8   | 14  | 10  |
| Wolf    | 110 | 13  | 10  | 12  | 7   |
| Cat     | 80  | 8   | 6   | 15  | 14  |
| Rabbit  | 90  | 7   | 8   | 13  | 12  |

## Constraints
- All DOM-based rendering (no canvas)
- Pets displayed as emoji + CSS styling (colored circles, animations)
- No external images or assets
- Server on port 3230
- State in `~/.qfc-pets/state.json`

## Build & Run
```bash
npm install
npm run dev       # Vite (5175) + server (3230)
npm start         # Production
```

## Commit
`feat: QFC AI Pets v0.1 — AI-powered virtual pet game`
