import type { Dictionary, CEFRLevel } from '../shared/types';
import { isLevelIncluded } from '../shared/constants';
import { getSettings } from '../shared/storage';
import { walkDOM, type WordSet } from './walker';

function buildWordSet(dictionary: Dictionary, level: CEFRLevel): WordSet {
  const wordSet: WordSet = new Map();
  for (const [english, entry] of Object.entries(dictionary)) {
    if (isLevelIncluded(entry.level, level)) {
      wordSet.set(english, entry);
    }
  }
  return wordSet;
}

async function init() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const hostname = window.location.hostname;
  if (settings.exclusions.includes(hostname)) return;

  if (settings.highlight) {
    document.documentElement.classList.add('sneaky-highlight');
  }

  const dictModule = await import('../data/dictionary.json');
  const dictionary: Dictionary = dictModule.default as Dictionary;
  const wordSet = buildWordSet(dictionary, settings.level);

  if (wordSet.size === 0) return;

  walkDOM(document.body, wordSet);
}

init();
