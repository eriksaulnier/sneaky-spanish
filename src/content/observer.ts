import { processNode, walkDOM, type WordSet, type PhraseInfo } from './walker';
import { observeSpan } from './visibility';

let observer: MutationObserver | null = null;

export function startObserver(wordSet: WordSet, phraseInfo: PhraseInfo): void {
  if (observer) return;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Set<Node> = new Set();

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement && node.closest('.sneaky-word')) continue;
        pending.add(node);
      }
    }
    if (pending.size === 0) return;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const nodes = pending;
      pending = new Set();
      for (const node of nodes) {
        if (!node.isConnected) continue;
        if (node instanceof Text) {
          processNode(node, wordSet, phraseInfo);
          const parent = node.parentElement;
          if (parent) {
            for (const span of parent.querySelectorAll('.sneaky-word')) {
              observeSpan(span);
            }
          }
        } else if (node instanceof HTMLElement) {
          walkDOM(node, wordSet, phraseInfo);
          for (const span of node.querySelectorAll('.sneaky-word')) {
            observeSpan(span);
          }
        }
      }
    }, 16);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export function stopObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
