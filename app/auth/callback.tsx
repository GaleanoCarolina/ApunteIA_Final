
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/UI';

type ScreenState =
  | 'loading'
  | 'verified'
  | 'recovery'
  | 'error';

function extractParams(url: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const hash = url.split('#')[1] ?? '';

  const result = new URLSearchParams(query);

  for (const [key, value] of new URLSearchParams(hash)) {
    result.set(key, value);
  }

  return result;
}

export default function AuthCallback() {
  const [status, setStatus] = useState<ScreenState>('loading');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function processLink(url: string | null) {
      if (!url || !active) {
        if (active) {
          setStatus('error');
          setMessage('No se recibió un enlace válido.');
        }
        return;
      }

      try {
        const params = extractParams(url);

        const errorDescription = params.get('error_description');

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenHash = params.get('token_hash');
        const type = params.get('type');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

        } else if (tokenHash && type) {
          if (
            type !== 'recovery' &&
            type !== 'email' &&
            type !== 'signup'
          ) {
            throw new Error('Tipo de verificación no compatible.');
          }

          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });

          if (error) throw error;

        } else {
          throw new Error(
            'El enlace no contiene los datos necesarios. ' +
            'Solicita un correo nuevo.'
          );
        }

        if (!active) return;

        if (type === 'recovery') {
          setStatus('recovery');
        } else {
          setStatus('verified');
          setMessage('Tu correo fue verificado correctamente.');
        }
      } catch (error) {
        if (!active) return;

        setMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo verificar el enlace.'
        );

        setStatus('error');
      }
    }

    Linking.getInitialURL().then(processLink);

    const subscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        setStatus('loading');
        processLink(url);
      }
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  async function changePassword() {
    if (password.length < 8) {
      Alert.alert(
        'Contraseña inválida',
        'Utiliza al menos 8 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Las contraseñas no coinciden',
        'Comprueba los dos campos.'
      );
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      Alert.alert(
        'Contraseña actualizada',
        'Ya puedes acceder a ApunteIA.'
      );

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'No se pudo actualizar',
        error instanceof Error
          ? error.message
          : 'Inténtalo nuevamente.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#F4F9FF',
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: '#0752A1',
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        ApunteIA ✦
      </Text>

      <Card>
        {status === 'loading' && (
          <View style={{ alignItems: 'center', padding: 24 }}>
            <ActivityIndicator size="large" color="#0876D5" />
            <Text style={{ marginTop: 16 }}>
              Verificando tu enlace...
            </Text>
          </View>
        )}

        {status === 'verified' && (
          <View>
            <Text style={{ fontSize: 18, marginBottom: 18 }}>
              {message}
            </Text>
            <Button
              title="Continuar a ApunteIA"
              onPress={() => router.replace('/(tabs)')}
            />
          </View>
        )}

        {status === 'recovery' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
              Nueva contraseña
            </Text>

            <Text style={{ marginVertical: 12 }}>
              Escribe tu nueva contraseña para recuperar
              el acceso a tu cuenta.
            </Text>

            <TextInput
              placeholder="Nueva contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              accessibilityLabel="Nueva contraseña"
              style={{
                borderWidth: 1,
                borderColor: '#C9D8E8',
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                backgroundColor: 'white',
              }}
            />

            <TextInput
              placeholder="Confirmar contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              accessibilityLabel="Confirmar contraseña"
              style={{
                borderWidth: 1,
                borderColor: '#C9D8E8',
                borderRadius: 12,
                padding: 14,
                marginBottom: 18,
                backgroundColor: 'white',
              }}
            />

            <Button
              title="Guardar contraseña"
              onPress={changePassword}
              busy={busy}
            />
          </View>
        )}

        {status === 'error' && (
          <View>
            <Text style={{ color: '#B42318', marginBottom: 18 }}>
              {message}
            </Text>

            <Button
              title="Volver al inicio de sesión"
              onPress={() => router.replace('/auth')}
            />
          </View>
        )}
      </Card>
    </View>
  );
}
