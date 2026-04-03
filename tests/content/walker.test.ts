import { beforeEach, describe, expect, it } from 'vitest';
import {
  computePhraseInfo,
  processNode,
  walkDOM,
} from '../../src/content/walker';
import type { DictionaryEntry } from '../../src/shared/types';
import type { WordSet } from '../../src/shared/word-filter';

function makeWordSet(
  entries: Record<
    string,
    Omit<DictionaryEntry, 'level' | 'pos'> &
      Partial<Pick<DictionaryEntry, 'level' | 'pos'>>
  >,
): WordSet {
  const map: WordSet = new Map();
  for (const [key, val] of Object.entries(entries)) {
    map.set(key, {
      es: val.es,
      ipa: val.ipa,
      level: val.level ?? 'A1',
      pos: val.pos ?? 'noun',
    });
  }
  return map;
}

const wordSet = makeWordSet({
  house: { es: 'casa', ipa: '/ˈkasa/' },
  cat: { es: 'gato', ipa: '/ˈɡato/' },
  'good morning': { es: 'buenos días', ipa: '/ˈbwenos ˈdias/', pos: 'phrase' },
  good: { es: 'bueno', ipa: '/ˈbweno/' },
  'ice cream': { es: 'helado', ipa: '/eˈlaðo/', pos: 'phrase' },
});

function createTextInDOM(text: string, parentTag = 'p'): Text {
  const parent = document.createElement(parentTag);
  const textNode = document.createTextNode(text);
  parent.appendChild(textNode);
  document.body.appendChild(parent);
  return textNode;
}

beforeEach(() => {
  document.body.textContent = '';
});

// ---------------------------------------------------------------------------
// computePhraseInfo
// ---------------------------------------------------------------------------

