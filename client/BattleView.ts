import { Pet, SPECIES_EMOJI } from './types';
import { api } from './api';

export function renderBattleView(
  pets: Pet[],
  onBack: () => void,
  showToast: (msg: string) => void,
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'battle-view fade-in';

  let selectedPet: Pet | null = null;
  let battleResult: { result: any; xpGained: number; leveledUp: boolean; pet: Pet; opponent: Pet } | null = null;

  function render() {
    if (battleResult) {
      renderBattleResult();
      return;
    }

    el.innerHTML = `
      <button class="back-btn">&larr; Back to collection</button>
      <h2 class="section-title">Battle Arena</h2>
      <p style="color:var(--text2); font-size:0.85rem; margin-bottom:16px">
        Select a pet to battle against a random AI opponent!
      </p>
      <div class="pet-grid" id="battle-pet-list"></div>
      ${selectedPet ? `
        <div style="margin-top:16px; text-align:center">
          <p style="margin-bottom:8px">Fight with <strong>${selectedPet.name}</strong>?</p>
          <button class="btn" id="fight-btn">⚔️ Start Battle!</button>
        </div>
      ` : ''}
    `;

    el.querySelector('.back-btn')!.addEventListener('click', onBack);

    const list = el.querySelector('#battle-pet-list')!;
    pets.forEach(pet => {
      const isSleeping = pet.sleepingUntil > Date.now();
      const card = document.createElement('div');
      card.className = `pet-card${selectedPet?.id === pet.id ? ' selected' : ''}`;
      card.style.borderColor = selectedPet?.id === pet.id ? 'var(--accent)' : '';
      if (isSleeping) card.style.opacity = '0.4';
      card.innerHTML = `
        <div class="pet-emoji-circle" style="background:${pet.appearance.color}20; border:2px solid ${pet.appearance.color}">
          <span class="level-badge">L${pet.level}</span>
          <span class="pet-emoji" style="font-size:2.5rem">${SPECIES_EMOJI[pet.species]}</span>
        </div>
        <div class="pet-name">${pet.name}</div>
        <div class="pet-species" style="font-size:0.75rem">${pet.species} &middot; ATK:${pet.stats.attack} DEF:${pet.stats.defense}</div>
      `;
      if (!isSleeping) {
        card.addEventListener('click', () => {
          selectedPet = selectedPet?.id === pet.id ? null : pet;
          render();
        });
      }
      list.appendChild(card);
    });

    const fightBtn = el.querySelector('#fight-btn');
    if (fightBtn) {
      fightBtn.addEventListener('click', async () => {
        if (!selectedPet) return;
        try {
          battleResult = await api.battle(selectedPet.id);
          render();
        } catch (e: any) {
          showToast(e.message);
        }
      });
    }
  }

  function renderBattleResult() {
    if (!battleResult) return;
    const { result, xpGained, leveledUp, pet, opponent } = battleResult;
    const won = result.winnerId === pet.id;

    el.innerHTML = `
      <button class="back-btn">&larr; Back to arena</button>
      <div class="battle-arena">
        <div class="battle-pet">
          <div style="font-size:3rem">${SPECIES_EMOJI[pet.species]}</div>
          <div class="pet-name">${pet.name}</div>
          <div style="font-size:0.75rem; color:var(--text2)">L${pet.level} ${pet.species}</div>
        </div>
        <div class="battle-vs">VS</div>
        <div class="battle-pet">
          <div style="font-size:3rem">${SPECIES_EMOJI[opponent.species]}</div>
          <div class="pet-name">${opponent.name}</div>
          <div style="font-size:0.75rem; color:var(--text2)">L${opponent.level} ${opponent.species}</div>
        </div>
      </div>
      <div style="text-align:center; margin:12px 0">
        <div style="font-size:1.5rem; font-weight:bold; color:${won ? 'var(--green)' : 'var(--red)'}">
          ${won ? '🏆 Victory!' : '💀 Defeat!'}
        </div>
        <div style="font-size:0.85rem; color:var(--text2); margin-top:4px">
          +${xpGained} XP ${leveledUp ? '🎉 LEVEL UP!' : ''}
        </div>
      </div>
      <div class="battle-log" id="battle-log"></div>
      <div style="text-align:center; margin-top:12px">
        <button class="btn" id="battle-again">Battle Again</button>
      </div>
    `;

    el.querySelector('.back-btn')!.addEventListener('click', () => {
      battleResult = null;
      selectedPet = null;
      render();
    });

    // Animate log entries
    const logEl = el.querySelector('#battle-log')!;
    result.log.forEach((entry: string, i: number) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'battle-log-entry fade-in';
        if (entry.includes('damage')) div.classList.add('damage');
        if (entry.includes('wins')) div.classList.add('winner');
        div.textContent = entry;
        logEl.appendChild(div);
        logEl.scrollTop = logEl.scrollHeight;
      }, i * 200);
    });

    el.querySelector('#battle-again')!.addEventListener('click', () => {
      battleResult = null;
      selectedPet = null;
      render();
    });
  }

  render();
  return el;
}
