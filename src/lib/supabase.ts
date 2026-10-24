
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configuración pública de Supabase del equipo.

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://etcerdmpuihtfyuffoxt.supabase.co';

const key =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_OTdkZjGUzcbNzun0rpbrdw_VOyg-s4Q';

export const configured = Boolean(
  url.startsWith('https://') &&
  key.length > 15 &&
  !url.includes('TU-PROYECTO')
);

// Almacenamiento de la sesión según la plataforma.

const storage = {
  getItem: (k: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(null)
      : SecureStore.getItemAsync(k),

  setItem: (k: string, v: string) =>
    Platform.OS === 'web'
      ? Promise.resolve()
      : SecureStore.setItemAsync(k, v),

  removeItem: (k: string) =>
    Platform.OS === 'web'
      ? Promise.resolve()
      : SecureStore.deleteItemAsync(k),
};

// Creación del cliente de Supabase.

export const supabase = createClient(
  configured ? url : 'https://unconfigured.invalid',
  configured ? key : 'not-configured',
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
