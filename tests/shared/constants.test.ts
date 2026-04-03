import { describe, it, expect, beforeEach } from 'vitest';
import { isLevelIncluded, populateLevelSelect, CEFR_LEVELS, CEFR_LEVEL_LABELS } from '../../src/shared/constants';
import type { CEFRLevel } from '../../src/shared/types';

describe('isLevelIncluded', () => {
  it('includes A1 word at all levels', () => {
    for (const level of CEFR_LEVELS) {
      expect(isLevelIncluded('A1', level)).toBe(true);
    }
  });

  it('includes C2 word only at C2', () => {
    expect(isLevelIncluded('C2', 'C2')).toBe(true);
    expect(isLevelIncluded('C2', 'C1')).toBe(false);
    expect(isLevelIncluded('C2', 'A1')).toBe(false);
  });

  it('same level is always included', () => {
    for (const level of CEFR_LEVELS) {
      expect(isLevelIncluded(level, level)).toBe(true);
    }
  });

  it('higher word level excluded at lower user level', () => {
    expect(isLevelIncluded('B2', 'B1')).toBe(false);
    expect(isLevelIncluded('A2', 'A1')).toBe(false);
  });

  it('lower word level included at higher user level', () => {
    expect(isLevelIncluded('A1', 'C2')).toBe(true);
    expect(isLevelIncluded('B1', 'B2')).toBe(true);
  });
});

describe('populateLevelSelect', () => {
  let select: HTMLSelectElement;

  beforeEach(() => {
    select = document.createElement('select');
  });

  it('populates empty select with 6 options', () => {
    populateLevelSelect(select);
    expect(select.options.length).toBe(6);
  });

  it('options have correct values', () => {
    populateLevelSelect(select);
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('options have correct labels', () => {
    populateLevelSelect(select);
    for (const level of CEFR_LEVELS) {
      const option = select.querySelector(`option[value="${level}"]`) as HTMLOptionElement;
      expect(option.textContent).toBe(CEFR_LEVEL_LABELS[level]);
    }
  });

  it('sets selected value when provided', () => {
    populateLevelSelect(select, 'B2');
    expect(select.value).toBe('B2');
  });

  it('defaults to first option when no selection provided', () => {
    populateLevelSelect(select);
    expect(select.value).toBe('A1');
  });

  it('is idempotent — calling twice does not duplicate options', () => {
    populateLevelSelect(select, 'A1');
    populateLevelSelect(select, 'B1');
    expect(select.options.length).toBe(6);
    expect(select.value).toBe('B1');
  });
});
