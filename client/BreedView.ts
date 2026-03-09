import { Pet, SPECIES_EMOJI } from './types';
import { api } from './api';

export function renderBreedView(
  pets: Pet[],
  onBack: () => void,
  onBred: (child: Pet) => void,
  showToast: (msg: string) => void,
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'breed-view fade-in';

  let selected1: Pet | null = null;
  let selected2: Pet | null = null;

  function render() {
    el.innerHTML = `
      <button class="back-btn">&larr; Back to collection</button>
      <h2 class="section-title">Breed Pets</h2>
      <p style="color:var(--text2); font-size:0.85rem; margin-bottom:16px">
        Select two pets to breed. Both must be Level 5+ and not hungry.
      </p>
      <div class="breed-select">
        <div>
          <div style="font-size:0.8rem; color:var(--text2); margin-bottom:8px">Parent 1</div>
          <div class="breed-pet-list" id="list1"></div>
        </div>
        <div class="heart">❤️</div>
        <div>
          <div style="font-size:0.8rem; color:var(--text2); margin-bottom:8px">Parent 2</div>
          <div class="breed-pet-list" id="list2"></div>
        </div>
      </div>
      ${selected1 && selected2 ? `
        <div style="text-align:center; margin-top:12px">
          <button class="btn" id="breed-btn">Breed ${selected1.name} + ${selected2.name}</button>
        </div>
      ` : ''}
    `;

    el.querySelector('.back-btn')!.addEventListener('click', onBack);

    const list1 = el.querySelector('#list1')!;
    const list2 = el.querySelector('#list2')!;

    pets.forEach(pet => {
      const canUse = pet.level >= 5 && pet.hunger >= 20 && pet.sleepingUntil <= Date.now() && pet.breedCooldownUntil <= Date.now();

      const opt1 = createPetOption(pet, selected1?.id === pet.id, !canUse || selected2?.id === pet.id);
      opt1.addEventListener('click', () => {
        if (!canUse || selected2?.id === pet.id) return;
        selected1 = selected1?.id === pet.id ? null : pet;
        render();
      });
      list1.appendChild(opt1);

      const opt2 = createPetOption(pet, selected2?.id === pet.id, !canUse || selected1?.id === pet.id);
      opt2.addEventListener('click', () => {
        if (!canUse || selected1?.id === pet.id) return;
        selected2 = selected2?.id === pet.id ? null : pet;
        render();
      });
      list2.appendChild(opt2);
    });

    const breedBtn = el.querySelector('#breed-btn');
    if (breedBtn) {
      breedBtn.addEventListener('click', async () => {
        if (!selected1 || !selected2) return;
        try {
          const child = await api.breed(selected1.id, selected2.id);
          showToast(`A new ${child.species} was born: ${child.name}! 🎉`);
          onBred(child);
        } catch (e: any) {
          showToast(e.message);
        }
      });
    }
  }

  function createPetOption(pet: Pet, isSelected: boolean, isDisabled: boolean): HTMLElement {
    const div = document.createElement('div');
    div.className = `breed-pet-option${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`;
    div.innerHTML = `
      <span style="font-size:1.5rem">${SPECIES_EMOJI[pet.species]}</span>
      <div>
        <div style="font-weight:600; font-size:0.85rem">${pet.name}</div>
        <div style="font-size:0.7rem; color:var(--text2)">L${pet.level} ${pet.species} ${pet.level < 5 ? '(need L5)' : ''}</div>
      </div>
    `;
    return div;
  }

  render();
  return el;
}
