import { describe, it, expect } from 'vitest';
import { getSettings, saveSettings } from '../../src/shared/storage';
import { DEFAULT_SETTINGS } from '../../src/shared/constants';

describe('getSettings', () => {
  it('returns DEFAULT_SETTINGS when storage is empty', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('returns stored values when present', async () => {
    await chrome.storage.sync.set({ level: 'B2', enabled: false });
    const settings = await getSettings();
    expect(settings.level).toBe('B2');
    expect(settings.enabled).toBe(false);
  });

  it('merges stored values over defaults', async () => {
    await chrome.storage.sync.set({ level: 'C1' });
    const settings = await getSettings();
    expect(settings.level).toBe('C1');
    // Other fields should still have defaults
    expect(settings.enabled).toBe(true);
    expect(settings.highlight).toBe(false);
    expect(settings.exclusions).toEqual([]);
  });
});

describe('saveSettings', () => {
  it('writes partial settings to storage', async () => {
    await saveSettings({ level: 'A2' });
    const settings = await getSettings();
    expect(settings.level).toBe('A2');
  });

  it('subsequent getSettings reflects the change', async () => {
    await saveSettings({ enabled: false, highlight: true });
    const settings = await getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.highlight).toBe(true);
  });

  it('preserves other settings when saving partial', async () => {
    await saveSettings({ level: 'B1' });
    await saveSettings({ highlight: true });
    const settings = await getSettings();
    expect(settings.level).toBe('B1');
    expect(settings.highlight).toBe(true);
  });
});
