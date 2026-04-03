import type { DictionaryEntry, Dictionary, CEFRLevel } from './types';
import { isLevelIncluded } from './constants';

export type WordSet = Map<string, DictionaryEntry>;

export const ALLOWED_POS = new Set(['noun', 'phrase']);

export function buildWordSet(dictionary: Dictionary, level: CEFRLevel): WordSet {
  const wordSet: WordSet = new Map();
  for (const [english, entry] of Object.entries(dictionary)) {
    if (!ALLOWED_POS.has(entry.pos)) continue;
    if (isLevelIncluded(entry.level, level)) {
      wordSet.set(english, entry);
    }
  }
  return wordSet;
}
