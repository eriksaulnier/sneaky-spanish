import type { WordStat, WordStats } from './types';

const STORAGE_KEY = 'wordStats';

let lock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lock.then(fn);
  lock = result.then(() => {}, () => {});
  return result;
}

export async function getWordStats(): Promise<WordStats> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as WordStats) ?? {};
}

async function saveWordStats(stats: WordStats): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: stats });
}

export function recordClick(word: string): Promise<void> {
  return withLock(async () => {
    const stats = await getWordStats();
    const now = Date.now();
    const existing = stats[word];

    stats[word] = {
      count: (existing?.count ?? 0) + 1,
      firstSeen: existing?.firstSeen ?? now,
      lastSeen: now,
      seenCount: existing?.seenCount ?? 0,
    };

    await saveWordStats(stats);
  });
}

export function recordSeenWords(words: string[]): Promise<void> {
  return withLock(async () => {
    if (words.length === 0) return;

    const stats = await getWordStats();
    const now = Date.now();

    for (const word of words) {
      const existing = stats[word];
      if (existing) {
        existing.seenCount += 1;
        existing.lastSeen = now;
      } else {
        stats[word] = { count: 0, seenCount: 1, firstSeen: now, lastSeen: now };
      }
    }

    await saveWordStats(stats);
  });
}

export function resetWordStats(words?: string[]): Promise<void> {
  return withLock(async () => {
    if (!words) {
      await saveWordStats({});
      return;
    }
    if (words.length === 0) return;

    const stats = await getWordStats();
    for (const word of words) {
      delete stats[word];
    }
    await saveWordStats(stats);
  });
}

export async function getWordsToReview(
  limit: number,
): Promise<Array<{ word: string; stat: WordStat }>> {
  const stats = await getWordStats();
  return Object.entries(stats)
    .filter(([, stat]) => stat.count > 0)
    .map(([word, stat]) => ({ word, stat }))
    .sort((a, b) => b.stat.count - a.stat.count)
    .slice(0, limit);
}
