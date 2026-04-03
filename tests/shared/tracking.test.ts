import { beforeEach, describe, expect, it } from 'vitest';
import {
  getWordStats,
  getWordsToReview,
  recordClick,
  recordSeenWords,
  resetWordStats,
} from '../../src/shared/tracking';

// The chrome.storage mock is reset before each test via tests/setup.ts

describe('getWordStats', () => {
  it('returns empty object when storage is empty', async () => {
    const stats = await getWordStats();
    expect(stats).toEqual({});
  });
});

describe('recordClick', () => {
  it('creates new entry with count=1 and seenCount=0 on first click', async () => {
    await recordClick('hola');
    const stats = await getWordStats();
    expect(stats.hola.count).toBe(1);
    expect(stats.hola.seenCount).toBe(0);
  });

  it('increments count on subsequent clicks', async () => {
    await recordClick('hola');
    await recordClick('hola');
    await recordClick('hola');
    const stats = await getWordStats();
    expect(stats.hola.count).toBe(3);
  });

  it('preserves firstSeen across clicks and updates lastSeen', async () => {
    await recordClick('hola');
    const first = await getWordStats();
    const firstSeenOriginal = first.hola.firstSeen;

    await recordClick('hola');
    const second = await getWordStats();

    expect(second.hola.firstSeen).toBe(firstSeenOriginal);
    expect(second.hola.lastSeen).toBeGreaterThanOrEqual(firstSeenOriginal);
  });

  it('sets seenCount=0 for brand new words', async () => {
    await recordClick('nuevo');
    const stats = await getWordStats();
    expect(stats.nuevo.seenCount).toBe(0);
  });
});

describe('recordSeenWords', () => {
  it('creates new entries for previously unseen words with count=0 and seenCount=1', async () => {
    await recordSeenWords(['gato', 'perro']);
    const stats = await getWordStats();
    expect(stats.gato.count).toBe(0);
    expect(stats.gato.seenCount).toBe(1);
    expect(stats.perro.count).toBe(0);
    expect(stats.perro.seenCount).toBe(1);
  });

  it('increments seenCount for already-known words', async () => {
    await recordSeenWords(['gato']);
    await recordSeenWords(['gato']);
    const stats = await getWordStats();
    expect(stats.gato.seenCount).toBe(2);
  });

  it('updates lastSeen timestamp', async () => {
    const before = Date.now();
    await recordSeenWords(['gato']);
    const stats = await getWordStats();
    expect(stats.gato.lastSeen).toBeGreaterThanOrEqual(before);
  });

  it('handles mix of new and existing words in one call', async () => {
    await recordSeenWords(['gato']);
    await recordSeenWords(['gato', 'perro']);
    const stats = await getWordStats();
    expect(stats.gato.seenCount).toBe(2);
    expect(stats.perro.seenCount).toBe(1);
  });

  it('is a no-op for empty array and does not write to storage', async () => {
    const storageLocal = (
      globalThis as unknown as {
        chrome: { storage: { local: { data: Record<string, unknown> } } };
      }
    ).chrome.storage.local;
    await recordSeenWords([]);
    // storage should remain empty
    expect(storageLocal.data).toEqual({});
  });
});

describe('resetWordStats', () => {
  beforeEach(async () => {
    await recordClick('hola');
    await recordClick('adios');
    await recordSeenWords(['gato']);
  });

  it('clears ALL stats when called with no arguments', async () => {
    await resetWordStats();
    const stats = await getWordStats();
    expect(stats).toEqual({});
  });

  it('deletes only specified words when called with array', async () => {
    await resetWordStats(['hola']);
    const stats = await getWordStats();
    expect(stats.hola).toBeUndefined();
    expect(stats.adios).toBeDefined();
    expect(stats.gato).toBeDefined();
  });

  it('is a no-op for empty array', async () => {
    await resetWordStats([]);
    const stats = await getWordStats();
    expect(Object.keys(stats)).toHaveLength(3);
  });

  it('leaves other words intact when deleting specific ones', async () => {
    const before = await getWordStats();
    await resetWordStats(['hola']);
    const after = await getWordStats();
    expect(after.adios).toEqual(before.adios);
    expect(after.gato).toEqual(before.gato);
  });
});

describe('getWordsToReview', () => {
  it('returns empty array when no stats exist', async () => {
    const result = await getWordsToReview(10);
    expect(result).toEqual([]);
  });

  it('only returns words with count > 0 (excludes seen-only words)', async () => {
    await recordSeenWords(['gato']);
    await recordClick('hola');
    const result = await getWordsToReview(10);
    expect(result.map((r) => r.word)).toEqual(['hola']);
  });

  it('returns words sorted by count descending', async () => {
    await recordClick('a');
    await recordClick('b');
    await recordClick('b');
    await recordClick('c');
    await recordClick('c');
    await recordClick('c');
    const result = await getWordsToReview(10);
    expect(result.map((r) => r.word)).toEqual(['c', 'b', 'a']);
    expect(result.map((r) => r.stat.count)).toEqual([3, 2, 1]);
  });

  it('respects limit parameter', async () => {
    await recordClick('a');
    await recordClick('b');
    await recordClick('b');
    await recordClick('c');
    await recordClick('c');
    await recordClick('c');
    const result = await getWordsToReview(2);
    expect(result).toHaveLength(2);
    expect(result[0].word).toBe('c');
    expect(result[1].word).toBe('b');
  });
});

describe('mutex behavior (withLock)', () => {
  it('concurrent recordClick calls do not lose data', async () => {
    const calls = Array.from({ length: 10 }, () => recordClick('hola'));
    await Promise.all(calls);
    const stats = await getWordStats();
    expect(stats.hola.count).toBe(10);
  });

  it('a failing operation does not block subsequent operations', async () => {
    // Patch chrome.storage.local.get to throw once
    const storageLocal = (
      globalThis as unknown as {
        chrome: {
          storage: {
            local: {
              get: (
                keys: Record<string, unknown>,
              ) => Promise<Record<string, unknown>>;
            };
          };
        };
      }
    ).chrome.storage.local;
    const originalGet = storageLocal.get.bind(storageLocal);
    let threw = false;
    storageLocal.get = async (keys: Record<string, unknown>) => {
      if (!threw) {
        threw = true;
        throw new Error('storage error');
      }
      return originalGet(keys);
    };

    // This call should fail
    await expect(recordClick('hola')).rejects.toThrow('storage error');

    // Restore
    storageLocal.get = originalGet;

    // Subsequent operation should succeed
    await recordClick('hola');
    const stats = await getWordStats();
    expect(stats.hola.count).toBe(1);
  });
});
