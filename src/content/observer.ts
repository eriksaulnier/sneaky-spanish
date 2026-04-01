import { processNode, walkDOM, type WordSet } from './walker';

let observer: MutationObserver | null = null;

export function startObserver(wordSet: WordSet): void {
  if (observer) return;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Set<Node> = new Set();

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement && node.closest('.sneaky-word')) continue;
        if (node instanceof HTMLElement && node.tagName === 'SNEAKY-TOOLTIP') continue;
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
          processNode(node, wordSet);
        } else if (node instanceof HTMLElement) {
          walkDOM(node, wordSet);
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
