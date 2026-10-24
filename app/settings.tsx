
import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import {
  Button,
  Heading,
  Sub,
  Card,
} from '@/components/UI';

import { supabase } from '@/lib/supabase';

export default function Settings() {
  return (
    <Screen>
      <Heading>
        Perfil y ajustes
      </Heading>

      <Card>
        <Heading>
          Acerca de ApunteIA
        </Heading>

        <Sub>
          Proyecto académico de Programación II,
          Universidad Mariano Gálvez de Guatemala,
          sede Jalapa, sección B.
          No es una aplicación institucional oficial.
        </Sub>

        <Sub>
          Las fotografías se guardan en un almacenamiento
          privado de tu cuenta. El análisis de IA usa
          Google Gemini y requiere internet.
        </Sub>
      </Card>

      <Button
        secondary
        title="Ver demostración de clase"
        onPress={() => router.push('/demo')}
      />

      <Button
        title="Cerrar sesión"
        onPress={() =>
          Alert.alert(
            'Cerrar sesión',
            '¿Quieres salir de tu cuenta?',
            [
              {
                text: 'Cancelar',
              },
              {
                text: 'Salir',
                onPress: () =>
                  supabase.auth
                    .signOut()
                    .then(() =>
                      router.replace('/auth')
                    ),
              },
            ]
          )
        }
      />
    </Screen>
  );
}
