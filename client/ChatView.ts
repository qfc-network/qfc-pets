import { Pet, SPECIES_EMOJI } from './types';
import { api } from './api';

export function renderChatView(pet: Pet, onBack: () => void): HTMLElement {
  const el = document.createElement('div');
  el.className = 'fade-in';

  el.innerHTML = `
    <button class="back-btn">&larr; Back to ${pet.name}</button>
    <div class="chat-container">
      <div style="text-align:center; margin-bottom:12px">
        <span style="font-size:2rem">${SPECIES_EMOJI[pet.species]}</span>
        <div class="pet-name">${pet.name}</div>
        <div style="font-size:0.8rem; color:var(--text2)">${pet.personality.join(' & ')} ${pet.species}</div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${pet.memory.map(m => {
          const isPet = m.startsWith(pet.name + ':');
          const text = m.replace(/^(You|[^:]+):/, '').trim();
          return `<div class="chat-bubble ${isPet ? 'pet' : 'user'}">${text}</div>`;
        }).join('')}
      </div>
      <div class="chat-input">
        <input type="text" id="chat-input" placeholder="Say something to ${pet.name}..." autocomplete="off" />
        <button class="btn" id="chat-send">Send</button>
      </div>
    </div>
  `;

  el.querySelector('.back-btn')!.addEventListener('click', onBack);

  const messages = el.querySelector('#chat-messages') as HTMLElement;
  const input = el.querySelector('#chat-input') as HTMLInputElement;
  const sendBtn = el.querySelector('#chat-send') as HTMLButtonElement;

  async function send() {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user fade-in';
    userBubble.textContent = msg;
    messages.appendChild(userBubble);
    messages.scrollTop = messages.scrollHeight;

    try {
      const { response } = await api.chat(pet.id, msg);
      const petBubble = document.createElement('div');
      petBubble.className = 'chat-bubble pet fade-in';
      petBubble.textContent = response;
      messages.appendChild(petBubble);
      messages.scrollTop = messages.scrollHeight;
    } catch {
      const errBubble = document.createElement('div');
      errBubble.className = 'chat-bubble pet fade-in';
      errBubble.textContent = '*confused noises*';
      messages.appendChild(errBubble);
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  // Auto-greet if no history
  if (pet.memory.length === 0) {
    setTimeout(async () => {
      try {
        const { response } = await api.chat(pet.id, 'hello');
        const petBubble = document.createElement('div');
        petBubble.className = 'chat-bubble pet fade-in';
        petBubble.textContent = response;
        messages.appendChild(petBubble);
      } catch {}
    }, 300);
  }

  return el;
}
