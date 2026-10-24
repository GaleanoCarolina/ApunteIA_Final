
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Button, Field, Heading, Sub } from '@/components/UI';
import {
  ItemRow,
  Sheet,
  TopBar,
  TinyAction,
} from '@/components/Modern';

import {
  listFolders,
  listSubjects,
  listNotes,
  addFolder,
  moveNote,
  deleteFolder,
} from '@/lib/data';

import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';

export default function FolderDetail() {
  const { id, subject } = useLocalSearchParams<{
    id: string;
    subject: string;
  }>();

  const folders = useLoad(
    () => listFolders(subject),
    [subject]
  );

  const notes = useLoad(
    () => listNotes(subject),
    [subject]
  );

  const subjects = useLoad(listSubjects, []);

  useFocusReload(folders.reload);
  useFocusReload(notes.reload);

  const folder = folders.data?.find(f => f.id === id);

  const subjectName =
    subjects.data?.find(s => s.id === subject)?.name || 'Materia';

  const children = (folders.data || []).filter(
    f => f.parent_id === id
  );

  const items = (notes.data || []).filter(
    n => n.folder_id === id
  );

  const [create, setCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);

    try {
      await fn();

      await folders.reload();
      await notes.reload();

      setCreate(false);
      setTarget(null);
      setNewName('');
    } catch (e) {
      Alert.alert('No se pudo completar', String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <TopBar
        title={folder?.name || 'Carpeta'}
        subtitle={subjectName}
        onBack={() => router.back()}
        action={
          <TinyAction
            name="ellipsis-horizontal"
            label="Opciones de carpeta"
            onPress={() =>
              Alert.alert(
                'Carpeta',
                folder?.name || '',
                [
                  {
                    text: 'Eliminar carpeta',
                    style: 'destructive',
                    onPress: () =>
                      Alert.alert(
                        'Confirmar',
                        'Los apuntes pasarán a la raíz de la materia.',
                        [
                          {
                            text: 'Cancelar',
                          },
                          {
                            text: 'Eliminar',
                            style: 'destructive',
                            onPress: () =>
                              void run(async () => {
                                await deleteFolder(id);
                                router.back();
                              }),
                          },
                        ]
                      ),
                  },
                  {
                    text: 'Cancelar',
                  },
                ]
              )
            }
          />
        }
      />

      <View
        style={{
          flexDirection: 'row',
          gap: 9,
        }}
      >
        <View style={{ flex: 1 }}>
          <Button
            title="+ Subcarpeta"
            secondary
            onPress={() => setCreate(true)}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Button
            title="Escanear"
            onPress={() =>
              router.push({
                pathname: '/capture',
                params: { subject },
              })
            }
          />
        </View>
      </View>

      <Heading>Subcarpetas</Heading>

      {children.map(f => (
        <ItemRow
          key={f.id}
          title={f.name}
          icon="folder-outline"
          subtitle="Abrir carpeta"
          onPress={() =>
            router.push({
              pathname: '/folder/[id]',
              params: {
                id: f.id,
                subject,
              },
            })
          }
        />
      ))}

      {children.length === 0 && (
        <Sub>No hay subcarpetas todavía.</Sub>
      )}

      <Heading>Apuntes · {items.length}</Heading>

      {items.map(n => (
        <ItemRow
          key={n.id}
          title={n.title}
          subtitle={n.processing_status}
          icon="document-text-outline"
          onPress={() => router.push(`/note/${n.id}`)}
          right={
            <TinyAction
              name="ellipsis-vertical"
              label={`Mover ${n.title}`}
              onPress={() => setTarget(n.id)}
            />
          }
        />
      ))}

      {items.length === 0 && (
        <Sub>
          Esta carpeta está vacía. Mueve un apunte aquí
          o escanea uno nuevo.
        </Sub>
      )}

      <Sheet
        visible={create}
        onClose={() => setCreate(false)}
        title="Nueva subcarpeta"
        subtitle="Organiza tus apuntes por tema o unidad"
      >
        <Field
          label="Nombre"
          value={newName}
          onChangeText={setNewName}
          placeholder="Ej. Unidad 1"
        />

        <Button
          title="Crear subcarpeta"
          busy={busy}
          disabled={!newName.trim()}
          onPress={() =>
            void run(() =>
              addFolder(subject, newName.trim(), id)
            )
          }
        />
      </Sheet>

      <Sheet
        visible={target !== null}
        onClose={() => setTarget(null)}
        title="Mover apunte"
        subtitle="Elige la carpeta de destino"
      >
        <ItemRow
          title="Sin carpeta"
          subtitle="Raíz de la materia"
          icon="home-outline"
          onPress={() =>
            target &&
            void run(() =>
              moveNote(target, subject, null)
            )
          }
        />

        {(folders.data || []).map(f => (
          <ItemRow
            key={f.id}
            title={f.name}
            icon="folder-outline"
            onPress={() =>
              target &&
              void run(() =>
                moveNote(target, subject, f.id)
              )
            }
          />
        ))}
      </Sheet>
    </Screen>
  );
}
