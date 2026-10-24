
import React from 'react';

import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { colors as c } from '@/theme';

export function Heading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text style={s.h}>
      {children}
    </Text>
  );
}

export function Sub({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text style={s.sub}>
      {children}
    </Text>
  );
}

export function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  secondary,
  busy,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || busy}
      onPress={onPress}
      style={[
        s.button,
        secondary && s.secondary,
        (disabled || busy) && {
          opacity: .6,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator
          color={secondary ? c.blue : c.white}
        />
      ) : (
        <Text
          style={[
            s.bt,
            secondary && {
              color: c.blue,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View>
      <Text style={s.label}>
        {label}
      </Text>

      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[
          s.input,
          multiline && {
            height: 125,
            textAlignVertical: 'top',
          },
        ]}
      />
    </View>
  );
}

export const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: c.bg,
  },

  body: {
    padding: 18,
    gap: 16,
    paddingBottom: 95,
  },

  h: {
    fontWeight: '800',
    fontSize: 24,
    color: c.text,
  },

  sub: {
    fontSize: 14,
    color: c.muted,
    lineHeight: 21,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 17,
    gap: 11,
    borderWidth: 1,
    borderColor: '#E5EEF6',
    elevation: 1,
  },

  button: {
    minHeight: 49,
    borderRadius: 15,
    backgroundColor: c.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  secondary: {
    backgroundColor: c.light,
  },

  bt: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 14,
    color: c.text,
    minHeight: 48,
    fontSize: 16,
  },

  item: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: c.border,
  },

  itemTitle: {
    color: c.text,
    fontWeight: '700',
    fontSize: 17,
  },

  pill: {
    backgroundColor: c.light,
    padding: 12,
    borderRadius: 14,
  },

  hero: {
    backgroundColor: c.blue,
    padding: 25,
    paddingTop: 38,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
});
