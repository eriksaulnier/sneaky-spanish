import type { CEFRLevel, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  level: 'A1',
  highlight: false,
  exclusions: [],
};

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const SKIP_ELEMENTS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD',
  'SAMP', 'TEXTAREA', 'INPUT', 'SELECT',
]);
