const viewportSeen = new Set<string>();
let observer: IntersectionObserver | null = null;

export function startVisibilityObserver(): void {
  if (observer) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const word = el.dataset.original;
        if (word) {
          viewportSeen.add(word);
          observer!.unobserve(el);
        }
      }
    },
    { threshold: 0.5 },
  );

  // Observe all existing sneaky-word spans
  for (const span of document.querySelectorAll('.sneaky-word')) {
    observer.observe(span);
  }
}

export function observeSpan(span: Element): void {
  observer?.observe(span);
}

export function getViewportSeenWords(): string[] {
  return [...viewportSeen];
}

export function stopVisibilityObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  viewportSeen.clear();
}
