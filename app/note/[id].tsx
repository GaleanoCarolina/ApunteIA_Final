
import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Button, Card, Field, Heading, Sub } from '@/components/UI';
import { PillTabs, TopBar, TinyAction } from '@/components/Modern';

import {
  getNote,
  saveNote,
  noteAssets,
  analyzeNote,
  cards,
  createCard,
  gradeCard,
} from '@/lib/data';

import { supabase } from '@/lib/supabase';
import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';
import { exportNotes } from '@/lib/pdf';
import { errorMessage } from '@/lib/errors';

type Tab = 'resumen' | 'texto' | 'fotos' | 'estudio';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const note = useLoad(() => getNote(id), [id]);
  const assets = useLoad(() => noteAssets(id), [id]);
  const flash = useLoad(() => cards(id), [id]);

  useFocusReload(note.reload);
  useFocusReload(flash.reload);

  const [tab, setTab] = useState<Tab>('resumen');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [edited, setEdited] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const [showAnswers, setShowAnswers] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active && note.data && !editing) {
        setTitle(note.data.title);
        setEdited(
          note.data.edited_text ||
          note.data.raw_text ||
          ''
        );
      }
    });

    return () => {
      active = false;
    };
  }, [note.data, editing]);

  async function run(
    fn: () => Promise<unknown>,
    success?: string
  ) {
    setBusy(true);

    try {
      await fn();
      await note.reload();
      await flash.reload();

      if (success) {
        Alert.alert('Listo', success);
      }
    } catch (e) {
      Alert.alert('Error', errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const n = note.data;

  return (
    <Screen>
      <TopBar
        title={n?.title || 'Apunte'}
        subtitle={
          n?.processing_status === 'completado'
            ? 'Listo para estudiar'
            : n?.processing_status
        }
        onBack={() =>
          router.canGoBack()
            ? router.back()
            : router.replace('/(tabs)/library')
        }
        action={
          n ? (
            <TinyAction
              name="ellipsis-horizontal"
              label="Opciones del apunte"
              onPress={() =>
                Alert.alert(
                  'Opciones del apunte',
                  n.title,
                  [
                    {
                      text: n.favorite
                        ? 'Quitar favorito'
                        : 'Marcar favorito',
                      onPress: () =>
                        void run(() =>
                          saveNote({
                            id,
                            favorite: !n.favorite,
                          })
                        ),
                    },
                    {
                      text: 'Exportar PDF',
                      onPress: () =>
                        void exportNotes(
                          [n],
                          n.title
                        ).catch(e =>
                          Alert.alert(
                            'PDF',
                            errorMessage(e)
                          )
                        ),
                    },
                    {
                      text: 'Enviar a papelera',
                      style: 'destructive',
                      onPress: () =>
                        Alert.alert(
                          'Papelera',
                          '¿Mover este apunte a la papelera?',
                          [
                            {
                              text: 'Cancelar',
                            },
                            {
                              text: 'Mover',
                              style: 'destructive',
                              onPress: () =>
                                void run(async () => {
                                  await saveNote({
                                    id,
                                    deleted_at:
                                      new Date().toISOString(),
                                  });

                                  router.replace(
                                    '/(tabs)/library'
                                  );
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
          ) : undefined
        }
      />

      {note.error && (
        <Sub>{note.error}</Sub>
      )}

      {!n ? (
        <Sub>
          {note.loading
            ? 'Cargando apunte...'
            : 'Apunte no disponible.'}
        </Sub>
      ) : (
        <>
          <PillTabs
            value={tab}
            onChange={v => {
              setTab(v as Tab);
              setEditing(false);
            }}
            options={[
              {
                key: 'resumen',
                label: 'Resumen',
              },
              {
                key: 'texto',
                label: 'Texto',
              },
              {
                key: 'fotos',
                label: 'Fotos',
              },
              {
                key: 'estudio',
                label: 'Estudiar',
              },
            ]}
          />

          {tab === 'resumen' && (
            <>
              <View
                style={{
                  backgroundColor: '#E8F4FF',
                  padding: 19,
                  borderRadius: 20,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: '#0752A1',
                    fontWeight: '800',
                  }}
                >
                  RESUMEN INTELIGENTE
                </Text>

                <Text
                  selectable
                  style={{
                    fontSize: 16,
                    lineHeight: 25,
                    color: '#17283F',
                  }}
                >
                  {n.ai_summary ||
                    'Este apunte aún no tiene un resumen. Puedes analizarlo con Gemini.'}
                </Text>

                <Sub>
                  Contenido generado por IA. Comprueba su exactitud.
                </Sub>
              </View>

              <Button
                title="Volver a analizar con Gemini"
                busy={busy}
                onPress={() =>
                  Alert.alert(
                    'Solicitud de Gemini',
                    'Puede consumir cuota. ¿Continuar?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Analizar',
                        onPress: () =>
                          void run(
                            () => analyzeNote(id),
                            'Resumen actualizado'
                          ),
                      },
                    ]
                  )
                }
              />

              <Button
                secondary
                title="Compartir PDF"
                onPress={() =>
                  void exportNotes(
                    [n],
                    n.title
                  ).catch(e =>
                    Alert.alert(
                      'PDF',
                      errorMessage(e)
                    )
                  )
                }
              />
            </>
          )}

          {tab === 'texto' && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Heading>Texto corregido</Heading>

                <TinyAction
                  name={editing ? 'close' : 'create-outline'}
                  label={
                    editing
                      ? 'Cerrar edición'
                      : 'Editar texto'
                  }
                  onPress={() => setEditing(!editing)}
                />
              </View>

              {editing ? (
                <Card>
                  <Field
                    label="Título"
                    value={title}
                    onChangeText={setTitle}
                  />

                  <Field
                    label="Texto editable"
                    value={edited}
                    onChangeText={setEdited}
                    multiline
                  />

                  <Button
                    title="Guardar cambios"
                    busy={busy}
                    disabled={!title.trim()}
                    onPress={() =>
                      void run(
                        async () => {
                          await saveNote({
                            id,
                            title: title.trim(),
                            edited_text: edited,
                          });

                          setEditing(false);
                        },
                        'Correcciones guardadas'
                      )
                    }
                  />
                </Card>
              ) : (
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 18,
                    borderRadius: 19,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      fontSize: 15,
                      color: '#17283F',
                      lineHeight: 24,
                    }}
                  >
                    {n.edited_text ||
                      n.raw_text ||
                      'Sin texto disponible.'}
                  </Text>
                </View>
              )}

              <Heading>Texto original OCR</Heading>

              <View
                style={{
                  backgroundColor: 'white',
                  padding: 18,
                  borderRadius: 19,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: '#526579',
                    lineHeight: 23,
                  }}
                >
                  {n.raw_text || 'Sin texto extraído.'}
                </Text>
              </View>
            </>
          )}

          {tab === 'fotos' && (
            <>
              <Heading>Páginas del apunte</Heading>

              <Sub>
                {assets.data?.length || 0} fotografía(s)
                almacenadas de forma privada
              </Sub>

              <View
                style={{
                  gap: 12,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {assets.data?.map(a => (
                  <SignedImage
                    key={a.id}
                    path={a.storage_path}
                  />
                ))}
              </View>

              {!assets.data?.length && (
                <Sub>
                  Este apunte no tiene fotografías.
                </Sub>
              )}
            </>
          )}

          {tab === 'estudio' && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Heading>Tarjetas de estudio</Heading>

                <Text
                  style={{
                    color: '#0752A1',
                    fontWeight: '800',
                  }}
                >
                  {flash.data?.length || 0} tarjetas
                </Text>
              </View>

              <Card>
                <Field
                  label="Pregunta"
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="¿Qué es una clase?"
                />

                <Field
                  label="Respuesta"
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                />

                <Button
                  title="+ Agregar tarjeta"
                  disabled={
                    !question.trim() ||
                    !answer.trim() ||
                    busy
                  }
                  onPress={() =>
                    void run(
                      async () => {
                        await createCard(
                          id,
                          question.trim(),
                          answer.trim()
                        );

                        setQuestion('');
                        setAnswer('');
                      },
                      'Tarjeta creada'
                    )
                  }
                />
              </Card>

              {flash.data?.map((card, i) => (
                <View
                  key={card.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 18,
                    padding: 18,
                    gap: 11,
                  }}
                >
                  <Text
                    style={{
                      color: '#0876D5',
                      fontWeight: '800',
                      fontSize: 12,
                    }}
                  >
                    TARJETA {i + 1}
                  </Text>

                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#17283F',
                    }}
                  >
                    {card.question}
                  </Text>

                  {showAnswers[card.id] && (
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#344D65',
                        lineHeight: 23,
                      }}
                    >
                      {card.answer}
                    </Text>
                  )}

                  <Button
                    secondary
                    title={
                      showAnswers[card.id]
                        ? 'Ocultar respuesta'
                        : 'Ver respuesta'
                    }
                    onPress={() =>
                      setShowAnswers(x => ({
                        ...x,
                        [card.id]: !x[card.id],
                      }))
                    }
                  />

                  {showAnswers[card.id] && (
                    <View style={{ gap: 8 }}>
                      <Button
                        title="La recordé"
                        onPress={() =>
                          void run(
                            () => gradeCard(card, true),
                            'Repaso registrado'
                          )
                        }
                      />

                      <Button
                        secondary
                        title="Repasar después"
                        onPress={() =>
                          void run(
                            () => gradeCard(card, false),
                            'Repaso programado'
                          )
                        }
                      />
                    </View>
                  )}

                  <Sub>
                    Próximo repaso:{' '}
                    {new Date(
                      card.due_at
                    ).toLocaleDateString('es-GT')}
                  </Sub>
                </View>
              ))}

              {!flash.data?.length && (
                <Sub>
                  Crea tu primera tarjeta para practicar
                  lo aprendido.
                </Sub>
              )}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

function SignedImage({ path }: { path: string }) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.storage
      .from('note-images')
      .createSignedUrl(path, 600)
      .then(({ data }) => {
        if (active) {
          setUri(data?.signedUrl || null);
        }
      });

    return () => {
      active = false;
    };
  }, [path]);

  return uri ? (
    <Image
      source={{ uri }}
      resizeMode="contain"
      style={{
        width: 150,
        height: 190,
        borderRadius: 14,
        backgroundColor: '#E8F3FC',
      }}
    />
  ) : (
    <Text>Fotografía protegida</Text>
  );
}
