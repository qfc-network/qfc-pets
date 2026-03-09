import { Pet, BattleResult } from './types';

const BASE = '/api';

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getPets: () => request<Pet[]>('/pets'),
  getPet: (id: string) => request<Pet>(`/pets/${id}`),
  adopt: () => request<Pet>('/pets/adopt', { method: 'POST' }),
  feed: (id: string) => request<Pet>(`/pets/${id}/feed`, { method: 'POST' }),
  play: (id: string) => request<Pet>(`/pets/${id}/play`, { method: 'POST' }),
  sleep: (id: string) => request<Pet>(`/pets/${id}/sleep`, { method: 'POST' }),
  train: (id: string, stat: string) =>
    request<{ pet: Pet; leveledUp: boolean }>(`/pets/${id}/train`, {
      method: 'POST',
      body: JSON.stringify({ stat }),
    }),
  chat: (id: string, message: string) =>
    request<{ response: string; pet: Pet }>(`/pets/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  breed: (pet1Id: string, pet2Id: string) =>
    request<Pet>('/breed', {
      method: 'POST',
      body: JSON.stringify({ pet1Id, pet2Id }),
    }),
  battle: (pet1Id: string, pet2Id?: string) =>
    request<{ result: BattleResult; xpGained: number; leveledUp: boolean; pet: Pet; opponent: Pet }>('/battle', {
      method: 'POST',
      body: JSON.stringify({ pet1Id, pet2Id }),
    }),
};
