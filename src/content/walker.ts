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

export function processNode(textNode: Text, wordSet: WordSet): boolean {
  const text = textNode.nodeValue;
  if (!text || !text.trim()) return false;
  if (shouldSkip(textNode)) return false;

  const tokens = tokenize(text);
  const hasMatch = tokens.some((t) => wordSet.has(t.toLowerCase()));
  if (!hasMatch) return false;

  const fragment = document.createDocumentFragment();
  for (const token of tokens) {
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
  }
  textNode.parentNode!.replaceChild(fragment, textNode);
  return true;
}

export function walkDOM(root: Node, wordSet: WordSet): void {
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
    processNode(textNode, wordSet);
  }
}
