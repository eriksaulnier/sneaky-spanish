import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startObserver, stopObserver } from '../../src/content/observer';
import type { WordSet } from '../../src/shared/word-filter';
import type { PhraseInfo } from '../../src/content/walker';
import type { DictionaryEntry } from '../../src/shared/types';

// Mock walker so we can verify calls without full DOM replacement logic
vi.mock('../../src/content/walker', async () => {
  const actual = await vi.importActual<typeof import('../../src/content/walker')>('../../src/content/walker');
  return {
    ...actual,
    processNode: vi.fn(actual.processNode),
    walkDOM: vi.fn(actual.walkDOM),
  };
});

vi.mock('../../src/content/visibility', () => ({
  observeSpan: vi.fn(),
}));

function makeWordSet(): WordSet {
  const entry: DictionaryEntry = { es: 'casa', ipa: '/k/', level: 'A1', pos: 'noun' };
  return new Map([['house', entry]]);
}

function makePhraseInfo(): PhraseInfo {
  return { maxWords: 1, phraseStarts: new Set() };
}

describe('observer', () => {
  beforeEach(() => {
    document.body.textContent = '';
    stopObserver();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('does not throw when starting observer', () => {
    expect(() => startObserver(makeWordSet(), makePhraseInfo())).not.toThrow();
  });

  it('ignores second call to startObserver', () => {
    startObserver(makeWordSet(), makePhraseInfo());
    // Second call should silently return
    expect(() => startObserver(makeWordSet(), makePhraseInfo())).not.toThrow();
  });

  it('stopObserver can be called without starting', () => {
    expect(() => stopObserver()).not.toThrow();
  });

  it('processes dynamically added text nodes after debounce', async () => {
    vi.useFakeTimers();
    const wordSet = makeWordSet();
    const phraseInfo = makePhraseInfo();
    startObserver(wordSet, phraseInfo);

    // Add a new element with matching text
    const p = document.createElement('p');
    p.textContent = 'The house is here';
    document.body.appendChild(p);

    // MutationObserver fires async — flush microtasks then advance timer
    await vi.advanceTimersByTimeAsync(50);

    // The observer should have processed the node and created sneaky-word spans
    const spans = p.querySelectorAll('.sneaky-word');
    expect(spans.length).toBe(1);
    expect((spans[0] as HTMLElement).dataset.original).toBe('house');
  });

  it('does not process nodes inside .sneaky-word elements', async () => {
    vi.useFakeTimers();
    startObserver(makeWordSet(), makePhraseInfo());

    const span = document.createElement('span');
    span.className = 'sneaky-word';
    span.textContent = 'already processed';
    document.body.appendChild(span);

    await vi.advanceTimersByTimeAsync(50);

    // Should not have been processed further
    expect(span.querySelector('.sneaky-word')).toBeNull();
    expect(span.textContent).toBe('already processed');
  });
});
