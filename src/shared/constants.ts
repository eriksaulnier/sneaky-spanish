import type { CEFRLevel, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  level: 'A1',
  highlight: false,
  exclusions: [],
};

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_LEVEL_LABELS: Record<CEFRLevel, string> = {
  A1: 'A1 — Beginner',
  A2: 'A2 — Elementary',
  B1: 'B1 — Intermediate',
  B2: 'B2 — Upper Intermediate',
  C1: 'C1 — Advanced',
  C2: 'C2 — Mastery',
};

export function populateLevelSelect(select: HTMLSelectElement, selectedLevel?: CEFRLevel): void {
  for (const level of CEFR_LEVELS) {
    const option = document.createElement('option');
    option.value = level;
    option.textContent = CEFR_LEVEL_LABELS[level];
    select.appendChild(option);
  }
  if (selectedLevel) select.value = selectedLevel;
}

const LEVEL_INDEX: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

export function isLevelIncluded(wordLevel: CEFRLevel, userLevel: CEFRLevel): boolean {
  return LEVEL_INDEX[wordLevel] <= LEVEL_INDEX[userLevel];
}

export const SKIP_ELEMENTS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD',
  'SAMP', 'TEXTAREA', 'INPUT', 'SELECT',
]);
