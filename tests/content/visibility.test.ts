import { describe, it, expect, beforeEach } from 'vitest';
import {
  startVisibilityObserver,
  observeSpan,
  getViewportSeenWords,
  stopVisibilityObserver,
} from '../../src/content/visibility';

let observerCallback: IntersectionObserverCallback;
let observedElements: Set<Element>;
let mockObserverInstance: MockIntersectionObserver;

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0.5];

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
    observedElements = new Set();
    mockObserverInstance = this;
  }

  observe(el: Element) {
    observedElements.add(el);
  }

  unobserve(el: Element) {
    observedElements.delete(el);
  }

  disconnect() {
    observedElements.clear();
  }

  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  globalThis.IntersectionObserver = MockIntersectionObserver as any;
  document.body.textContent = '';
  stopVisibilityObserver();
});

function makeSpan(word: string): HTMLElement {
  const span = document.createElement('span');
  span.className = 'sneaky-word';
  span.dataset.original = word;
  document.body.appendChild(span);
  return span;
}

// ---------------------------------------------------------------------------
// startVisibilityObserver
// ---------------------------------------------------------------------------

describe('startVisibilityObserver', () => {
  it('observes existing .sneaky-word spans in the document', () => {
    const span1 = makeSpan('casa');
    const span2 = makeSpan('gato');

    startVisibilityObserver();

    expect(observedElements.has(span1)).toBe(true);
    expect(observedElements.has(span2)).toBe(true);
  });

  it('does not create a second observer if called twice', () => {
    startVisibilityObserver();
    const firstCallback = observerCallback;

    startVisibilityObserver();

    expect(observerCallback).toBe(firstCallback);
  });
});

// ---------------------------------------------------------------------------
// observeSpan
// ---------------------------------------------------------------------------

describe('observeSpan', () => {
  it('adds a span to the observer', () => {
    startVisibilityObserver();
    const span = makeSpan('perro');

    observeSpan(span);

    expect(observedElements.has(span)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getViewportSeenWords
// ---------------------------------------------------------------------------

describe('getViewportSeenWords', () => {
  it('returns empty array initially', () => {
    expect(getViewportSeenWords()).toEqual([]);
  });

  it('returns the word after intersection fires for a span', () => {
    const span = makeSpan('casa');
    startVisibilityObserver();

    observerCallback(
      [{ isIntersecting: true, target: span } as any],
      mockObserverInstance,
    );

    expect(getViewportSeenWords()).toContain('casa');
  });

  it('returns each word only once even if multiple spans have the same data-original', () => {
    const span1 = makeSpan('casa');
    const span2 = makeSpan('casa');
    startVisibilityObserver();

    observerCallback(
      [
        { isIntersecting: true, target: span1 } as any,
        { isIntersecting: true, target: span2 } as any,
      ],
      mockObserverInstance,
    );

    const seen = getViewportSeenWords();
    expect(seen.filter((w) => w === 'casa').length).toBe(1);
  });

  it('does not include words from non-intersecting entries', () => {
    const span = makeSpan('perro');
    startVisibilityObserver();

    observerCallback(
      [{ isIntersecting: false, target: span } as any],
      mockObserverInstance,
    );

    expect(getViewportSeenWords()).not.toContain('perro');
  });
});

// ---------------------------------------------------------------------------
// stopVisibilityObserver
// ---------------------------------------------------------------------------

describe('stopVisibilityObserver', () => {
  it('clears seen words so getViewportSeenWords returns empty', () => {
    const span = makeSpan('casa');
    startVisibilityObserver();

    observerCallback(
      [{ isIntersecting: true, target: span } as any],
      mockObserverInstance,
    );
    expect(getViewportSeenWords()).toContain('casa');

    stopVisibilityObserver();

    expect(getViewportSeenWords()).toEqual([]);
  });

  it('disconnects the observer', () => {
    const span = makeSpan('casa');
    startVisibilityObserver();
    expect(observedElements.has(span)).toBe(true);

    stopVisibilityObserver();

    expect(observedElements.size).toBe(0);
  });
});
