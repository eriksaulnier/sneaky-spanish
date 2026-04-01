import { DEFAULT_SETTINGS } from '../shared/constants';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(null, (existing) => {
    const defaults: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(key in existing)) {
        defaults[key] = value;
      }
    }
    if (Object.keys(defaults).length > 0) {
      chrome.storage.sync.set(defaults);
    }
  });
});
