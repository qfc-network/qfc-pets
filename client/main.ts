import { Pet } from './types';
import { api } from './api';
import { renderPetCard, renderAdoptCard } from './PetCard';
import { renderPetDetail } from './PetDetail';
import { renderChatView } from './ChatView';
import { renderBreedView } from './BreedView';
import { renderBattleView } from './BattleView';
import {
  connectWallet as chainConnect,
  connectWithKey,
  getWalletState,
  getChainInfo,
  mintPetOnChain,
} from './chain';

type View = 'home' | 'detail' | 'chat' | 'breed' | 'battle';

let currentView: View = 'home';
let currentPet: Pet | null = null;
let pets: Pet[] = [];

const app = document.getElementById('app')!;

function showToast(msg: string) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function renderHeader(): string {
  return `
    <header>
      <h1>QFC AI Pets</h1>
      <nav>
        <button class="nav-btn ${currentView === 'home' ? 'active' : ''}" data-view="home">🏠 Pets</button>
        <button class="nav-btn ${currentView === 'breed' ? 'active' : ''}" data-view="breed">❤️ Breed</button>
        <button class="nav-btn ${currentView === 'battle' ? 'active' : ''}" data-view="battle">⚔️ Battle</button>
      </nav>
    </header>
  `;
}

async function loadPets() {
  try {
    pets = await api.getPets();
  } catch {
    pets = [];
  }
}

async function navigate(view: View, pet?: Pet) {
  currentView = view;
  if (pet) currentPet = pet;
  await loadPets();
  render();
}

function render() {
  app.innerHTML = renderHeader();

  const content = document.createElement('div');
  content.id = 'content';

  switch (currentView) {
    case 'home':
      renderHome(content);
      break;
    case 'detail':
      if (currentPet) {
        const fresh = pets.find(p => p.id === currentPet!.id) || currentPet;
        content.appendChild(renderPetDetail(
          fresh,
          () => navigate('home'),
          (pet) => navigate('chat', pet),
          (updated) => {
            currentPet = updated;
            navigate('detail', updated);
          },
          showToast,
        ));
      }
      break;
    case 'chat':
      if (currentPet) {
        const fresh = pets.find(p => p.id === currentPet!.id) || currentPet;
        content.appendChild(renderChatView(fresh, () => navigate('detail', fresh)));
      }
      break;
    case 'breed':
      content.appendChild(renderBreedView(
        pets,
        () => navigate('home'),
        () => navigate('home'),
        showToast,
      ));
      break;
    case 'battle':
      content.appendChild(renderBattleView(pets, () => navigate('home'), showToast));
      break;
  }

  app.appendChild(content);

  // Wire up nav buttons
  app.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = (btn as HTMLElement).dataset.view as View;
      navigate(view);
    });
  });
}

function renderHome(container: HTMLElement) {
  if (pets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🐾</div>
        <h2>No pets yet!</h2>
        <p style="margin: 12px 0">Adopt your first pet to get started.</p>
        <button class="btn" id="first-adopt">🎁 Adopt Your First Pet</button>
      </div>
    `;
    container.querySelector('#first-adopt')?.addEventListener('click', async () => {
      try {
        const pet = await api.adopt();
        showToast(`Welcome ${pet.name} the ${pet.species}! 🎉`);
        await navigate('home');
      } catch (e: any) { showToast(e.message); }
    });
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'pet-grid';

  pets.forEach(pet => {
    grid.appendChild(renderPetCard(pet, () => navigate('detail', pet)));
  });

  grid.appendChild(renderAdoptCard(async () => {
    try {
      const pet = await api.adopt();
      showToast(`Welcome ${pet.name} the ${pet.species}! 🎉`);
      await navigate('home');
    } catch (e: any) { showToast(e.message); }
  }));

  container.appendChild(grid);
}

// ── Chain integration ──────────────────────────────
async function loadChainInfo(): Promise<void> {
  try {
    const info = await getChainInfo();
    const el = document.getElementById("chain-block");
    if (el) el.textContent = `#${info.blockNumber}`;
  } catch {}
}

async function handleConnectWallet(): Promise<void> {
  const btnEl = document.getElementById("btn-connect-wallet")!;
  try {
    if (typeof (window as any).ethereum !== "undefined") {
      await chainConnect();
    } else {
      const key = prompt("No MetaMask detected.\nEnter testnet private key (0x...):");
      if (!key) return;
      await connectWithKey(key);
    }
    const ws = getWalletState();
    if (!ws.connected || !ws.address) return;
    document.getElementById("wallet-addr")!.textContent = ws.address.slice(0, 6) + "..." + ws.address.slice(-4);
    document.getElementById("wallet-bal")!.textContent = parseFloat(ws.balance || "0").toFixed(2);
    document.getElementById("wallet-info")!.style.display = "inline";
    btnEl.textContent = "✅ Connected";
    (btnEl as HTMLButtonElement).style.background = "#1a3a1a";
  } catch (err: any) {
    alert("Wallet connection failed: " + (err.message || err));
  }
}

document.getElementById("btn-connect-wallet")?.addEventListener("click", handleConnectWallet);
loadChainInfo();

// Make chain functions available to sub-views
(window as any).__qfcChain = { getWalletState, mintPetOnChain };

// Initial load
navigate('home');
