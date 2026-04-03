import { beforeEach } from 'vitest';

interface StorageArea {
  data: Record<string, unknown>;
  get(keys: Record<string, unknown>): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

function createStorageArea(): StorageArea {
  const area: StorageArea = {
    data: {},
    async get(keys: Record<string, unknown>) {
      const result: Record<string, unknown> = {};
      for (const [key, defaultValue] of Object.entries(keys)) {
        result[key] = key in area.data ? area.data[key] : defaultValue;
      }
      return result;
    },
    async set(items: Record<string, unknown>) {
      Object.assign(area.data, items);
    },
  };
  return area;
}

const local = createStorageArea();
const sync = createStorageArea();

const chrome = {
  storage: { local, sync },
  runtime: {
    onMessage: { addListener: () => {} },
    onInstalled: { addListener: () => {} },
  },
  tabs: {
    query: async () => [],
    sendMessage: async () => {},
  },
};

Object.assign(globalThis, { chrome });

export function resetChromeStorage() {
  local.data = {};
  sync.data = {};
}

beforeEach(() => {
  resetChromeStorage();
});
