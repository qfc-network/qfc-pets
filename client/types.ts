export interface Pet {
  id: string;
  name: string;
  species: "dragon" | "phoenix" | "wolf" | "cat" | "rabbit";
  element: "fire" | "water" | "earth" | "lightning" | "shadow";
  level: number;
  xp: number;
  stats: { hp: number; attack: number; defense: number; speed: number; charm: number };
  personality: [string, string];
  mood: "happy" | "neutral" | "hungry" | "sleepy" | "excited";
  hunger: number;
  energy: number;
  happiness: number;
  appearance: { color: string; pattern: string; size: string };
  generation: number;
  parentIds: [string, string] | null;
  owner: string;
  bornAt: number;
  lastFed: number;
  lastPlayed: number;
  lastSlept: number;
  sleepingUntil: number;
  breedCooldownUntil: number;
  memory: string[];
}

export interface BattleResult {
  id: string;
  pet1Id: string;
  pet2Id: string;
  winnerId: string;
  log: string[];
  timestamp: number;
}

export const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', phoenix: '🦅', wolf: '🐺', cat: '🐱', rabbit: '🐰'
};

export const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', neutral: '😐', hungry: '🍖', sleepy: '😴', excited: '🤩'
};

export const ELEMENT_EMOJI: Record<string, string> = {
  fire: '🔥', water: '💧', earth: '🌿', lightning: '⚡', shadow: '🌑'
};
