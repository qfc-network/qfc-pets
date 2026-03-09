import { v4 as uuid } from 'uuid';
import { Pet } from './types';

const SPECIES = ['dragon', 'phoenix', 'wolf', 'cat', 'rabbit'] as const;
const ELEMENTS = ['fire', 'water', 'earth', 'lightning', 'shadow'] as const;
const PATTERNS = ['solid', 'striped', 'spotted', 'gradient'] as const;
const SIZES = ['small', 'medium', 'large'] as const;
const PERSONALITIES = ['brave', 'lazy', 'curious', 'mischievous', 'calm', 'loyal', 'shy', 'fierce', 'gentle', 'playful'];

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', phoenix: '🦅', wolf: '🐺', cat: '🐱', rabbit: '🐰'
};

const BASE_STATS: Record<string, { hp: number; attack: number; defense: number; speed: number; charm: number }> = {
  dragon:  { hp: 120, attack: 14, defense: 12, speed: 8,  charm: 6 },
  phoenix: { hp: 100, attack: 12, defense: 8,  speed: 14, charm: 10 },
  wolf:    { hp: 110, attack: 13, defense: 10, speed: 12, charm: 7 },
  cat:     { hp: 80,  attack: 8,  defense: 6,  speed: 15, charm: 14 },
  rabbit:  { hp: 90,  attack: 7,  defense: 8,  speed: 13, charm: 12 },
};

const PET_NAMES: Record<string, string[]> = {
  dragon:  ['Ember', 'Blaze', 'Inferno', 'Cinder', 'Pyro', 'Scorch', 'Flare', 'Ash', 'Draco', 'Smaug'],
  phoenix: ['Aurora', 'Solaris', 'Ignis', 'Radiance', 'Helios', 'Pyre', 'Nova', 'Dawn', 'Zenith', 'Flicker'],
  wolf:    ['Shadow', 'Fang', 'Luna', 'Storm', 'Howl', 'Fenrir', 'Timber', 'Ghost', 'Alpha', 'Blitz'],
  cat:     ['Whiskers', 'Nyx', 'Mochi', 'Salem', 'Pixel', 'Mittens', 'Luna', 'Cleo', 'Felix', 'Jinx'],
  rabbit:  ['Clover', 'Thumper', 'Hazel', 'Cotton', 'Biscuit', 'Pippin', 'Maple', 'Nutmeg', 'Dusty', 'Hop'],
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}

function randomVariation(base: number, pct: number = 0.15): number {
  const min = Math.floor(base * (1 - pct));
  const max = Math.ceil(base * (1 + pct));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePet(owner: string, overrides?: Partial<Pet>): Pet {
  const species = overrides?.species || pick(SPECIES);
  const base = BASE_STATS[species];
  const p1 = pick(PERSONALITIES);
  let p2 = pick(PERSONALITIES);
  while (p2 === p1) p2 = pick(PERSONALITIES);

  const now = Date.now();

  return {
    id: uuid(),
    name: pick(PET_NAMES[species]),
    species,
    element: pick(ELEMENTS),
    level: 1,
    xp: 0,
    stats: {
      hp: randomVariation(base.hp),
      attack: randomVariation(base.attack),
      defense: randomVariation(base.defense),
      speed: randomVariation(base.speed),
      charm: randomVariation(base.charm),
    },
    personality: [p1, p2],
    mood: 'happy',
    hunger: 80,
    energy: 100,
    happiness: 80,
    appearance: {
      color: randomColor(),
      pattern: pick(PATTERNS),
      size: pick(SIZES),
    },
    generation: 0,
    parentIds: null,
    owner,
    bornAt: now,
    lastFed: now,
    lastPlayed: now,
    lastSlept: now,
    sleepingUntil: 0,
    breedCooldownUntil: 0,
    memory: [],
    ...overrides,
  };
}

export function updatePetNeeds(pet: Pet): Pet {
  const now = Date.now();
  const hoursSinceLastFed = (now - pet.lastFed) / (1000 * 60 * 60);
  const hoursSinceLastPlayed = (now - pet.lastPlayed) / (1000 * 60 * 60);

  let hunger = Math.max(0, pet.hunger - Math.floor(hoursSinceLastFed * 5));
  let happiness = Math.max(0, pet.happiness - Math.floor(hoursSinceLastPlayed * 3));
  let energy = pet.energy;

  // Sleeping restores energy
  if (pet.sleepingUntil > now) {
    energy = Math.min(100, pet.energy + 50);
  } else if (pet.sleepingUntil > 0 && pet.sleepingUntil <= now) {
    energy = 100;
  }

  // Determine mood
  let mood: Pet['mood'] = 'neutral';
  if (hunger < 20) mood = 'hungry';
  else if (energy < 20) mood = 'sleepy';
  else if (happiness > 80) mood = 'happy';
  else if (happiness > 90 && energy > 80) mood = 'excited';

  return { ...pet, hunger, happiness, energy, mood };
}

export function feedPet(pet: Pet): Pet {
  return {
    ...pet,
    hunger: Math.min(100, pet.hunger + 30),
    happiness: Math.min(100, pet.happiness + 5),
    lastFed: Date.now(),
  };
}

export function playWithPet(pet: Pet): Pet {
  if (pet.energy < 10) return pet;
  return {
    ...pet,
    happiness: Math.min(100, pet.happiness + 20),
    energy: Math.max(0, pet.energy - 15),
    lastPlayed: Date.now(),
  };
}

export function sleepPet(pet: Pet): Pet {
  return {
    ...pet,
    sleepingUntil: Date.now() + 60 * 1000, // 1 minute
    lastSlept: Date.now(),
  };
}

export function trainPet(pet: Pet, stat: 'attack' | 'defense' | 'speed' | 'charm'): { pet: Pet; leveledUp: boolean } {
  if (pet.energy < 20) return { pet, leveledUp: false };

  const xpGain = 25;
  let newXp = pet.xp + xpGain;
  let newLevel = pet.level;
  let leveledUp = false;

  if (newXp >= 100) {
    newXp -= 100;
    newLevel = Math.min(50, newLevel + 1);
    leveledUp = true;
  }

  const base = BASE_STATS[pet.species];
  const statBoost = leveledUp ? 1 : 0;

  return {
    pet: {
      ...pet,
      xp: newXp,
      level: newLevel,
      energy: Math.max(0, pet.energy - 20),
      stats: {
        ...pet.stats,
        [stat]: pet.stats[stat] + 1 + statBoost,
        ...(leveledUp ? {
          hp: pet.stats.hp + Math.floor(base.hp * 0.05),
        } : {}),
      },
    },
    leveledUp,
  };
}

export { SPECIES_EMOJI, BASE_STATS, SPECIES, ELEMENTS };
