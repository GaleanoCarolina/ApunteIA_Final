
import * as SQLite from 'expo-sqlite';
import { supabase } from './supabase';
import { initLocal } from './db';

type QueueItem = {
  id: string;
  kind: string;
  payload: string;
};

export async function syncQueue(): Promise<number> {
  await initLocal();
  const db = await SQLite.openDatabaseAsync('apunteia.db');

  const queue = await db.getAllAsync<QueueItem>(
    'SELECT id, kind, payload FROM queue ORDER BY created_at'
  );

  let completed = 0;

  for (const item of queue) {
    if (item.kind !== 'subject') {
      throw new Error(
        `Tipo de sincronización no compatible: ${item.kind}`
      );
    }

    const payload = JSON.parse(item.payload) as Record<
      string,
      unknown
    >;

    const { error } = await supabase
      .from('subjects')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      throw new Error(
        `Supabase rechazó la materia: ${error.message}. ` +
        `Código: ${error.code || 'desconocido'}`
      );
    }

    await db.runAsync(
      'DELETE FROM queue WHERE id = ?',
      item.id
    );

    completed++;
  }

  return completed;
}
