import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
export default function TabsLayout() { return <Tabs screenOptions={{ tabBarActiveTintColor: colors.blue, tabBarStyle: { height: 66,
  paddingBottom: 8 },
  headerShown: false }}><Tabs.Screen name="index" options={{ title: 'Inicio',
  tabBarIcon: ({ color }) => <Ionicons color={color} size={23} name="home-outline"/> }}/><Tabs.Screen name="subjects" options={{ title: 'Materias',
  tabBarIcon: ({ color }) => <Ionicons color={color} size={23} name="book-outline"/> }}/><Tabs.Screen name="scan" options={{ title: 'Escanear',
  tabBarIcon: ({ color }) => <Ionicons color={color} size={33} name="scan-circle"/> }}/><Tabs.Screen name="library" options={{ title: 'Biblioteca',
  tabBarIcon: ({ color }) => <Ionicons color={color} size={23} name="albums-outline"/> }}/><Tabs.Screen name="study" options={{ title: 'Estudiar',
  tabBarIcon: ({ color }) => <Ionicons color={color} size={23} name="school-outline"/> }}/></Tabs>;
  }
