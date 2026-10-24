import React from 'react';
import { Text, Pressable, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button, Heading, Sub } from '@/components/UI';
import { ItemRow } from '@/components/Modern';
import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';
import { listNotes, listSubjects, syncPending } from '@/lib/data';
import { colors } from '@/theme';
const links: [
    string,
    React.ComponentProps<typeof Ionicons>['name'],
    string
][] = [['Materias', 'book-outline', '/(tabs)/subjects'], ['Biblioteca', 'albums-outline', '/(tabs)/library'], ['Buscar', 'search-outline', '/search'], ['Mi perfil', 'person-outline', '/settings']];
export default function Home() {
    const subjects = useLoad(listSubjects, []), notes = useLoad(() => listNotes(), []);
    useFocusReload(subjects.reload);
    useFocusReload(notes.reload);
    return <Screen>
 <View style={{ backgroundColor: '#0876D5', borderRadius: 25, padding: 23, gap: 9 }}><Text style={{ color: '#D5EBFF', fontSize: 13, fontWeight: '700' }}>TU ASISTENTE DE ESTUDIO</Text><Text style={{ color: 'white', fontWeight: '900', fontSize: 30 }}>ApunteIA ✦</Text><Text style={{ color: '#E8F4FF', fontSize: 15 }}>Aprende mejor, una página a la vez.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/capture')} style={{ backgroundColor: 'white', borderRadius: 16, padding: 15, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Ionicons name="camera-outline" size={23} color={colors.deep}/><Text style={{ color: colors.deep, fontWeight: '800', fontSize: 16 }}>Escanear apunte</Text></Pressable></View>
 <View style={{ flexDirection: 'row', gap: 10 }}>{[[subjects.data?.filter(s => !s.archived).length ?? 0, 'Materias'], [notes.data?.length ?? 0, 'Apuntes'], [notes.data?.filter(n => n.processing_status !== 'completado').length ?? 0, 'Pendientes']].map(([count, title]) => <View key={title} style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', borderRadius: 18, paddingVertical: 17, gap: 5 }}><Text style={{ fontSize: 24, fontWeight: '900', color: colors.deep }}>{count}</Text><Text style={{ fontSize: 12, color: colors.muted }}>{title}</Text></View>)}</View>
 <Heading>Accesos rápidos</Heading><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{links.map(([label, icon, url]) => <Pressable key={label} style={{ width: '48%', backgroundColor: 'white', borderRadius: 18, minHeight: 84, padding: 16, gap: 9 }} onPress={() => router.push(url as never)}><Ionicons name={icon} size={25} color={colors.blue}/><Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{label}</Text></Pressable>)}</View>
 <Heading>Apuntes recientes</Heading>{notes.loading && <ActivityIndicator />}{notes.error && <Sub>{notes.error}</Sub>}{notes.data?.slice(0, 5).map(n => <ItemRow key={n.id} title={n.title} icon="document-text-outline" subtitle={n.processing_status === 'completado' ? 'Listo para estudiar' : n.processing_status} onPress={() => router.push(`/note/${n.id}`)}/>)}{notes.data?.length === 0 && <Sub>Aún no hay apuntes. Fotografía tu primera hoja para comenzar.</Sub>}
 <Button secondary title="Sincronizar pendientes" onPress={() => { void syncPending().then(n => { alert(`${n} elementos sincronizados`); void subjects.reload(); void notes.reload(); }).catch(e => alert(String(e))); }}/><Button secondary title="Demostración para clase" onPress={() => router.push('/demo')}/>
 </Screen>;
}
