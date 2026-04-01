import type { Dictionary, CEFRLevel } from '../shared/types';
import { isLevelIncluded } from '../shared/constants';
import { getSettings } from '../shared/storage';
import { walkDOM, type WordSet } from './walker';
import { startObserver, stopObserver } from './observer';
import { initTooltip, destroyTooltip } from './tooltip';
import { restoreOriginalText } from './restore';

function buildWordSet(dictionary: Dictionary, level: CEFRLevel): WordSet {
  const wordSet: WordSet = new Map();
  for (const [english, entry] of Object.entries(dictionary)) {
    if (isLevelIncluded(entry.level, level)) {
      wordSet.set(english, entry);
    }
  }
  return wordSet;
}

let currentDictionary: Dictionary | null = null;

async function activate(dictionary: Dictionary, level: CEFRLevel, highlight: boolean) {
  const wordSet = buildWordSet(dictionary, level);
  if (wordSet.size === 0) return;

  if (highlight) {
    document.documentElement.classList.add('sneaky-highlight');
  } else {
    document.documentElement.classList.remove('sneaky-highlight');
  }

  walkDOM(document.body, wordSet);
  startObserver(wordSet);
  initTooltip();
}

async function init() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const hostname = window.location.hostname;
  if (settings.exclusions.includes(hostname)) return;

  const dictModule = await import('../data/dictionary.json');
  currentDictionary = dictModule.default as Dictionary;

  await activate(currentDictionary, settings.level, settings.highlight);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'settings-changed') {
    handleSettingsChange();
  }
});

async function handleSettingsChange() {
  restoreOriginalText();

  const settings = await getSettings();
  if (!settings.enabled) return;

  const hostname = window.location.hostname;
  if (settings.exclusions.includes(hostname)) return;

  if (!currentDictionary) {
    const dictModule = await import('../data/dictionary.json');
    currentDictionary = dictModule.default as Dictionary;
  }

  await activate(currentDictionary, settings.level, settings.highlight);
}

init();
