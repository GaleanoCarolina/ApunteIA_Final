
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s } from './UI';

export function Screen({ children }: {
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.body}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
