import type { DictionaryEntry } from '../shared/types';
import { SKIP_ELEMENTS } from '../shared/constants';

export type WordSet = Map<string, DictionaryEntry>;

const WORD_BOUNDARY = /(\s+|[.,;:!?'"()\[\]{}<>\/\\@#$%^&*+=|~`—–\-\u2018\u2019\u201C\u201D]+)/;

function shouldSkip(node: Node): boolean {
  let el: Element | null = node.parentElement;
  while (el) {
    if (SKIP_ELEMENTS.has(el.tagName)) return true;
    if (el.getAttribute('contenteditable') === 'true') return true;
    if (el.classList.contains('sneaky-word')) return true;
    el = el.parentElement;
  }
  return false;
}

function matchCase(spanish: string, original: string): string {
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return spanish[0].toUpperCase() + spanish.slice(1);
  }
  return spanish;
}

function tokenize(text: string): string[] {
  return text.split(WORD_BOUNDARY);
}

function isWordToken(token: string): boolean {
  return token.length > 0 && !/^\s+$/.test(token) && !/^[.,;:!?'"()\[\]{}<>\/\\@#$%^&*+=|~`—–\-\u2018\u2019\u201C\u201D]+$/.test(token);
}

// Try to match a multi-word phrase starting at token index i.
// Returns [entry, tokensConsumed, originalPhrase] or null.
function tryPhraseMatch(
  tokens: string[],
  i: number,
  wordSet: WordSet,
  maxWords: number,
): [DictionaryEntry, number, string] | null {
  // Collect word tokens and their indices starting from i
  const wordIndices: number[] = [];
  for (let j = i; j < tokens.length && wordIndices.length < maxWords; j++) {
    if (isWordToken(tokens[j])) {
      wordIndices.push(j);
    } else if (/^\s+$/.test(tokens[j])) {
      // whitespace between words is fine, continue
    } else {
      break; // punctuation breaks phrase matching
    }
  }

  // Try longest match first (4 words, then 3, then 2)
  for (let len = Math.min(wordIndices.length, maxWords); len >= 2; len--) {
    const phraseWords = wordIndices.slice(0, len).map((idx) => tokens[idx].toLowerCase());
    const phraseKey = phraseWords.join(' ');
    const entry = wordSet.get(phraseKey);
    if (entry) {
      const lastWordIdx = wordIndices[len - 1];
      const tokensConsumed = lastWordIdx - i + 1;
      const originalPhrase = tokens.slice(i, i + tokensConsumed).join('');
      return [entry, tokensConsumed, originalPhrase];
    }
  }

  return null;
}

export interface PhraseInfo {
  maxWords: number;
  phraseStarts: Set<string>;
}

export function computePhraseInfo(wordSet: WordSet): PhraseInfo {
  let maxWords = 1;
  const phraseStarts = new Set<string>();
  for (const key of wordSet.keys()) {
    const words = key.split(' ');
    if (words.length > 1) {
      phraseStarts.add(words[0]);
      if (words.length > maxWords) maxWords = words.length;
    }
  }
  return { maxWords, phraseStarts };
}

export function processNode(textNode: Text, wordSet: WordSet, phraseInfo: PhraseInfo): boolean {
  const text = textNode.nodeValue;
  if (!text || !text.trim()) return false;
  if (shouldSkip(textNode)) return false;

  const tokens = tokenize(text);

  // Quick check: does this text contain any potential matches?
  let hasMatch = false;
  for (const token of tokens) {
    if (!isWordToken(token)) continue;
    const lower = token.toLowerCase();
    if (wordSet.has(lower) || phraseInfo.phraseStarts.has(lower)) {
      hasMatch = true;
      break;
    }
  }
  if (!hasMatch) return false;

  const fragment = document.createDocumentFragment();
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // Try phrase match first (only for word tokens that start a known phrase)
    if (isWordToken(token) && phraseInfo.phraseStarts.has(token.toLowerCase())) {
      const phraseMatch = tryPhraseMatch(tokens, i, wordSet, phraseInfo.maxWords);
      if (phraseMatch) {
        const [entry, consumed, originalPhrase] = phraseMatch;
        const span = document.createElement('span');
        span.className = 'sneaky-word';
        span.dataset.original = originalPhrase;
        span.dataset.spanish = matchCase(entry.es, originalPhrase);
        span.dataset.ipa = entry.ipa;
        span.textContent = matchCase(entry.es, originalPhrase);
        fragment.appendChild(span);
        i += consumed;
        continue;
      }
    }

    // Single word match
    const entry = wordSet.get(token.toLowerCase());
    if (entry) {
      const span = document.createElement('span');
      span.className = 'sneaky-word';
      span.dataset.original = token;
      span.dataset.spanish = matchCase(entry.es, token);
      span.dataset.ipa = entry.ipa;
      span.textContent = matchCase(entry.es, token);
      fragment.appendChild(span);
    } else {
      fragment.appendChild(document.createTextNode(token));
    }
    i++;
  }

  textNode.parentNode!.replaceChild(fragment, textNode);
  return true;
}

export function walkDOM(root: Node, wordSet: WordSet, phraseInfo: PhraseInfo): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }

  for (const textNode of textNodes) {
    processNode(textNode, wordSet, phraseInfo);
  }
}
