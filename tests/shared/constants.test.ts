import { describe, it, expect } from 'vitest';
import { isLevelIncluded } from '../../src/shared/constants';

describe('isLevelIncluded', () => {
  it('includes A1 word at A1 level', () => {
    expect(isLevelIncluded('A1', 'A1')).toBe(true);
  });
});
