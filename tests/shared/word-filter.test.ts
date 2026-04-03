import { describe, expect, it } from 'vitest';
import type { Dictionary } from '../../src/shared/types';
import { ALLOWED_POS, buildWordSet } from '../../src/shared/word-filter';

const testDict: Dictionary = {
  house: { es: 'casa', ipa: '/k/', level: 'A1', pos: 'noun' },
  cat: { es: 'gato', ipa: '/g/', level: 'A2', pos: 'noun' },
  run: { es: 'correr', ipa: '/k/', level: 'A1', pos: 'verb' },
  beautiful: { es: 'hermoso', ipa: '/e/', level: 'B1', pos: 'adj' },
  'good morning': { es: 'buenos días', ipa: '/b/', level: 'A1', pos: 'phrase' },
  library: { es: 'biblioteca', ipa: '/b/', level: 'B2', pos: 'noun' },
};

describe('ALLOWED_POS', () => {
  it('contains "noun"', () => {
    expect(ALLOWED_POS.has('noun')).toBe(true);
  });

  it('contains "phrase"', () => {
    expect(ALLOWED_POS.has('phrase')).toBe(true);
  });

  it('does not contain "verb"', () => {
    expect(ALLOWED_POS.has('verb')).toBe(false);
  });

  it('does not contain "adj"', () => {
    expect(ALLOWED_POS.has('adj')).toBe(false);
  });

  it('does not contain "adv"', () => {
    expect(ALLOWED_POS.has('adv')).toBe(false);
  });
});

describe('buildWordSet', () => {
  it('includes nouns at or below the selected level', () => {
    const wordSet = buildWordSet(testDict, 'A2');
    expect(wordSet.has('house')).toBe(true);
    expect(wordSet.has('cat')).toBe(true);
  });

  it('includes phrases at or below the selected level', () => {
    const wordSet = buildWordSet(testDict, 'A1');
    expect(wordSet.has('good morning')).toBe(true);
  });

  it('excludes verbs', () => {
    const wordSet = buildWordSet(testDict, 'C2');
    expect(wordSet.has('run')).toBe(false);
  });

  it('excludes adjectives', () => {
    const wordSet = buildWordSet(testDict, 'C2');
    expect(wordSet.has('beautiful')).toBe(false);
  });

  it('excludes words above the selected level', () => {
    const wordSet = buildWordSet(testDict, 'A1');
    expect(wordSet.has('cat')).toBe(false);
    expect(wordSet.has('library')).toBe(false);
  });

  it('A1 only returns A1 words', () => {
    const wordSet = buildWordSet(testDict, 'A1');
    expect(wordSet.size).toBe(2);
    expect(wordSet.has('house')).toBe(true);
    expect(wordSet.has('good morning')).toBe(true);
  });

  it('C2 returns words from all levels', () => {
    const wordSet = buildWordSet(testDict, 'C2');
    expect(wordSet.has('house')).toBe(true);
    expect(wordSet.has('cat')).toBe(true);
    expect(wordSet.has('library')).toBe(true);
    expect(wordSet.has('good morning')).toBe(true);
  });

  it('empty dictionary returns empty map', () => {
    const wordSet = buildWordSet({}, 'A1');
    expect(wordSet.size).toBe(0);
  });

  it('returns a Map keyed by English word with DictionaryEntry values', () => {
    const wordSet = buildWordSet(testDict, 'A2');
    expect(wordSet).toBeInstanceOf(Map);
    const houseEntry = wordSet.get('house');
    expect(houseEntry).toBeDefined();
    expect(houseEntry?.es).toBe('casa');
    expect(houseEntry?.ipa).toBe('/k/');
    expect(houseEntry?.level).toBe('A1');
    expect(houseEntry?.pos).toBe('noun');
  });
});
