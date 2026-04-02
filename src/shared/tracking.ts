import type { WordStat, WordStats } from './types';

const STORAGE_KEY = 'wordStats';

export async function getWordStats(): Promise<WordStats> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as WordStats) ?? {};
}

async function saveWordStats(stats: WordStats): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: stats });
}

export async function recordClick(word: string): Promise<void> {
  const stats = await getWordStats();
  const now = Date.now();
  const existing = stats[word];

  stats[word] = {
    count: (existing?.count ?? 0) + 1,
    firstSeen: existing?.firstSeen ?? now,
    lastSeen: now,
    streak: 0,
  };

  await saveWordStats(stats);
}

export async function updateStreaks(seen: string[], clicked: string[]): Promise<void> {
  if (seen.length === 0) return;

  const stats = await getWordStats();
  const clickedSet = new Set(clicked);
  let changed = false;

  for (const word of seen) {
    if (clickedSet.has(word)) continue;
    const existing = stats[word];
    if (existing) {
      existing.streak += 1;
      changed = true;
    }
  }

  if (changed) {
    await saveWordStats(stats);
  }
}

export async function getWordsToReview(
  limit: number,
): Promise<Array<{ word: string; stat: WordStat }>> {
  const stats = await getWordStats();
  return Object.entries(stats)
    .map(([word, stat]) => ({ word, stat }))
    .sort((a, b) => b.stat.count - a.stat.count)
    .slice(0, limit);
}
