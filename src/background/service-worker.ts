import { DEFAULT_SETTINGS } from '../shared/constants';

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(null);
  const defaults: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(key in existing)) {
      defaults[key] = value;
    }
  }
  if (Object.keys(defaults).length > 0) {
    await chrome.storage.sync.set(defaults);
  }
});