describe('computePhraseInfo', () => {
  it('returns maxWords=1 and empty phraseStarts when wordSet has no phrases', () => {
    const singleWords = makeWordSet({
      house: { es: 'casa', ipa: '/ˈkasa/' },
      cat: { es: 'gato', ipa: '/ˈɡato/' },
    });
    const info = computePhraseInfo(singleWords);
    expect(info.maxWords).toBe(1);
    expect(info.phraseStarts.size).toBe(0);
  });

  it('identifies the first word of each multi-word entry as a phrase start', () => {
    const info = computePhraseInfo(wordSet);
    expect(info.phraseStarts.has('good')).toBe(true);
    expect(info.phraseStarts.has('ice')).toBe(true);
  });

  it('does not include single words in phraseStarts', () => {
    const info = computePhraseInfo(wordSet);
    expect(info.phraseStarts.has('house')).toBe(false);
    expect(info.phraseStarts.has('cat')).toBe(false);
  });

  it('sets maxWords to the length of the longest phrase', () => {
    const ws = makeWordSet({
      'a b c': { es: 'xyz', ipa: '/xyz/', pos: 'phrase' },
      hello: { es: 'hola', ipa: '/ola/' },
    });
    const info = computePhraseInfo(ws);
    expect(info.maxWords).toBe(3);
  });

  it('returns maxWords=1 for an empty wordSet', () => {
    const info = computePhraseInfo(new Map());
    expect(info.maxWords).toBe(1);
    expect(info.phraseStarts.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// processNode — single word matching
// ---------------------------------------------------------------------------

describe('processNode — single word matching', () => {
  const phraseInfo = computePhraseInfo(wordSet);

  it('replaces a known word with a span.sneaky-word containing the translation', () => {
    const textNode = createTextInDOM('house');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('casa');
  });

  it('sets data-original to the original English word', () => {
    const textNode = createTextInDOM('house');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word') as HTMLElement;
    expect(span.dataset.original).toBe('house');
  });

  it('sets data-spanish to the translated word', () => {
    const textNode = createTextInDOM('house');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word') as HTMLElement;
    expect(span.dataset.spanish).toBe('casa');
  });

  it('sets data-ipa to the IPA string', () => {
    const textNode = createTextInDOM('house');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word') as HTMLElement;
    expect(span.dataset.ipa).toBe('/ˈkasa/');
  });

  it('leaves unknown words as plain text', () => {
    const textNode = createTextInDOM('banana');
    processNode(textNode, wordSet, phraseInfo);
    expect(document.querySelector('span.sneaky-word')).toBeNull();
    expect(document.querySelector('p')?.textContent).toBe('banana');
  });

  it('returns false when no matches are found', () => {
    const textNode = createTextInDOM('banana');
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(false);
  });

  it('returns true when at least one replacement is made', () => {
    const textNode = createTextInDOM('house');
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(true);
  });

  it('replaces only matching words and keeps surrounding text intact', () => {
    const textNode = createTextInDOM('my house is nice');
    processNode(textNode, wordSet, phraseInfo);
    const p = document.querySelector('p')!;
    expect(p.textContent).toBe('my casa is nice');
    expect(p.querySelectorAll('span.sneaky-word').length).toBe(1);
  });

  it('returns false for whitespace-only text nodes', () => {
    const textNode = createTextInDOM('   ');
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// processNode — case matching
// ---------------------------------------------------------------------------

describe('processNode — case matching', () => {
  const phraseInfo = computePhraseInfo(wordSet);

  it('lowercases Spanish word when English source is lowercase', () => {
    const textNode = createTextInDOM('house');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word')!;
    expect(span.textContent).toBe('casa');
  });

  it('capitalizes Spanish word when English source is capitalized', () => {
    const textNode = createTextInDOM('House');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word')!;
    expect(span.textContent).toBe('Casa');
  });

  it('data-spanish reflects the same capitalization as textContent', () => {
    const textNode = createTextInDOM('House');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word') as HTMLElement;
    expect(span.dataset.spanish).toBe('Casa');
  });
});

// ---------------------------------------------------------------------------
// processNode — phrase matching
// ---------------------------------------------------------------------------

describe('processNode — phrase matching', () => {
  const phraseInfo = computePhraseInfo(wordSet);

  it('matches a two-word phrase and replaces both words with a single span', () => {
    const textNode = createTextInDOM('good morning');
    processNode(textNode, wordSet, phraseInfo);
    const spans = document.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('buenos días');
  });

  it('sets data-original to the original multi-word phrase', () => {
    const textNode = createTextInDOM('good morning');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word') as HTMLElement;
    expect(span.dataset.original).toBe('good morning');
  });

  it('prefers the longer phrase match over a shorter single-word match', () => {
    const textNode = createTextInDOM('good morning');
    processNode(textNode, wordSet, phraseInfo);
    const spans = document.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('buenos días');
  });

  it('falls back to single word when phrase continuation does not match', () => {
    const textNode = createTextInDOM('good night');
    processNode(textNode, wordSet, phraseInfo);
    const spans = document.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('bueno');
  });

  it('matches phrase with extra whitespace between words', () => {
    const textNode = createTextInDOM('good  morning');
    processNode(textNode, wordSet, phraseInfo);
    const spans = document.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('buenos días');
  });

  it('does not match phrase when punctuation separates the words', () => {
    const textNode = createTextInDOM('good, morning');
    processNode(textNode, wordSet, phraseInfo);
    const spans = document.querySelectorAll('span.sneaky-word');
    // "good" alone should match; "morning" is not in the dictionary
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('bueno');
  });

  it('matches ice cream phrase', () => {
    const textNode = createTextInDOM('I want ice cream');
    processNode(textNode, wordSet, phraseInfo);
    const spans = document.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('helado');
  });

  it('capitalizes phrase translation when phrase starts with a capital letter', () => {
    const textNode = createTextInDOM('Good morning');
    processNode(textNode, wordSet, phraseInfo);
    const span = document.querySelector('span.sneaky-word')!;
    expect(span.textContent).toBe('Buenos días');
  });
});

// ---------------------------------------------------------------------------
// processNode — skip behavior
// ---------------------------------------------------------------------------

describe('processNode — skip behavior', () => {
  const phraseInfo = computePhraseInfo(wordSet);

  // SCRIPT and STYLE must remain detached — appending to body causes jsdom to execute/parse them
  const detachedSkipTags = ['SCRIPT', 'STYLE'] as const;
  const attachedSkipTags = ['CODE', 'PRE', 'TEXTAREA', 'INPUT'] as const;

  for (const tag of detachedSkipTags) {
    it(`skips text inside <${tag.toLowerCase()}>`, () => {
      const el = document.createElement(tag);
      const textNode = document.createTextNode('// house');
      el.appendChild(textNode);
      // Do NOT append to body — jsdom would execute/parse the content
      const result = processNode(textNode, wordSet, phraseInfo);
      expect(result).toBe(false);
    });
  }

  for (const tag of attachedSkipTags) {
    it(`skips text inside <${tag.toLowerCase()}>`, () => {
      const el = document.createElement(tag);
      const textNode = document.createTextNode('house');
      el.appendChild(textNode);
      document.body.appendChild(el);
      const result = processNode(textNode, wordSet, phraseInfo);
      expect(result).toBe(false);
      expect(document.querySelector('span.sneaky-word')).toBeNull();
    });
  }

  it('skips text inside elements with contenteditable="true"', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    const textNode = document.createTextNode('house');
    div.appendChild(textNode);
    document.body.appendChild(div);
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(false);
    expect(document.querySelector('span.sneaky-word')).toBeNull();
  });

  it('skips text nested inside a contenteditable descendant', () => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    inner.setAttribute('contenteditable', 'true');
    const textNode = document.createTextNode('house');
    inner.appendChild(textNode);
    outer.appendChild(inner);
    document.body.appendChild(outer);
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(false);
  });

  it('skips text inside elements with class sneaky-word', () => {
    const span = document.createElement('span');
    span.className = 'sneaky-word';
    const textNode = document.createTextNode('house');
    span.appendChild(textNode);
    document.body.appendChild(span);
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(false);
    // The outer sneaky-word span should not have gained a child span
    expect(span.querySelector('span')).toBeNull();
  });

  it('does not skip text inside a normal div (contenteditable not set)', () => {
    const div = document.createElement('div');
    const textNode = document.createTextNode('house');
    div.appendChild(textNode);
    document.body.appendChild(div);
    const result = processNode(textNode, wordSet, phraseInfo);
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// walkDOM
// ---------------------------------------------------------------------------

describe('walkDOM', () => {
  const phraseInfo = computePhraseInfo(wordSet);

  it('processes all text nodes in a subtree', () => {
    const container = document.createElement('div');
    const p1 = document.createElement('p');
    p1.textContent = 'my house';
    const p2 = document.createElement('p');
    p2.textContent = 'my cat';
    container.appendChild(p1);
    container.appendChild(p2);
    document.body.appendChild(container);

    walkDOM(container, wordSet, phraseInfo);

    const spans = container.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(2);
    const texts = Array.from(spans).map((s) => s.textContent);
    expect(texts).toContain('casa');
    expect(texts).toContain('gato');
  });

  it('skips text nodes inside skip elements during tree walk', () => {
    const container = document.createElement('div');
    const code = document.createElement('code');
    code.textContent = 'house';
    container.appendChild(code);
    document.body.appendChild(container);

    walkDOM(container, wordSet, phraseInfo);
    expect(container.querySelector('span.sneaky-word')).toBeNull();
  });

  it('handles a subtree with no text nodes gracefully', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    expect(() => walkDOM(container, wordSet, phraseInfo)).not.toThrow();
  });

  it('creates spans for matches across multiple sibling elements', () => {
    const container = document.createElement('div');
    ['house', 'cat', 'house'].forEach((word) => {
      const el = document.createElement('span');
      el.textContent = word;
      container.appendChild(el);
    });
    document.body.appendChild(container);

    walkDOM(container, wordSet, phraseInfo);

    const spans = container.querySelectorAll('span.sneaky-word');
    expect(spans.length).toBe(3);
  });

  it('does not process nodes outside the given root', () => {
    const inside = document.createElement('p');
    inside.textContent = 'house';
    const outside = document.createElement('p');
    outside.textContent = 'cat';
    document.body.appendChild(inside);
    document.body.appendChild(outside);

    walkDOM(inside, wordSet, phraseInfo);

    expect(inside.querySelector('span.sneaky-word')).not.toBeNull();
    expect(outside.querySelector('span.sneaky-word')).toBeNull();
  });
});
