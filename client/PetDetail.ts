import { Pet, SPECIES_EMOJI, MOOD_EMOJI, ELEMENT_EMOJI } from './types';
import { api } from './api';

export function renderPetDetail(
  pet: Pet,
  onBack: () => void,
  onChat: (pet: Pet) => void,
  onUpdate: (pet: Pet) => void,
  showToast: (msg: string) => void,
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'detail-view fade-in';
  const isSleeping = pet.sleepingUntil > Date.now();

  el.innerHTML = `
    <button class="back-btn">&larr; Back to collection</button>
    <div class="detail-header">
      <div class="pet-emoji-circle" style="background: ${pet.appearance.color}20; border: 3px solid ${pet.appearance.color}; width:130px; height:130px; margin: 0 auto 12px;">
        <span class="level-badge">L${pet.level}</span>
        <span class="pet-emoji" style="font-size:5rem">${SPECIES_EMOJI[pet.species]}</span>
        <span class="mood-indicator">${MOOD_EMOJI[pet.mood]}</span>
      </div>
      <div class="pet-name" style="font-size:1.4rem">${pet.name}</div>
      <div class="pet-species" style="margin-bottom:8px">
        <span class="element-badge element-${pet.element}">${ELEMENT_EMOJI[pet.element]} ${pet.element}</span>
        ${pet.species} &middot; Gen ${pet.generation}
        &middot; ${pet.appearance.size} &middot; ${pet.appearance.pattern}
      </div>
      <div class="personality-tags" style="margin-bottom:8px">
        ${pet.personality.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div style="font-size:0.8rem; color: var(--text2)">
        Mood: ${pet.mood} ${MOOD_EMOJI[pet.mood]}
        ${isSleeping ? ' &middot; 💤 Sleeping' : ''}
      </div>
      <div class="xp-bar" style="max-width:200px; margin:8px auto">
        <div class="xp-fill" style="width:${pet.xp}%"></div>
      </div>
      <div style="font-size:0.7rem; color: var(--text2)">XP: ${pet.xp}/100</div>
    </div>

    <div style="margin-top:4px">
      <div class="stat-bar"><label>Hunger</label><div class="stat-bar-track"><div class="stat-bar-fill hunger" style="width:${pet.hunger}%"></div></div><span style="font-size:0.7rem;width:30px;text-align:right">${pet.hunger}</span></div>
      <div class="stat-bar"><label>Energy</label><div class="stat-bar-track"><div class="stat-bar-fill energy" style="width:${pet.energy}%"></div></div><span style="font-size:0.7rem;width:30px;text-align:right">${pet.energy}</span></div>
      <div class="stat-bar"><label>Happy</label><div class="stat-bar-track"><div class="stat-bar-fill happiness" style="width:${pet.happiness}%"></div></div><span style="font-size:0.7rem;width:30px;text-align:right">${pet.happiness}</span></div>
    </div>

    <div class="stats-grid">
      <div class="stat-item"><span>HP</span><span>${pet.stats.hp}</span></div>
      <div class="stat-item"><span>Attack</span><span>${pet.stats.attack}</span></div>
      <div class="stat-item"><span>Defense</span><span>${pet.stats.defense}</span></div>
      <div class="stat-item"><span>Speed</span><span>${pet.stats.speed}</span></div>
      <div class="stat-item"><span>Charm</span><span>${pet.stats.charm}</span></div>
      <div class="stat-item"><span>Level</span><span>${pet.level}</span></div>
    </div>

    <div class="actions">
      <button class="btn" id="btn-feed" ${isSleeping ? 'disabled' : ''}>🍖 Feed</button>
      <button class="btn" id="btn-play" ${isSleeping || pet.energy < 10 ? 'disabled' : ''}>🎾 Play</button>
      <button class="btn" id="btn-sleep" ${isSleeping ? 'disabled' : ''}>💤 Sleep</button>
      <button class="btn" id="btn-chat" ${isSleeping ? 'disabled' : ''}>💬 Chat</button>
    </div>

    <div class="section-title">Train ${isSleeping ? '(sleeping...)' : ''}</div>
    <div class="train-options">
      <button class="train-btn" data-stat="attack" ${isSleeping || pet.energy < 20 ? 'disabled' : ''}>⚔️ Attack Training</button>
      <button class="train-btn" data-stat="defense" ${isSleeping || pet.energy < 20 ? 'disabled' : ''}>🛡️ Defense Training</button>
      <button class="train-btn" data-stat="speed" ${isSleeping || pet.energy < 20 ? 'disabled' : ''}>💨 Speed Training</button>
      <button class="train-btn" data-stat="charm" ${isSleeping || pet.energy < 20 ? 'disabled' : ''}>✨ Charm Training</button>
    </div>
  `;

  el.querySelector('.back-btn')!.addEventListener('click', onBack);

  el.querySelector('#btn-feed')!.addEventListener('click', async () => {
    try {
      const updated = await api.feed(pet.id);
      showToast('Fed ' + pet.name + '! 🍖');
      onUpdate(updated);
    } catch (e: any) { showToast(e.message); }
  });

  el.querySelector('#btn-play')!.addEventListener('click', async () => {
    try {
      const updated = await api.play(pet.id);
      showToast('Played with ' + pet.name + '! 🎾');
      onUpdate(updated);
    } catch (e: any) { showToast(e.message); }
  });

  el.querySelector('#btn-sleep')!.addEventListener('click', async () => {
    try {
      const updated = await api.sleep(pet.id);
      showToast(pet.name + ' is now sleeping... 💤');
      onUpdate(updated);
    } catch (e: any) { showToast(e.message); }
  });

  el.querySelector('#btn-chat')!.addEventListener('click', () => onChat(pet));

  el.querySelectorAll('.train-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const stat = (btn as HTMLElement).dataset.stat!;
      try {
        const { pet: updated, leveledUp } = await api.train(pet.id, stat);
        showToast(leveledUp ? `${pet.name} leveled up to ${updated.level}! 🎉` : `Trained ${stat}! +25 XP`);
        onUpdate(updated);
      } catch (e: any) { showToast(e.message); }
    });
  });

  return el;
}
