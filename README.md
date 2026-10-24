# ApunteIA — Proyecto final de Programación II

Aplicación móvil de estudio desarrollada con **React Native, Expo y TypeScript**. Permite organizar materias, carpetas y apuntes, capturar fotografías de páginas, extraer y resumir contenido mediante una función de IA en Supabase, editar los textos resultantes, crear tarjetas de repaso, buscar apuntes y exportar contenido a PDF.

## Requisitos

- Node.js y npm.
- Android con Expo Go 57.

## Instalar y ejecutar 

1. Descargar o clonar este repositorio y abrir una terminal en la carpeta del proyecto.
2. Instalar las dependencias mediante `npm ci`.
3. Iniciar Expo con `npx expo start` y abrir la aplicación con Expo Go compatible con el SDK instalado.
4. Iniciar sesión o crear una cuenta de prueba y probar las funciones disponibles.


## Arquitectura y archivos

- `app/`: pantallas y rutas Expo Router.
- `src/components/`: componentes visuales; `src/lib/`: acceso a datos, Supabase, PDF y sincronización.
- `supabase/migrations/`: estructura de datos, RLS y cuotas.
- `supabase/functions/analyze-note/`: función de servidor para OCR/resumen mediante Gemini.
- `tests/`: pruebas unitarias.
- `package.json` + `package-lock.json`: dependencias reproducibles.
- `.env.example`: plantilla de valores públicos sin credenciales reales.
