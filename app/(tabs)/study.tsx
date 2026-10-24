
import React from 'react';
import { Text, Pressable } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Heading, Sub, s } from '@/components/UI';

import { listNotes } from '@/lib/data';

import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';

export default function Study() {
  const {
    data,
    error,
    reload,
  } = useLoad(listNotes, []);

  useFocusReload(reload);

  return (
    <Screen>
      <Heading>Estudiar</Heading>

      <Sub>
        Abre un apunte y usa sus tarjetas de repaso.
        El avance se guarda en tu cuenta.
      </Sub>

      {error && (
        <Sub>{error}</Sub>
      )}

      {data?.map(n => (
        <Pressable
          key={n.id}
          style={s.card}
          onPress={() => router.push(`/note/${n.id}`)}
        >
          <Text style={s.itemTitle}>
            {n.title}
          </Text>

          <Sub>
            Abrir tarjetas y resumen
          </Sub>
        </Pressable>
      ))}
    </Screen>
  );
}
