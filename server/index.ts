import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { GameState, Pet } from './types';
import { generatePet, updatePetNeeds, feedPet, playWithPet, sleepPet, trainPet } from './pets';
import { generateResponse } from './chat';
import { runBattle, getXpReward } from './battle';
import { breedPets, canBreed } from './breed';

const PORT = 3230;
const STATE_DIR = path.join(os.homedir(), '.qfc-pets');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

function loadState(): GameState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load state, starting fresh:', e);
  }
  return { users: {}, pets: {}, battleLog: [] };
}

function saveState(state: GameState): void {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

let state = loadState();

const app = express();
app.use(express.json());

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Default user
const DEFAULT_USER = 'player';
function ensureUser(): void {
  if (!state.users[DEFAULT_USER]) {
    state.users[DEFAULT_USER] = { name: DEFAULT_USER, pets: [], battles: { wins: 0, losses: 0 } };
    saveState(state);
  }
}
ensureUser();

// Helper to update all pet needs
function refreshPets(): void {
  for (const id of Object.keys(state.pets)) {
    state.pets[id] = updatePetNeeds(state.pets[id]);
  }
}

// GET /api/pets — list all user pets
app.get('/api/pets', (_req, res) => {
  refreshPets();
  const user = state.users[DEFAULT_USER];
  const pets = user.pets.map(id => state.pets[id]).filter(Boolean);
  res.json(pets);
});

// GET /api/pets/:id — get single pet
app.get('/api/pets/:id', (req, res) => {
  refreshPets();
  const pet = state.pets[req.params.id];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(pet);
});

// POST /api/pets/adopt — adopt a new pet
app.post('/api/pets/adopt', (_req, res) => {
  const pet = generatePet(DEFAULT_USER);
  state.pets[pet.id] = pet;
  state.users[DEFAULT_USER].pets.push(pet.id);
  saveState(state);
  res.json(pet);
});

// POST /api/pets/:id/feed
app.post('/api/pets/:id/feed', (req, res) => {
  refreshPets();
  const pet = state.pets[req.params.id];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  if (pet.sleepingUntil > Date.now()) return res.status(400).json({ error: 'Pet is sleeping' });
  state.pets[pet.id] = updatePetNeeds(feedPet(pet));
  saveState(state);
  res.json(state.pets[pet.id]);
});

// POST /api/pets/:id/play
app.post('/api/pets/:id/play', (req, res) => {
  refreshPets();
  const pet = state.pets[req.params.id];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  if (pet.sleepingUntil > Date.now()) return res.status(400).json({ error: 'Pet is sleeping' });
  if (pet.energy < 10) return res.status(400).json({ error: 'Pet is too tired to play' });
  state.pets[pet.id] = updatePetNeeds(playWithPet(pet));
  saveState(state);
  res.json(state.pets[pet.id]);
});

// POST /api/pets/:id/sleep
app.post('/api/pets/:id/sleep', (req, res) => {
  refreshPets();
  const pet = state.pets[req.params.id];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  if (pet.sleepingUntil > Date.now()) return res.status(400).json({ error: 'Pet is already sleeping' });
  state.pets[pet.id] = sleepPet(pet);
  saveState(state);
  res.json(state.pets[pet.id]);
});

// POST /api/pets/:id/train
app.post('/api/pets/:id/train', (req, res) => {
  refreshPets();
  const pet = state.pets[req.params.id];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  if (pet.sleepingUntil > Date.now()) return res.status(400).json({ error: 'Pet is sleeping' });
  const stat = req.body.stat as 'attack' | 'defense' | 'speed' | 'charm';
  if (!['attack', 'defense', 'speed', 'charm'].includes(stat)) {
    return res.status(400).json({ error: 'Invalid stat' });
  }
  if (pet.energy < 20) return res.status(400).json({ error: 'Not enough energy to train' });
  const result = trainPet(pet, stat);
  state.pets[pet.id] = updatePetNeeds(result.pet);
  saveState(state);
  res.json({ pet: state.pets[pet.id], leveledUp: result.leveledUp });
});

// POST /api/pets/:id/chat
app.post('/api/pets/:id/chat', (req, res) => {
  refreshPets();
  const pet = state.pets[req.params.id];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const message = req.body.message as string;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const response = generateResponse(pet, message);

  // Store in memory (last 5)
  pet.memory.push(`You: ${message}`);
  pet.memory.push(`${pet.name}: ${response}`);
  if (pet.memory.length > 10) {
    pet.memory = pet.memory.slice(-10);
  }
  saveState(state);

  res.json({ response, pet });
});

// POST /api/breed
app.post('/api/breed', (req, res) => {
  refreshPets();
  const { pet1Id, pet2Id } = req.body;
  const pet1 = state.pets[pet1Id];
  const pet2 = state.pets[pet2Id];
  if (!pet1 || !pet2) return res.status(404).json({ error: 'Pet not found' });
  if (pet1Id === pet2Id) return res.status(400).json({ error: 'Cannot breed a pet with itself' });

  const check1 = canBreed(pet1);
  if (!check1.ok) return res.status(400).json({ error: check1.reason });
  const check2 = canBreed(pet2);
  if (!check2.ok) return res.status(400).json({ error: check2.reason });

  const child = breedPets(pet1, pet2, DEFAULT_USER);
  state.pets[child.id] = child;
  state.users[DEFAULT_USER].pets.push(child.id);

  // Set cooldowns
  state.pets[pet1Id].breedCooldownUntil = Date.now() + 60 * 1000;
  state.pets[pet2Id].breedCooldownUntil = Date.now() + 60 * 1000;
  saveState(state);

  res.json(child);
});

// POST /api/battle
app.post('/api/battle', (req, res) => {
  refreshPets();
  const { pet1Id, pet2Id } = req.body;
  const pet1 = state.pets[pet1Id];
  let pet2: Pet;

  if (pet2Id && state.pets[pet2Id]) {
    pet2 = state.pets[pet2Id];
  } else {
    // Generate AI opponent
    pet2 = generatePet('ai');
    // Scale to similar level
    pet2.level = pet1.level;
    pet2.stats.hp = Math.floor(pet2.stats.hp * (1 + pet1.level * 0.05));
    pet2.stats.attack = Math.floor(pet2.stats.attack * (1 + pet1.level * 0.03));
    pet2.stats.defense = Math.floor(pet2.stats.defense * (1 + pet1.level * 0.03));
  }

  if (!pet1) return res.status(404).json({ error: 'Pet not found' });
  if (pet1.sleepingUntil > Date.now()) return res.status(400).json({ error: 'Pet is sleeping' });

  const result = runBattle(pet1, pet2);
  state.battleLog.push(result);

  // Award XP
  const isWinner = result.winnerId === pet1.id;
  const xp = getXpReward(isWinner);
  state.pets[pet1.id].xp += xp;

  // Check level up
  while (state.pets[pet1.id].xp >= 100 && state.pets[pet1.id].level < 50) {
    state.pets[pet1.id].xp -= 100;
    state.pets[pet1.id].level += 1;
  }

  // Update user battle record
  if (isWinner) {
    state.users[DEFAULT_USER].battles.wins++;
  } else {
    state.users[DEFAULT_USER].battles.losses++;
  }

  saveState(state);
  res.json({ result, xpGained: xp, leveledUp: state.pets[pet1.id].level > pet1.level, pet: state.pets[pet1.id], opponent: pet2 });
});

// GET /api/user
app.get('/api/user', (_req, res) => {
  res.json(state.users[DEFAULT_USER]);
});

// Catch-all for SPA
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Not found. Run npm run build first for production.' });
  }
});

app.listen(PORT, () => {
  console.log(`🐾 QFC AI Pets server running on http://localhost:${PORT}`);
});
