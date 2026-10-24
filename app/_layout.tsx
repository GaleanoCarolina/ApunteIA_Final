
import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { colors } from '@/theme';
import type { Session } from '@supabase/supabase-js';

const query = new QueryClient();

export default function Root() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const path = segments.join('/');
    const isCallback = path === 'auth/callback';
    const isAuth = segments[0] === 'auth';

    // La pantalla de confirmación y recuperación
    // debe poder finalizar antes de navegar.
    if (isCallback) return;

    if (!session && !isAuth) {
      router.replace('/auth');
    }

    if (session && path === 'auth') {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bg,
        }}
      >
        <Text
          style={{
            color: colors.blue,
            fontSize: 30,
            fontWeight: '900',
          }}
        >
          ApunteIA ✦
        </Text>

        <ActivityIndicator />
      </View>
    );
  }

  return (
    <QueryClientProvider client={query}>
      <Stack
        screenOptions={{
          headerTintColor: colors.deep,
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name="auth"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="auth/callback"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="subject/[id]"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="folder/[id]" options={{ headerShown: false }} />

        <Stack.Screen
          name="note/[id]"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="capture"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="settings"
          options={{ title: 'Perfil y ajustes' }}
        />

        <Stack.Screen
          name="search"
          options={{ title: 'Buscar apuntes' }}
        />

        <Stack.Screen
          name="demo"
          options={{ title: 'Demostración' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
