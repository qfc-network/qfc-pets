import { v4 as uuid } from 'uuid';
import { Pet } from './types';

const PET_NAMES: Record<string, string[]> = {
  dragon:  ['Ember', 'Blaze', 'Inferno', 'Cinder', 'Pyro', 'Scorch', 'Flare', 'Ash', 'Draco', 'Rex'],
  phoenix: ['Aurora', 'Solaris', 'Ignis', 'Radiance', 'Helios', 'Pyre', 'Nova', 'Dawn', 'Zenith', 'Bliss'],
  wolf:    ['Shadow', 'Fang', 'Luna', 'Storm', 'Howl', 'Fenrir', 'Timber', 'Ghost', 'Alpha', 'Blitz'],
  cat:     ['Whiskers', 'Nyx', 'Mochi', 'Salem', 'Pixel', 'Mittens', 'Luna', 'Cleo', 'Felix', 'Jinx'],
  rabbit:  ['Clover', 'Thumper', 'Hazel', 'Cotton', 'Biscuit', 'Pippin', 'Maple', 'Nutmeg', 'Dusty', 'Hop'],
};

const PERSONALITIES = ['brave', 'lazy', 'curious', 'mischievous', 'calm', 'loyal', 'shy', 'fierce', 'gentle', 'playful'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function avgMutate(a: number, b: number): number {
  const avg = (a + b) / 2;
  const mutation = avg * (0.9 + Math.random() * 0.2); // ±10%
  return Math.max(1, Math.floor(mutation));
}

function blendColors(c1: string, c2: string): string {
  // Just pick a random hue between the two or a new one
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export function canBreed(pet: Pet): { ok: boolean; reason?: string } {
  if (pet.level < 5) return { ok: false, reason: `${pet.name} must be level 5+ (currently ${pet.level})` };
  if (pet.hunger < 20) return { ok: false, reason: `${pet.name} is too hungry` };
  if (pet.breedCooldownUntil > Date.now()) {
    const secs = Math.ceil((pet.breedCooldownUntil - Date.now()) / 1000);
    return { ok: false, reason: `${pet.name} is on cooldown (${secs}s)` };
  }
  if (pet.sleepingUntil > Date.now()) return { ok: false, reason: `${pet.name} is sleeping` };
  return { ok: true };
}

export function breedPets(parent1: Pet, parent2: Pet, owner: string): Pet {
  const species = pick([parent1.species, parent2.species]);
  const element = pick([parent1.element, parent2.element]);

  // Personality: pick from parents, small chance of new trait
  let p1 = pick([...parent1.personality, ...parent2.personality]);
  let p2: string;
  if (Math.random() < 0.2) {
    p2 = pick(PERSONALITIES);
  } else {
    p2 = pick([...parent1.personality, ...parent2.personality].filter(t => t !== p1));
    if (!p2) p2 = pick(PERSONALITIES);
  }

  const generation = Math.max(parent1.generation, parent2.generation) + 1;

  const now = Date.now();

  return {
    id: uuid(),
    name: pick(PET_NAMES[species]),
    species,
    element,
    level: 1,
    xp: 0,
    stats: {
      hp: avgMutate(parent1.stats.hp, parent2.stats.hp),
      attack: avgMutate(parent1.stats.attack, parent2.stats.attack),
      defense: avgMutate(parent1.stats.defense, parent2.stats.defense),
      speed: avgMutate(parent1.stats.speed, parent2.stats.speed),
      charm: avgMutate(parent1.stats.charm, parent2.stats.charm),
    },
    personality: [p1, p2],
    mood: 'happy',
    hunger: 80,
    energy: 100,
    happiness: 100,
    appearance: {
      color: blendColors(parent1.appearance.color, parent2.appearance.color),
      pattern: pick([parent1.appearance.pattern, parent2.appearance.pattern]),
      size: pick([parent1.appearance.size, parent2.appearance.size]),
    },
    generation,
    parentIds: [parent1.id, parent2.id],
    owner,
    bornAt: now,
    lastFed: now,
    lastPlayed: now,
    lastSlept: now,
    sleepingUntil: 0,
    breedCooldownUntil: 0,
    memory: [],
  };
}
