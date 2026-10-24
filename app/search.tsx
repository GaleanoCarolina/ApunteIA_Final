
import React, { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import {
  Button,
  Field,
  Heading,
  Sub,
  s,
} from '@/components/UI';

import { searchNotes } from '@/lib/data';
import type { Note } from '@/types';

export default function Search() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Note[]>([]);
  const [busy, setBusy] = useState(false);

  async function search() {
    if (q.trim().length < 2) {
      return;
    }

    setBusy(true);

    try {
      setItems(await searchNotes(q.trim()));
    } catch (e) {
      Alert.alert(
        'No se pudo buscar',
        String(e)
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Heading>
        Buscar en tus apuntes
      </Heading>

      <Field
        label="Texto a buscar"
        value={q}
        onChangeText={setQ}
        placeholder="Materia, concepto o palabra del pizarrón"
      />

      <Button
        title="Buscar"
        busy={busy}
        onPress={search}
      />

      {items.map(n => (
        <Pressable
          key={n.id}
          style={s.card}
          onPress={() =>
            router.push(`/note/${n.id}`)
          }
        >
          <Text style={s.itemTitle}>
            {n.title}
          </Text>

          <Sub>
            {(n.edited_text ||
              n.raw_text ||
              n.ai_summary
            ).slice(0, 160)}
          </Sub>
        </Pressable>
      ))}

      {!busy && items.length === 0 && (
        <Sub>
          Introduce al menos dos caracteres y pulsa Buscar.
        </Sub>
      )}
    </Screen>
  );
}
