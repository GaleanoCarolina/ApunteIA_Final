
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { Screen } from '@/components/Screen';
import { Button, Field, Sub, Card } from '@/components/UI';
import { TopBar, ItemRow, Sheet } from '@/components/Modern';

import {
  listSubjects,
  newNote,
  addAsset,
  analyzeNote,
} from '@/lib/data';

import { useLoad } from '@/hooks/useLoad';
import { errorMessage } from '@/lib/errors';
import { colors } from '@/theme';

export default function Capture() {
  const { subject } = useLocalSearchParams<{
    subject?: string;
  }>();

  const { data: subjects } = useLoad(listSubjects, []);

  const [chooseSubject, setChooseSubject] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('Apuntes de clase');
  const [subjectId, setSubjectId] = useState(subject || '');
  const [stage, setStage] = useState('');
  const [busy, setBusy] = useState(false);

  async function pick(camera: boolean) {
    try {
      const perm = camera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!perm.granted) {
        return Alert.alert(
          'Permiso requerido',
          'Activa el permiso de cámara o fotos en los ajustes de Android.'
        );
      }

      const result = camera
        ? await ImagePicker.launchCameraAsync({
            quality: .85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            quality: .85,
          });

      if (!result.canceled) {
        let uris: string[] = [];

        for (const asset of result.assets) {
          const transformed =
            await ImageManipulator.manipulateAsync(
              asset.uri,
              [
                {
                  resize: {
                    width: 1600,
                  },
                },
              ],
              {
                compress: .75,
                format: ImageManipulator.SaveFormat.JPEG,
              }
            );

          uris.push(transformed.uri);
        }

        setImages(prev =>
          [...prev, ...uris].slice(0, 10)
        );
      }
    } catch (e) {
      Alert.alert(
        'Error de cámara',
        errorMessage(e)
      );
    }
  }

  async function save() {
    if (!images.length) {
      return Alert.alert(
        'Faltan fotos',
        'Toma o importa al menos una imagen'
      );
    }

    setBusy(true);

    let id = '';

    try {
      setStage('Guardando apunte');

      id = await newNote(
        title.trim() || 'Apunte sin título',
        subjectId || null,
        null
      );

      for (let i = 0; i < images.length; i++) {
        setStage(
          `Subiendo foto ${i + 1} de ${images.length}`
        );

        await addAsset(
          id,
          images[i],
          i
        );
      }

      setStage('Analizando con Gemini');

      try {
        await analyzeNote(id);
      } catch (e) {
        Alert.alert(
          'Fotos guardadas; IA pendiente',
          errorMessage(e)
        );
      }

      router.replace(`/note/${id}`);
    } catch (e) {
      Alert.alert(
        'Error al guardar',
        `${
          errorMessage(e)
        }${
          id
            ? ' El apunte ya existe; revisa tu biblioteca.'
            : ''
        }`
      );
    } finally {
      setBusy(false);
      setStage('');
    }
  }

  return (
    <Screen>
      <TopBar
        title="Nuevo apunte"
        subtitle="Captura e importa hasta 10 páginas"
        onBack={() => {
          if (!busy) {
            router.replace('/(tabs)');
          }
        }}
      />

      <Sub>
        Captura un pizarrón o importa hasta 10 páginas.
        Se guardarán en orden.
      </Sub>

      <Button
        title="📷 Tomar fotografía"
        onPress={() => pick(true)}
        disabled={busy}
      />

      <Button
        secondary
        title="Importar desde galería"
        onPress={() => pick(false)}
        disabled={busy}
      />

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {images.map((uri, i) => (
          <View key={`${uri}-${i}`}>
            <Image
              source={{ uri }}
              style={{
                width: 100,
                height: 125,
                borderRadius: 12,
              }}
            />

            <Button
              secondary
              title={`Eliminar ${i + 1}`}
              disabled={busy}
              onPress={() =>
                setImages(x =>
                  x.filter((_, j) => j !== i)
                )
              }
            />
          </View>
        ))}
      </View>

      <Card>
        <Field
          label="Título del apunte"
          value={title}
          onChangeText={setTitle}
        />

        <Text
          style={{
            color: colors.text,
            fontWeight: '700',
          }}
        >
          Materia
        </Text>

        <Button
          secondary
          title={
            subjects?.find(
              s => s.id === subjectId
            )?.name || 'Seleccionar materia'
          }
          onPress={() => setChooseSubject(true)}
        />

        <Sub>
          {!subjectId
            ? 'Si no seleccionas materia, el apunte quedará en tu biblioteca.'
            : ''}
        </Sub>

        <Button
          title={
            busy
              ? stage
              : 'Guardar fotos y analizar'
          }
          busy={busy}
          disabled={!images.length}
          onPress={save}
        />
      </Card>

      <Sub>
        La IA puede cometer errores.
        Revisa el texto extraído antes de usarlo para estudiar.
      </Sub>

      <Sheet
        visible={chooseSubject}
        title="Asignar materia"
        subtitle="Selecciona dónde guardar el apunte"
        onClose={() => setChooseSubject(false)}
      >
        <ItemRow
          title="Sin materia"
          subtitle="Guardar en Biblioteca"
          icon="albums-outline"
          onPress={() => {
            setSubjectId('');
            setChooseSubject(false);
          }}
        />

        {subjects
          ?.filter(s => !s.archived)
          .map(s => (
            <ItemRow
              key={s.id}
              title={s.name}
              icon="book-outline"
              onPress={() => {
                setSubjectId(s.id);
                setChooseSubject(false);
              }}
            />
          ))}
      </Sheet>
    </Screen>
  );
}
