/**
 * Клієнтський кеш результатів виконання коду (preview: Run / Run tests).
 *
 * Навіщо: однаковий код + однаковий stdin/набір тестів дають однаковий результат,
 * тому другого разу його можна не запитувати в бекенда.
 * Це прибирає потребу тримати результати виконання в пам'яті Node-процесу
 * (раніше це був єдиний необмежений in-memory кеш на сервісі) і економить
 * квоту зовнішніх compile-API (JDoodle/OneCompiler/Glot мають rate-limit).
 *
 * L1 — Map у пам'яті вкладки, L2 — sessionStorage (переживає перезавантаження).
 *
 * УВАГА: НЕ використовується для відправки рішення (submit) — там вердикт
 * ухвалює сервер, і кеш не має права впливати на зарахування.
 */
const TTL_MS = 5 * 60 * 1000; // 5 хвилин (коротко: код може друкувати random/час)
const MAX_ENTRIES = 50; // ліміт записів (L1 + L2)
const MAX_ENTRY_BYTES = 64 * 1024; // «важкі» результати не зберігаємо
const STORAGE_PREFIX = 'exec_cache_v1:';

interface CacheEntry<T> {
  ts: number;
  value: T;
}

const memory = new Map<string, CacheEntry<unknown>>();

/** Дешевий FNV-1a хеш, щоб не тримати в ключах увесь код програми */
const hash = (input: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
};

const isFresh = (entry: CacheEntry<unknown> | null | undefined): boolean =>
  !!entry && Date.now() - entry.ts < TTL_MS;

/** Побудувати ключ кешу з endpoint + тіла запиту */
export const buildCacheKey = (endpoint: string, body: unknown): string =>
  hash(`${endpoint}|${JSON.stringify(body)}`);

/** Прибрати найстаріші записи, якщо перевищено ліміт (Map зберігає порядок вставки) */
const pruneMemory = (): void => {
  if (memory.size <= MAX_ENTRIES) return;
  for (const key of memory.keys()) {
    if (memory.size <= MAX_ENTRIES) break;
    memory.delete(key);
  }
};

/** Витягнути ts із sessionStorage-ключа виду `exec_cache_v1:<ts>:<hash>` */
const tsFromStorageKey = (storageKey: string): number => {
  const rest = storageKey.slice(STORAGE_PREFIX.length);
  return Number(rest.slice(0, rest.indexOf(':')));
};

/** Знайти найсвіжіший запис у sessionStorage за хешем ключа */
const findStorageEntry = (hashKey: string): { storageKey: string; raw: string } | null => {
  const suffix = `:${hashKey}`;
  let best: { storageKey: string; raw: string; ts: number } | null = null;

  for (let i = 0; i < sessionStorage.length; i++) {
    const storageKey = sessionStorage.key(i);
    if (!storageKey || !storageKey.startsWith(STORAGE_PREFIX) || !storageKey.endsWith(suffix)) continue;

    const raw = sessionStorage.getItem(storageKey);
    if (!raw) continue;

    const ts = tsFromStorageKey(storageKey);
    if (!best || ts > best.ts) best = { storageKey, raw, ts };
  }

  return best ? { storageKey: best.storageKey, raw: best.raw } : null;
};

/** Прибрати протерміновані записи та обмежити розмір sessionStorage-кеша */
const pruneStorage = (): void => {
  try {
    const entries: { storageKey: string; ts: number }[] = [];

    // ітеруємо з кінця: видалення ключів зсуває індекси
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const storageKey = sessionStorage.key(i);
      if (!storageKey || !storageKey.startsWith(STORAGE_PREFIX)) continue;

      const ts = tsFromStorageKey(storageKey);
      if (!Number.isFinite(ts) || Date.now() - ts >= TTL_MS) {
        sessionStorage.removeItem(storageKey);
        continue;
      }
      entries.push({ storageKey, ts });
    }

    if (entries.length <= MAX_ENTRIES) return;

    entries.sort((a, b) => a.ts - b.ts);
    for (const { storageKey } of entries.slice(0, entries.length - MAX_ENTRIES)) {
      sessionStorage.removeItem(storageKey);
    }
  } catch {
    // ignore
  }
};

export const getCached = <T>(key: string): T | null => {
  const memEntry = memory.get(key);
  if (isFresh(memEntry)) return memEntry!.value as T;
  if (memEntry) memory.delete(key);

  try {
    const found = findStorageEntry(key);
    if (!found) return null;

    const parsed = JSON.parse(found.raw) as CacheEntry<T>;
    if (!isFresh(parsed)) {
      sessionStorage.removeItem(found.storageKey);
      return null;
    }

    memory.set(key, parsed);
    pruneMemory();
    return parsed.value;
  } catch {
    // приватний режим / quota / пошкоджений JSON — просто працюємо без кешу
    return null;
  }
};

export const setCached = <T>(key: string, value: T): void => {
  const entry: CacheEntry<T> = { ts: Date.now(), value };
  memory.set(key, entry);
  pruneMemory();

  try {
    const serialized = JSON.stringify(entry);
    if (serialized.length <= MAX_ENTRY_BYTES) {
      // у ключі зберігаємо ts, щоб прибирати найстаріші без парсингу значень
      sessionStorage.setItem(`${STORAGE_PREFIX}${entry.ts}:${key}`, serialized);
      pruneStorage();
    }
  } catch {
    // перевищено quota — кеш лишається тільки в пам'яті вкладки
  }
};

/**
 * POST з кешуванням успішної відповіді.
 * Формат помилок/відповіді не змінюється: повертається той самий JSON,
 * який раніше отримував виклик fetch().
 *
 * @param force true — ігнорувати кеш (напр. користувач явно натиснув «Run» ще раз,
 *              а код друкує random()/час і результат має бути свіжим)
 */
export const cachedPostJson = async <T>(
  url: string,
  body: unknown,
  force = false
): Promise<T> => {
  const key = buildCacheKey(url, body);

  if (!force) {
    const hit = getCached<T>(key);
    if (hit) {
      console.log('📦 [executionCache] cache hit:', url);
      return hit;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (response.ok && data?.success) {
    setCached(key, data);
  }

  return data as T;
};

/**
 * GET з кешуванням успішної відповіді (напр. список мов — він статичний).
 */
export const cachedGetJson = async <T>(url: string): Promise<T> => {
  const key = buildCacheKey(url, null);
  const hit = getCached<T>(key);
  if (hit) {
    console.log('📦 [executionCache] cache hit (GET):', url);
    return hit;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (response.ok && data?.success) {
    setCached(key, data);
  }

  return data as T;
};

/** Повністю очистити кеш (L1 + L2). Використовується при зміні задачі тощо. */
export const clearExecutionCache = (): void => {
  memory.clear();
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
};
