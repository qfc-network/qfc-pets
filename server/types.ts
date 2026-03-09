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

export interface User {
  name: string;
  pets: string[];
  battles: { wins: number; losses: number };
}

export interface BattleResult {
  id: string;
  pet1Id: string;
  pet2Id: string;
  winnerId: string;
  log: string[];
  timestamp: number;
}

export interface GameState {
  users: Record<string, User>;
  pets: Record<string, Pet>;
  battleLog: BattleResult[];
}
