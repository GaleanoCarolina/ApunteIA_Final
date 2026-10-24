
import React from 'react';
import { Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { Card, Heading, Sub } from '@/components/UI';

export default function Demo() {
  return (
    <Screen>
      <Heading>
        Demostración para clase
      </Heading>

      <Sub>
        Contenido ilustrativo y explícitamente de ejemplo:
        no pertenece a tu cuenta ni se guarda en la nube.
      </Sub>

      <Card>
        <Heading>
          📘 Programación II
        </Heading>

        <Sub>
          Materia de demostración
        </Sub>

        <Text>
          Apunte: Estructuras de datos
        </Text>

        <Text>
          Texto de ejemplo: Una pila es una estructura LIFO.
        </Text>

        <Text>
          Resumen de demostración: El último elemento
          en entrar es el primero en salir.
        </Text>
      </Card>

      <Card>
        <Heading>
          Recorrido sugerido
        </Heading>

        <Text>
          1. Crea una materia real.
        </Text>

        <Text>
          2. Fotografía un pizarrón y revisa el texto.
        </Text>

        <Text>
          3. Exporta tus apuntes a PDF.
        </Text>
      </Card>

      <Sub>
        Este ejemplo no simula una llamada real a Gemini.
      </Sub>
    </Screen>
  );
}
