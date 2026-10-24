
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type { Note } from '@/types';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatText(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br/>');
}

export async function exportNotes(
  notes: Note[],
  name: string
): Promise<string> {
  if (!notes.length) {
    throw new Error('Selecciona al menos un apunte.');
  }

  const sections = notes
    .map(
      (note) => `
        <section>
          <h2>${escapeHtml(note.title)}</h2>

          <p class="date">
            ${new Date(note.created_at).toLocaleDateString('es-GT')}
          </p>

          <h3>Texto del apunte</h3>
          <p>
            ${formatText(
              note.edited_text || note.raw_text || 'Sin texto'
            )}
          </p>

          <h3>Resumen</h3>
          <p>
            ${formatText(note.ai_summary || 'Sin resumen')}
          </p>
        </section>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <style>
          @page {
            size: A4;
            margin: 17mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #17283F;
            line-height: 1.55;
            font-size: 11pt;
          }

          h1 {
            color: #0876D5;
            font-size: 30pt;
          }

          h2 {
            color: #0752A1;
            page-break-after: avoid;
          }

          h3 {
            color: #0876D5;
            page-break-after: avoid;
          }

          section {
            page-break-before: always;
          }

          .date {
            color: #6C8096;
            font-size: 10pt;
          }

          p {
            overflow-wrap: anywhere;
          }

          li {
            margin-bottom: 8px;
          }
        </style>
      </head>

      <body>
        <h1>ApunteIA</h1>

        <h2>${escapeHtml(name)}</h2>

        <p>
          Material de estudio ·
          ${new Date().toLocaleDateString('es-GT')}
        </p>

        <h2>Índice</h2>

        <ol>
          ${notes
            .map(
              (note) =>
                `<li>${escapeHtml(note.title)}</li>`
            )
            .join('')}
        </ol>

        ${sections}

        <p>
          Los contenidos generados por inteligencia
          artificial deben revisarse.
        </p>
      </body>
    </html>
  `;

  // Generar PDF directamente en la carpeta temporal de Expo.
  let pdfUri: string;

  try {
    const result = await Print.printToFileAsync({
      html,
    });

    pdfUri = result.uri;
  } catch (error) {
    throw new Error(
      'No se pudo generar el PDF: ' +
      (error instanceof Error ? error.message : 'Error desconocido')
    );
  }

  // Comprobar que el archivo realmente existe.
  const info = await FileSystem.getInfoAsync(pdfUri);

  if (!info.exists) {
    throw new Error(
      'Expo no encontró el archivo PDF generado.'
    );
  }

  if (info.size === 0) {
    throw new Error(
      'El archivo PDF se generó vacío.'
    );
  }

  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error(
      'Compartir archivos no está disponible en este dispositivo.'
    );
  }

  // Compartir el archivo original sin copiarlo ni cambiar su ruta.
  try {
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir PDF de ApunteIA',
      UTI: 'com.adobe.pdf',
    });
  
} catch (error) {
  console.warn(
    'Compartir PDF no disponible:',
    error instanceof Error ? error.message : 'Error desconocido'
  );

  // Alternativa: utilizar el sistema nativo de Android.
  // Permite guardar el documento mediante "Guardar como PDF".
  try {
    await Print.printAsync({
      html,
    });
  } catch (printError) {
    throw new Error(
      'Android no pudo compartir ni abrir el documento para guardar: ' +
      (printError instanceof Error
        ? printError.message
        : 'Error desconocido')
    );
  }
}

  return pdfUri;
}
