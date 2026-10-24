import { newId } from './uuid';
import * as SQLite from 'expo-sqlite';
import type { Note, Subject } from '@/types';
const dbPromise = SQLite.openDatabaseAsync('apunteia.db');
export async function initLocal() { const db = await dbPromise; await db.execAsync(`CREATE TABLE IF NOT EXISTS cache (kind TEXT NOT NULL,id TEXT NOT NULL, json TEXT NOT NULL,PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS queue (id TEXT PRIMARY KEY,kind TEXT NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL);`);
  }
export async function cacheItems<T extends {
    id: string;
}>(kind: string, items: T[]) { await initLocal(); const db = await dbPromise; for (const i of items)
    await db.runAsync('INSERT OR REPLACE INTO cache(kind,id,json) VALUES(?,?,?)', kind, i.id, JSON.stringify(i));
      }
export async function localItems<T>(kind: string): Promise<T[]> { await initLocal(); const db = await dbPromise;
  const items = await db.getAllAsync<{
    json: string;
}>('SELECT json FROM cache WHERE kind=?', kind); return items.map(x => JSON.parse(x.json) as T); }
export async function queueWrite(kind: string, payload: unknown) { await initLocal(); const db = await dbPromise;
  await db.runAsync('INSERT INTO queue(id,kind,payload,created_at) VALUES(?,?,?,?)',
  newId(),
  kind,
  JSON.stringify(payload),
  new Date().toISOString());
  }
export async function pendingCount() { await initLocal(); const db = await dbPromise; const row = await db.getFirstAsync<{
    n: number;
}>('SELECT count(*) as n FROM queue'); return row?.n ?? 0; }
export type CacheKinds = Subject | Note;
