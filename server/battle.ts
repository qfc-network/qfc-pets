import { v4 as uuid } from 'uuid';
import { Pet, BattleResult } from './types';

const ELEMENT_ADVANTAGE: Record<string, string> = {
  fire: 'earth',
  earth: 'lightning',
  lightning: 'water',
  water: 'fire',
  shadow: 'shadow', // shadow is neutral
};

function hasAdvantage(attacker: Pet, defender: Pet): boolean {
  return ELEMENT_ADVANTAGE[attacker.element] === defender.element;
}

function rollDamage(attacker: Pet, defender: Pet): number {
  const multiplier = 0.8 + Math.random() * 0.4; // 0.8-1.2
  let damage = attacker.stats.attack * multiplier - defender.stats.defense * 0.5;
  if (hasAdvantage(attacker, defender)) {
    damage *= 1.2;
  }
  return Math.max(1, Math.floor(damage));
}

export function runBattle(pet1: Pet, pet2: Pet): BattleResult {
  const log: string[] = [];
  let hp1 = pet1.stats.hp;
  let hp2 = pet2.stats.hp;
  const maxHp1 = pet1.stats.hp;
  const maxHp2 = pet2.stats.hp;

  log.push(`⚔️ Battle begins! ${pet1.name} vs ${pet2.name}!`);

  if (hasAdvantage(pet1, pet2)) {
    log.push(`${pet1.name}'s ${pet1.element} has advantage over ${pet2.name}'s ${pet2.element}!`);
  } else if (hasAdvantage(pet2, pet1)) {
    log.push(`${pet2.name}'s ${pet2.element} has advantage over ${pet1.name}'s ${pet1.element}!`);
  }

  let turn = 0;
  const maxTurns = 50;

  while (hp1 > 0 && hp2 > 0 && turn < maxTurns) {
    turn++;

    // Determine turn order by speed
    const first = pet1.stats.speed >= pet2.stats.speed ? pet1 : pet2;
    const second = first === pet1 ? pet2 : pet1;

    // First attacker
    const dmg1 = rollDamage(first, second);
    if (first === pet1) {
      hp2 -= dmg1;
      log.push(`Turn ${turn}: ${pet1.name} attacks for ${dmg1} damage! (${pet2.name}: ${Math.max(0, hp2)}/${maxHp2} HP)`);
    } else {
      hp1 -= dmg1;
      log.push(`Turn ${turn}: ${pet2.name} attacks for ${dmg1} damage! (${pet1.name}: ${Math.max(0, hp1)}/${maxHp1} HP)`);
    }

    if (hp1 <= 0 || hp2 <= 0) break;

    // Second attacker
    const dmg2 = rollDamage(second, first);
    if (second === pet2) {
      hp1 -= dmg2;
      log.push(`Turn ${turn}: ${pet2.name} attacks for ${dmg2} damage! (${pet1.name}: ${Math.max(0, hp1)}/${maxHp1} HP)`);
    } else {
      hp2 -= dmg2;
      log.push(`Turn ${turn}: ${pet1.name} attacks for ${dmg2} damage! (${pet2.name}: ${Math.max(0, hp2)}/${maxHp2} HP)`);
    }
  }

  const winnerId = hp1 > hp2 ? pet1.id : pet2.id;
  const winnerName = hp1 > hp2 ? pet1.name : pet2.name;
  log.push(`🏆 ${winnerName} wins the battle!`);

  return {
    id: uuid(),
    pet1Id: pet1.id,
    pet2Id: pet2.id,
    winnerId,
    log,
    timestamp: Date.now(),
  };
}

export function getXpReward(isWinner: boolean): number {
  return isWinner ? 50 : 15;
}
