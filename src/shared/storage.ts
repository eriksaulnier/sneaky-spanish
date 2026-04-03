import { CEFR_LEVELS, DEFAULT_SETTINGS } from './constants';
import type { CEFRLevel, Settings } from './types';

function validateSettings(raw: Record<string, unknown>): Settings {
  return {
    enabled:
      typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_SETTINGS.enabled,
    level: CEFR_LEVELS.includes(raw.level as CEFRLevel)
      ? (raw.level as CEFRLevel)
      : DEFAULT_SETTINGS.level,
    highlight:
      typeof raw.highlight === 'boolean'
        ? raw.highlight
        : DEFAULT_SETTINGS.highlight,
    exclusions: Array.isArray(raw.exclusions)
      ? raw.exclusions.filter((e): e is string => typeof e === 'string')
      : DEFAULT_SETTINGS.exclusions,
  };
}

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return validateSettings(result);
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(settings);
}
