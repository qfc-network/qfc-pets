import { Pet, SPECIES_EMOJI, MOOD_EMOJI } from './types';

export function renderPetCard(pet: Pet, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'pet-card fade-in';
  const isSleeping = pet.sleepingUntil > Date.now();

  card.innerHTML = `
    <div class="pet-emoji-circle" style="background: ${pet.appearance.color}20; border: 2px solid ${pet.appearance.color}">
      <span class="level-badge">L${pet.level}</span>
      <span class="pet-emoji">${SPECIES_EMOJI[pet.species]}</span>
      <span class="mood-indicator">${MOOD_EMOJI[pet.mood]}</span>
    </div>
    <div class="pet-name">${pet.name}</div>
    <div class="pet-species">
      <span class="element-badge element-${pet.element}">${pet.element}</span>
      ${pet.species} <span class="gen-badge">Gen ${pet.generation}</span>
    </div>
    <div class="personality-tags">
      ${pet.personality.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
    <div class="stat-bar">
      <label>Hunger</label>
      <div class="stat-bar-track"><div class="stat-bar-fill hunger" style="width:${pet.hunger}%"></div></div>
    </div>
    <div class="stat-bar">
      <label>Energy</label>
      <div class="stat-bar-track"><div class="stat-bar-fill energy" style="width:${pet.energy}%"></div></div>
    </div>
    <div class="stat-bar">
      <label>Happy</label>
      <div class="stat-bar-track"><div class="stat-bar-fill happiness" style="width:${pet.happiness}%"></div></div>
    </div>
    ${isSleeping ? '<div class="sleeping-overlay">💤 Sleeping...</div>' : ''}
  `;

  card.addEventListener('click', onClick);
  return card;
}

export function renderAdoptCard(onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'adopt-card fade-in';
  card.innerHTML = `
    <div class="plus">+</div>
    <div>Adopt a Pet</div>
  `;
  card.addEventListener('click', onClick);
  return card;
}
